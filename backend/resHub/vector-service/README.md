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