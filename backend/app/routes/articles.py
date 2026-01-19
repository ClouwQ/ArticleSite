from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.article import Article
from ..schemas.article import ArticleRead
from ..services.file_service import read_markdown_content


router = APIRouter(prefix="/api", tags=["articles"])


@router.get("/articles", response_model=List[ArticleRead])
async def list_published_articles(db: Session = Depends(get_db)):
    return (
        db.query(Article)
        .filter(Article.is_published.is_(True))
        .order_by(Article.created_at.desc())
        .all()
    )


@router.get("/articles/{article_id}", response_model=ArticleRead)
async def get_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article or not article.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.get(
    "/articles/{article_id}/content", response_class=PlainTextResponse
)
async def get_article_content(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article or not article.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    if not article.content_markdown_path:
        return ""

    return read_markdown_content(article.content_markdown_path)
