from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import faiss

app = FastAPI()

# Number of user preferences = number of dimensions in the vector = 12 (temporarily)
DIM = 12

# Higher values = more accuracy/slower
# Lower values = less accuracy/faster
M = 32

#HNSW indexing - mapping our own ids (userIds) to vectors
index = faiss.IndexIDMap(faiss.IndexHNSWFlat(DIM, M))

# Data models
class UserVector(BaseModel):
    user_id: int
    vector: list[float]

class QueryVector(BaseModel):
    vector: list[float]
    top_k: int = 100

# Add a user id with their preferences as a 12 dimentional vector
@app.post("/add_user_vector")
def add_user_vector(user: UserVector):
    if len(user.vector) != DIM:
        raise HTTPException(status_code=400, detail="Invalid vector size")
    vec_np = np.array([user.vector]).astype('float32')
    index.add_with_ids(vec_np, np.array([user.user_id]))
    return {"message": f"User {user.user_id} added"}

# Query the top k matches for a given user's preferences
@app.post("/query_matches")
def query_vector(q: QueryVector):
    vec_np = np.array([q.vector]).astype('float32')
    scores, ids = index.search(vec_np, q.top_k)
    return {"ids": ids[0].tolist(), "scores": scores[0].tolist()}

# Clear FAISS memory for development and testing
@app.post("/clear")
def reset_index():
    index.reset()
    return {"message": "FAISS index has been reset"}
