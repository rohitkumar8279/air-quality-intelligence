from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import backend.models as models
import backend.schemas as schemas
from backend.database import get_db
from backend.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/preferences", response_model=schemas.UserPreferenceResponse)
def get_user_preferences(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    prefs = db.query(models.Preference).filter(models.Preference.user_id == current_user.id).first()
    if not prefs:
        prefs = models.Preference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

@router.put("/preferences", response_model=schemas.UserPreferenceResponse)
def update_user_preferences(
    prefs_in: schemas.UserPreferenceBase, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    prefs = db.query(models.Preference).filter(models.Preference.user_id == current_user.id).first()
    if not prefs:
        prefs = models.Preference(user_id=current_user.id)
        db.add(prefs)
        
    for var, value in vars(prefs_in).items():
        setattr(prefs, var, value) if value else None
        
    db.commit()
    db.refresh(prefs)
    return prefs

@router.get("/favorites")
def get_favorite_cities(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(models.FavoriteCity).filter(models.FavoriteCity.user_id == current_user.id).all()
    return [{"id": f.id, "city_name": f.city_name} for f in favs]

@router.post("/favorites")
def add_favorite_city(city_name: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.FavoriteCity).filter(
        models.FavoriteCity.user_id == current_user.id, 
        models.FavoriteCity.city_name == city_name
    ).first()
    
    if existing:
        return {"msg": "Already a favorite"}
        
    fav = models.FavoriteCity(user_id=current_user.id, city_name=city_name)
    db.add(fav)
    db.commit()
    return {"msg": "Added to favorites", "city_name": city_name}

@router.delete("/favorites/{city_name}")
def remove_favorite_city(city_name: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    fav = db.query(models.FavoriteCity).filter(
        models.FavoriteCity.user_id == current_user.id, 
        models.FavoriteCity.city_name == city_name
    ).first()
    
    if not fav:
        raise HTTPException(status_code=404, detail="City not found in favorites")
        
    db.delete(fav)
    db.commit()
    return {"msg": "Removed from favorites"}
