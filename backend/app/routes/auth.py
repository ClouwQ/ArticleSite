from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.user import User
from ..schemas.auth import LoginRequest, Token, UserRead
from ..services.auth_service import authenticate_user, create_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token({"sub": user.id, "username": user.username})
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout():
    # Stateless JWT: client is responsible for discarding the token
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserRead)
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user
