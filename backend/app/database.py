"""Database setup with SQLAlchemy."""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# Render provides `postgres://` but SQLAlchemy 1.4+ requires `postgresql://`
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False for FastAPI
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Dialect-specific engine arguments
engine_kwargs = {
    "connect_args": connect_args,
    "pool_pre_ping": True,
}

# Only apply performance pooling for real databases (PostgreSQL/MySQL)
if not db_url.startswith("sqlite"):
    engine_kwargs.update({
        "pool_size": 2,
        "max_overflow": 5,
        "pool_recycle": 300,
    })

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    
    # Check and dynamically add missing columns (specifically abha_verified)
    from sqlalchemy import text
    try:
        # Check if abha_verified exists
        with engine.connect() as conn:
            conn.execute(text("SELECT abha_verified FROM medical_info LIMIT 1;"))
    except Exception:
        # If it throws, the column does not exist
        try:
            print("🚀 Dynamically adding column 'abha_verified' to 'medical_info' table...")
            with engine.begin() as conn:
                # DEFAULT 0 is safe for SQLite (0) and Postgres (FALSE)
                conn.execute(text("ALTER TABLE medical_info ADD COLUMN abha_verified BOOLEAN DEFAULT 0;"))
            print("✅ Successfully added 'abha_verified' column.")
        except Exception as e:
            print(f"⚠️ Failed to dynamically add 'abha_verified' column: {e}")
