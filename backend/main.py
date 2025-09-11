# backend/main.py
import os
import re
import logging
from datetime import date, timedelta
from typing import List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Session, select
from passlib.context import CryptContext
from datetime import datetime
# local module (must exist)
from sentinel_process import generate_ndvi_png_bytes
from fastapi import status
import numpy as np
from modis import MODISAnalyzer, main as modis_main



# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("geo-app")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://GEO_USER:parola@db:5432/todo_db")

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

app = FastAPI(title="Geo APP")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- DB Models ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, sa_column_kwargs={"unique": True})
    password_hash: str = Field(default="", sa_column_kwargs={"nullable": False})


class Coordinate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    x1: float
    y1: float
    x2: float
    y2: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


# --- Pydantic (request/response) models ---
class UserCreate(BaseModel):
    username: str

class UserCreateWithPassword(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str

class UserSignIn(BaseModel):
    username: str
    password: str

class CoordCreate(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
class CoordRead(BaseModel):
    id: int
    x1: float
    y1: float
    x2: float
    y2: float
    created_at: datetime


# --- Utilities ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# --- DB utils ---
def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.exception("Error creating database tables")
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
@app.post("/users", response_model=UserRead)
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
            logger.info(f"User {username} already exists, returning existing user")
            return UserRead(id=existing.id, username=existing.username)

        user = User(username=username, password_hash=hash_password(""))
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"Created new user: {username}")
        return UserRead(id=user.id, username=user.username)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error creating user")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/users/{username}", response_model=UserRead)
def get_user(username: str, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserRead(id=user.id, username=user.username)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting user")
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
        logger.info(f"Added coordinate for user {username}: {coord}")
        return coord

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error adding coordinate")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/users/{username}/coords", response_model=List[CoordRead])
def list_coords_for_user(username: str, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        coords = session.exec(select(Coordinate).where(Coordinate.user_id == user.id)).all()
        result = [
            CoordRead(
                id=c.id,
                x1=c.x1,
                y1=c.y1,
                x2=c.x2,
                y2=c.y2,
                created_at=c.created_at
            )
            for c in coords
        ]
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error listing coordinates")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/test")
def test_endpoint():
    return {"message": "API is working", "timestamp": "2025"}


# --- Signup / Signin endpoints ---
USERNAME_MAX_LEN = 30
PWD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{5,}$")


