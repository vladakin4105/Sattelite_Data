import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Session, select

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://GEO_USER:parola@db:5432/todo_db")

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

app = FastAPI(title = "Geo APP")

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
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


# --- Startup ---
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- Endpoints ---
@app.post("/users",response_model=User)
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    username = payload.username.strip()
    if username.lower() == "guest":
        raise HTTPException(status_code=400, detail="Username 'guest' is reserved.")
    statement = select(User).where(User.username == username)
    existing = session.exec(statement).first()
    if existing:
        return existing
    user = User(username=username)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/users/{username}", response_model=User)
def get_user(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/{username}/coords", response_model=CoordCreate, status_code=201)
def add_coord_for_user(username: str, coord: CoordCreate, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db_coord = Coordinate(user_id=user.id, x1=coord.x1, y1=coord.y1, x2=coord.x2, y2=coord.y2)
    session.add(db_coord)
    session.commit()
    session.refresh(db_coord)

    return coord



@app.get("/users/{username}/coords", response_model = List[CoordCreate])
def list_coords_for_user(username: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    coords = session.exec(select(Coordinate).where(Coordinate.user_id == user.id)).all()
    # convert to response model list
    return [CoordCreate(x1=c.x1, y1=c.y1, x2=c.x2, y2=c.y2) for c in coords]