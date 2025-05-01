from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import faiss
import threading
import hashlib

app = FastAPI()

# Number of user preferences = number of dimensions in the vector = 12 (temporarily)
DIM = 8

# Higher values = more accuracy/slower
# Lower values = less accuracy/faster
M = 32

# The default amount of user ids to return for query_matches
DEFAULT_K = 100

# HNSW indexing - mapping our own ids (userIds) to vectors
index = faiss.IndexIDMap(faiss.IndexHNSWFlat(DIM, M))

# Lock for thread-safe FAISS modifications
faiss_lock = threading.Lock()

# Data models
class UserVector(BaseModel):
    user_id: str
    vector: list[float]

class UserVectorBulk(BaseModel):
    user_vectors: list[UserVector]

class QueryVector(BaseModel):
    vector: list[float]
    top_k: int = DEFAULT_K

# In-memory mappings, TODO how we store these will need to be updated when we have more users
id_to_user = {}  # Maps integer IDs to original user_id strings
user_to_id = {}  # Maps original user_id strings to integer IDs
user_vectors = {} # Stores original user vectors for comparison of which values were missing

# Convert GUID into int id
def string_to_int_id(s: str) -> int:
    if s in user_to_id:
        return user_to_id[s]
    
    int_id = int(hashlib.sha256(s.encode()).hexdigest(), 16) % (10**12)
    
    counter = 1
    while int_id in id_to_user:
        modified_s = f"{s}_{counter}"
        int_id = int(hashlib.sha256(modified_s.encode()).hexdigest(), 16) % (10**12)
        counter += 1

    user_to_id[s] = int_id
    id_to_user[int_id] = s
    
    return int_id

# Convert int id into GUID
def int_id_to_string(int_id: int) -> str:
    return id_to_user.get(int_id)

# Add a user id with their preferences as a 12 dimentional vector
@app.post("/add_user_vector")
def add_user_vector(user: UserVector):
    if len(user.vector) != DIM:
        raise HTTPException(status_code=400, detail="Invalid vector size")
    
    user_vectors[user.user_id] = user.vector
    
    # Convert user_id (str) → stable int using hash
    hashed_id = string_to_int_id(user.user_id)
    
    vec_np = np.array([user.vector], dtype='float32')
    index.add_with_ids(vec_np, np.array([hashed_id]))
    
    return {
        "message": f"User {user.user_id} added",
        "hashed_id": hashed_id
    }

# Load all user vectors into FAISS index in a thread-safe manner
@app.post("/load_all_user_vectors")
def load_all_user_vectors(payload: UserVectorBulk):
    print("Test load all user vectors")
    with faiss_lock:
        index.reset()

        user_ids = []
        vectors = []

        user_vectors.clear()

        for user in payload.user_vectors:
            if len(user.vector) != DIM:
                raise HTTPException(status_code=400, detail=f"Invalid vector size for user {user.user_id}")
            
            user_vectors[user.user_id] = user.vector
            
            # Convert user_id (str) → stable int using hash
            hashed_id = string_to_int_id(user.user_id)
            user_ids.append(hashed_id)
            vectors.append(user.vector)

        vec_np = np.array(vectors).astype('float32')
        ids_np = np.array(user_ids, dtype='int64')

        print(vec_np)

        index.add_with_ids(vec_np, ids_np)

    return {"message": "All user vectors have been loaded into FAISS"}

# Query the top k matches for a given user's preferences
# @app.post("/query_matches")
# def query_vector(q: QueryVector):
#     vec_np = np.array([q.vector]).astype('float32')
#     scores, ids = index.search(vec_np, q.top_k)
#     user_ids = [int_id_to_string(int_id) for int_id in ids[0]]

#     # Replace max float32 values with -1
#     max_float32 = np.finfo(np.float32).max
#     cleaned_scores = np.where(scores[0] == max_float32, -1, scores[0])

#     return {"user_ids": user_ids, "scores": cleaned_scores.tolist()}

@app.post("/query_matches")
def query_vector(q: QueryVector):
    query_vec = np.array([q.vector]).astype('float32')
    
    # Replace -1 in query_vec with 0 for initial search
    search_vec = np.where(query_vec == -1, 0, query_vec).astype('float32')
    
    # Get more results than requested to account for filtering
    k_extra = min(q.top_k * 3, index.ntotal)
    if k_extra == 0:  # Handle empty index case
        return {"user_ids": [], "scores": []}
        
    scores, ids = index.search(search_vec, k_extra)
    
    # Post-process and penalize results with missing values
    results = []
    for i, id_val in enumerate(ids[0]):
        if id_val == -1:
            continue
            
        user_id = int_id_to_string(int(id_val))
        if not user_id:
            continue
        
        score = float(scores[0][i])
        
        # Get the user's vector from in-memory storage
        if user_id in user_vectors:
            user_vector = user_vectors[user_id]
            
            # Count missing values (-1) in the user's vector
            missing_count = sum(1 for val in user_vector if val == -1)
            
            # Apply penalty based on missing values
            # 10% penalty per missing value (adjust as needed)
            penalty = max(0, 1.0 - (missing_count * 0.1))
            adjusted_score = score * penalty
        else:
            adjusted_score = score
        
        results.append({
            "user_id": user_id,
            "score": float(adjusted_score)
        })
    
    # Sort by custom score and return top_k
    results.sort(key=lambda x: x["score"])
    results = results[:q.top_k]
    
    # Return native Python lists, not numpy arrays
    return {
        "user_ids": [r["user_id"] for r in results],
        "scores": [r["score"] for r in results]
    }

# Clear FAISS memory for development and testing
@app.post("/clear")
def reset_index():
    index.reset()
    return {"message": "FAISS index has been reset"}
