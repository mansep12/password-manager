from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings  # Import the settings from config.py

# Use the database URL from the environment or default to SQLite
DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
