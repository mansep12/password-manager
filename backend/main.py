from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from sqlmodel import SQLModel
from routers import user, group, password, shared
app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include routers
app.include_router(user.router)
app.include_router(group.router)
app.include_router(password.router)
app.include_router(shared.router)


# Initialize database
from models.user import User
from models.group import Group
from models.password import Password
from models.group_user import GroupUser
from models.shared import Shared


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(bind=engine)  # Automatically create tables

@app.get("/")
def read_root():
    return {"message": "Welcome to the Password Manager API"}
