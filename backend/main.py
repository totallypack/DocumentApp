# backend/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil

app = FastAPI()

# Configure CORS to allow requests from your React frontend
origins = [
    "http://localhost:3000",  # React app URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.join(os.getcwd(), "uploads")

# Ensure the uploads directory exists
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

@app.get("/documents")
def list_documents(folder: str = ""):
    folder_path = os.path.join(BASE_DIR, folder)
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")
    
    items = os.listdir(folder_path)
    files = [item for item in items if os.path.isfile(os.path.join(folder_path, item))]
    folders = [item for item in items if os.path.isdir(os.path.join(folder_path, item))]
    
    return {"files": files, "folders": folders}

@app.post("/create-folder")
def create_folder(folderName: str):
    folder_path = os.path.join(BASE_DIR, folderName)
    if os.path.exists(folder_path):
        raise HTTPException(status_code=400, detail="Folder already exists")
    os.makedirs(folder_path)
    return {"message": "Folder created successfully"}

@app.delete("/delete-file")
def delete_file(file: str):
    file_path = os.path.join(BASE_DIR, file)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(file_path)
    return {"message": "File deleted successfully"}

@app.post("/upload")
async def upload_file(folder: str = "", file: UploadFile = File(...)):
    folder_path = os.path.join(BASE_DIR, folder)
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")
    
    file_location = os.path.join(folder_path, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "File uploaded successfully", "filename": file.filename}

@app.post("/clear-chat")
def clear_chat():
    # Implement your chat clearing logic here
    return {"message": "Chat history cleared!"}