@app.post("/signup", response_model=UserRead, status_code=201)
def signup(payload: UserCreateWithPassword, session: Session = Depends(get_session)):
    username = payload.username.strip()
    password = payload.password or ""

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if len(username) > USERNAME_MAX_LEN:
        raise HTTPException(status_code=400, detail=f"Username cannot exceed {USERNAME_MAX_LEN} characters")
    if username.lower() == "guest":
        raise HTTPException(status_code=400, detail="Username 'guest' is reserved.")
    if not PWD_REGEX.match(password):
        raise HTTPException(status_code=400, detail="Password must be at least 5 characters long, contain at least one uppercase letter, one lowercase letter, and one digit")

    existing = session.exec(select(User).where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = hash_password(password)
    user = User(username=username, password_hash=hashed)
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserRead(id=user.id, username=user.username)


@app.post("/signin", response_model=UserRead)
def signin(payload: UserSignIn, session: Session = Depends(get_session)):
    username = payload.username.strip()
    password = payload.password or ""

    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return UserRead(id=user.id, username=user.username)

@app.delete("/users/{username}/coords/{coord_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coord(username: str, coord_id: int, session: Session = Depends(get_session)):
    """
    Șterge o coordonată specifică a unui user după id.
    """
    try:
        # verifică dacă user-ul există
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # verifică dacă coordonata există și aparține user-ului
        coord = session.exec(
            select(Coordinate).where(Coordinate.id == coord_id, Coordinate.user_id == user.id)
        ).first()
        if not coord:
            raise HTTPException(status_code=404, detail="Coordinate not found")

        # șterge coordonata
        session.delete(coord)
        session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting coordinate")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# --- NDVI endpoints ---

def _validate_and_order_bbox(bbox: Tuple[float, float, float, float]) -> Tuple[float, float, float, float]:
    x1, y1, x2, y2 = bbox
    # basic bounds check
    for lon in (x1, x2):
        if lon < -180 or lon > 180:
            raise HTTPException(status_code=400, detail="Longitude out of range [-180,180]")
    for lat in (y1, y2):
        if lat < -90 or lat > 90:
            raise HTTPException(status_code=400, detail="Latitude out of range [-90,90]")

    lon_min, lon_max = sorted([x1, x2])
    lat_min, lat_max = sorted([y1, y2])

    # reject extremely large bbox (safety)
    max_span_deg = max(lon_max - lon_min, lat_max - lat_min)
    if max_span_deg > 5.0:  # arbitrary safety cap (5 degrees)
        raise HTTPException(status_code=400, detail="Requested bbox too large. Please request a smaller area.")

    return (lon_min, lat_min, lon_max, lat_max)


@app.get("/users/{username}/coords/ndvi", response_class=Response)
def get_latest_coords_ndvi(
    username: str,
    start: Optional[str] = Query(None, description="ISO date string yyyy-mm-dd"),
    end: Optional[str]   = Query(None, description="ISO date string yyyy-mm-dd"),
    resolution: int = Query(60, ge=1, le=120),
    session: Session = Depends(get_session)
):
    """
    Returneaza PNG NDVI (image/png) pentru ultima coordonata salvata pentru user.
    Query params:
      - start, end (ISO date strings). If omitted, defaults to last 31 days (end=today, start=end-31).
      - resolution (meters): default 60
    """
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    coord = session.exec(
        select(Coordinate).where(Coordinate.user_id == user.id).order_by(Coordinate.id.desc())
    ).first()

    if not coord:
        raise HTTPException(status_code=404, detail="No coordinates found")

    bbox = (coord.x1, coord.y1, coord.x2, coord.y2)
    try:
        bbox = _validate_and_order_bbox(bbox)
    except HTTPException:
        raise

    # compute time interval defaults
    try:
        if end:
            end_date = date.fromisoformat(end)
        else:
            end_date = date.today()
        if start:
            start_date = date.fromisoformat(start)
        else:
            start_date = end_date - timedelta(days=31)
        time_interval = (start_date.isoformat(), end_date.isoformat())
    except Exception as e:
        logger.exception("Invalid date parameters")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    try:
        png_bytes = generate_ndvi_png_bytes(
            bbox_wgs84=bbox,
            time_interval=time_interval,
            resolution=resolution,
        )
    except Exception as e:
        logger.exception("Error generating NDVI PNG")
        raise HTTPException(status_code=500, detail=f"NDVI generation failed: {str(e)}")

    return Response(content=png_bytes, media_type="image/png")


@app.post("/ndvi", response_class=Response)
def ndvi_for_bbox(payload: dict = Body(...)):
    """
    Generate NDVI PNG for a provided bbox without saving anything.
    Body example:
      {
        "bbox": [x1,y1,x2,y2],
        "start": "2024-07-01",    # optional
        "end": "2024-07-30",      # optional
        "resolution": 60          # optional
      }
    """
    try:
        bbox_raw = payload.get("bbox")
        if not bbox_raw or len(bbox_raw) != 4:
            raise HTTPException(status_code=400, detail="Payload must include bbox: [x1,y1,x2,y2]")
        bbox = tuple(map(float, bbox_raw))
        bbox = _validate_and_order_bbox(bbox)

        resolution = int(payload.get("resolution", 60))
        end = payload.get("end")
        start = payload.get("start")

        if end:
            end_date = date.fromisoformat(end)
        else:
            end_date = date.today()
        if start:
            start_date = date.fromisoformat(start)
        else:
            start_date = end_date - timedelta(days=31)
        time_interval = (start_date.isoformat(), end_date.isoformat())

        png_bytes = generate_ndvi_png_bytes(bbox_wgs84=bbox, time_interval=time_interval, resolution=resolution)
        return Response(content=png_bytes, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in /ndvi")
        raise HTTPException(status_code=500, detail=f"NDVI generation failed: {str(e)}")
    
    # --- MODIS analysis endpoint ---
    # --- MODIS Land Cover classes mapping (MCD12Q1 v6) ---
MODIS_LC_CLASSES = {
    0: "Water Bodies",
    1: "Evergreen Needleleaf Forests",
    2: "Evergreen Broadleaf Forests",
    3: "Deciduous Needleleaf Forests",
    4: "Deciduous Broadleaf Forests",
    5: "Mixed Forests",
    6: "Closed Shrublands",
    7: "Open Shrublands",
    8: "Woody Savannas",
    9: "Savannas",
    10: "Grasslands",
    11: "Permanent Wetlands",
    12: "Croplands",
    13: "Urban and Built-Up",
    14: "Cropland/Natural Vegetation Mosaic",
    15: "Snow and Ice",
    16: "Barren or Sparsely Vegetated",
    17: "Unclassified"
}


@app.get("/modis")
def get_modis_analysis(
    x1: float = Query(..., description="Longitude minimum"),
    y1: float = Query(..., description="Latitude minimum"),
    x2: float = Query(..., description="Longitude maximum"),
    y2: float = Query(..., description="Latitude maximum")
):
    """
    Return a summary of land cover classes (MODIS MCD12) for the selected bounding box.
    Currently uses dummy raster; replace raster_mock with real MODIS dataset extraction later.
    """
    # Validate bbox
    if not (-180 <= x1 <= 180 and -180 <= x2 <= 180 and -90 <= y1 <= 90 and -90 <= y2 <= 90):
        raise HTTPException(status_code=400, detail="Coordinates out of valid range")
    
    # Swap if necessary to ensure min < max
    lon_min, lon_max = sorted([x1, x2])
    lat_min, lat_max = sorted([y1, y2])
    
    bbox = (lon_min, lat_min, lon_max, lat_max)

    analyzer, stats = modis_main(bbox=bbox)
    if analyzer is None or stats is None:
        raise HTTPException(
            status_code=500, 
            detail="MODIS analysis failed - could not retrieve data for the specified region"
        )
    
    analysis = {
        "land_cover_stats": stats,
        "legend_html": analyzer._create_legend_html()
    }
    # --- Dummy raster for now ---
    # In real implementation, replace with MODIS raster extraction for bbox
    raster_mock = np.random.randint(0, 18, size=(100, 100))  # 100x100 pixels, codes 0-17
    
    # Count occurrences of each MODIS class
    unique, counts = np.unique(raster_mock, return_counts=True)
    total_pixels = counts.sum()
    
    analysis = {}
    for code, count in zip(unique, counts):
        desc = MODIS_LC_CLASSES.get(code, f"Unknown class {code}")
        pct = round(count / total_pixels * 100)
        analysis[desc] = f"{pct}%"
    
    

    return {
        "bbox": [lon_min, lat_min, lon_max, lat_max],
        "analysis": stats
    }
