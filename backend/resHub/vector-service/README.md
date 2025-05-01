# FAISS Local Setup - First Time
0. Ensure python is installed on your machine.
1. cd into backend/reshub/vector-service
2. Run 'python -m venv venv' to create a virtual environment.
3. Run 'venv\Scripts\activate' to enter the virtual environment. You should see '(venv)' appear at the beginning of your terminal prompt.
4. Run 'pip install -r requirements.txt' to install dependencies.
5. Run 'uvicorn main:app --reload' to start FAISS. You should see 'INFO: Application startup complete.' if the it is successful.
6. Visit the local link it is running on (default seems to be http://127.0.0.1:8000) at the docs endpoint, e.g. 'http://127.0.0.1:8000/docs'.

You may now run FAISS commands from this site or via curl/Postman. It stores memory locally until you restart it using uvicorn, or until you clear it using the /clear endpoint.

# FAISS Reminder On How to Run
If you've completed the first time setup previously but have forgotten how to run FAISS, simply follow steps 1 and 3-6 above.

# FAISS in ResHub Ultimate Guide
## FAISS File Structure
    backend/reshub/vector-service/main.py
    Handles the API logic, including the /query endpoint for finding similar users.

    backend/reshub/.../Services/FaissService.java
    Sends HTTP requests from the backend to the FAISS API to add vectors, sync data, and query matches.

    backend/reshub/.../Schedulers/FaissScheduler.java
    Runs every 5 minutes to refresh the index with updated user data and remove deleted users.

## Refresh Cycle
Because we are using HNSW indexing, which does not allow us to remove or update vectors, FAISS refreshes its user information every 5 minutes. This allows us to:
- Remove deleted users
- Update modified user preferences
- Clear up any issues or incontinuities with the data

## Querying cards
We use the 'query_matches' endpoint to get the top k matching users for a given user vector. This occurs every time the user card data reloads, whether that be when the app loads, when the cache refreshes, or when the user manually refreshes.

FAISS not updating vectors is not a problem in this case because the current user's updated user vector is always passed in to be compared with other vectors. So the user will always see the best matches, even if they just updated their profile. Its just that other matching users may not see that user near the top until the FAISS refresh occurs.

## Preference Weights
Prefernces are all assigned a weight, which is currently stored in backend/reshub/.../Constants/Preferences.java.

At the moment, when a user does not have any value for a preference, this preference is not considered in the calculation and is counted as a penalty towards the overall score. This may need to be changed later due to memory restrictions.

## Bug fixes + TODO
- Deletion: When a user is deleted, they can still be swiped on until FAISS refreshes. We need to ensure this does not cause any errors on the backend. Not sure how we should handle this yet, since if we dont record the swipe at all the user has a chance to re-appear.
    (Maybe store the deleted userIds in memory and filter them out in getProfiles, then clear this array on refresh)
- Weights: The weights for each preference need to be tested and updated to ensure they are actually useful indicators.
- Pagination: Right now we are querying 100 profiles and giving them to the user in order. We need to add the capability for the user to swipe past all of these users and then be given more (if available).
- Liked/LastTimeActive: Due to the changes, sorting by whether the user has liked the current user and how recently active the user was does not work properly. If used now I believe it will essentially overwrite the FAISS sorting. We need to take the 100 userIds that are output and modify the score based on these factors, then re-sort these 100 cards.

# FAISS Endpoints
## POST /add_user_vector
    Description: Adds a new user to FAISS memory as a vector
    Input (JSON):
        {
            "user_id": 123,                         // The user's id
            "vector": [0.1, 0.2, 0.3, ..., 0.12]    // The user's preferences normalized as a 12 dimentional vector
        }
    Expected output (JSON):
        {
            "message": "User 123 added"             // On success
        }

## POST /query_matches
    Description: Finds the k most similar users based on a given vector.
    Input (JSON):
        {
            "vector": [0.1, 0.2, 0.3, ..., 0.12],   // The user's preferences normalized as a 12 dimentional vector
            "top_k": 100                            // The number of matching users you want returned
        }
    Expected output (JSON):
        {
            "ids": [123, 456, 789, ...],            // The k user ids of the matching users in order of similarity
            "scores": [0.98, 0.95, 0.93, ...]       // List of similarity scores corresponding to the user IDs; higher score = more similarity
        }

## POST /clear
    Description: Clears FAISS memory - for development and testing purposes
    Input:
        None
    Expected output (JSON):
        {
            "message": "FAISS memory cleared"       // On success
        }