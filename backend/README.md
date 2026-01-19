# SSOTB Backend

FastAPI backend for the SSOTB platform.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env  # then edit SECRET_KEY in .env
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Admin login (default): `admin` / `admin123`

The SQLite database file `ssotb.db` will be created automatically in the backend root.

Uploads are stored under `uploads/` and served at `/uploads/`.
