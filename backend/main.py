import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Session, select

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://GEO_USER:parola@db:5432/todo_db")

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

app = FastAPI(title="Geo APP")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB Models ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, sa_column_kwargs={"unique": True})


class Coordinate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    x1: float
    y1: float
    x2: float
    y2: float


# --- Pydantic (request) models ---
class UserCreate(BaseModel):
    username: str


class CoordCreate(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


# --- DB utils ---
def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise


def get_session():
    with Session(engine) as session:
        yield session


# --- Startup ---
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# --- Health check endpoint ---
@app.get("/")
def read_root():
    return {"message": "Geo APP is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


# --- Endpoints ---
@app.post("/users", response_model=User)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    try:
        username = payload.username.strip()
        if not username:
            raise HTTPException(status_code=400, detail="Username cannot be empty")
            
        if username.lower() == "guest":
            raise HTTPException(status_code=400, detail="Username 'guest' is reserved.")
            
        statement = select(User).where(User.username == username)
        existing = session.exec(statement).first()
        if existing:
            print(f"User {username} already exists, returning existing user")
            return existing
            
        user = User(username=username)
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"Created new user: {username}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/users/{username}", response_model=User)
def get_user(username: str, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/users/{username}/coords", response_model=CoordCreate, status_code=201)
def add_coord_for_user(username: str, coord: CoordCreate, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        db_coord = Coordinate(user_id=user.id, x1=coord.x1, y1=coord.y1, x2=coord.x2, y2=coord.y2)
        session.add(db_coord)
        session.commit()
        session.refresh(db_coord)
        print(f"Added coordinate for user {username}: {coord}")
        
        return coord
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding coordinate: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/users/{username}/coords", response_model=List[CoordCreate])
def list_coords_for_user(username: str, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        coords = session.exec(select(Coordinate).where(Coordinate.user_id == user.id)).all()
        result = [CoordCreate(x1=c.x1, y1=c.y1, x2=c.x2, y2=c.y2) for c in coords]
        print(f"Retrieved {len(result)} coordinates for user {username}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error listing coordinates: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/test")
def test_endpoint():
    return {"message": "API is working", "timestamp": "2025"}