# Personal AI Chess Coach — Backend (Phase 1)

FastAPI backend for chess game analysis. Upload a PGN, get back accuracy scores, blunder detection, and phase-by-phase breakdown powered by Stockfish.

---

## Requirements

- Python 3.11+
- Docker + Docker Compose
- Stockfish installed on your machine

### Install Stockfish

**Ubuntu / Debian**
```bash
sudo apt install stockfish
which stockfish  # copy this path into .env
```

**macOS**
```bash
brew install stockfish
which stockfish
```

**Windows**
Download from https://stockfishchess.org/download/ and note the `.exe` path.

---

## Setup

### 1. Clone and create virtual environment

```bash
cd chess_coach
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set `STOCKFISH_PATH` to your Stockfish binary path.

### 3. Start PostgreSQL and Redis

```bash
docker-compose up -d
```

Wait for both containers to be healthy:
```bash
docker-compose ps
```

### 4. Run database migrations

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 5. Start the FastAPI server

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Start the Celery worker (separate terminal)

```bash
celery -A app.worker.celery_app worker --loglevel=info --concurrency=2
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/games/upload` | Upload PGN for analysis |
| `GET` | `/api/v1/games/{id}/status` | Poll processing status |
| `GET` | `/api/v1/games/{id}/report` | Get accuracy + blunder report |
| `GET` | `/api/v1/games/{id}/moves` | Get all evaluated moves |
| `DELETE` | `/api/v1/games/{id}` | Delete game and all data |
| `GET` | `/health` | Health check |

Interactive docs available at: http://localhost:8000/docs

---

## Example Usage

### Upload a game

```bash
curl -X POST http://localhost:8000/api/v1/games/upload \
  -H "Content-Type: application/json" \
  -d '{
    "pgn": "[Event \"Test\"]\n[White \"Magnus\"]\n[Black \"Hikaru\"]\n[Result \"1-0\"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 1-0"
  }'
```

Response:
```json
{
  "game_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending",
  "message": "Game queued for analysis."
}
```

### Poll status

```bash
curl http://localhost:8000/api/v1/games/{game_id}/status
```

### Get report (once status is "done")

```bash
curl http://localhost:8000/api/v1/games/{game_id}/report
```

Response:
```json
{
  "accuracy_white": 87.4,
  "accuracy_black": 72.1,
  "blunders_white": 0,
  "blunders_black": 2,
  "mistakes_white": 1,
  "mistakes_black": 1,
  "inaccuracies_white": 3,
  "inaccuracies_black": 4,
  "avg_centipawn_loss_white": 18.5,
  "avg_centipawn_loss_black": 42.3,
  "phase_breakdown": {
    "opening": {"white_acpl": 10.2, "black_acpl": 15.0},
    "middlegame": {"white_acpl": 22.1, "black_acpl": 55.6},
    "endgame": {"white_acpl": null, "black_acpl": null}
  }
}
```

---

## Project Structure

```
chess_coach/
├── app/
│   ├── main.py                    # FastAPI app + lifespan
│   ├── config.py                  # Settings from .env
│   ├── database.py                # Async SQLAlchemy engine
│   ├── models/
│   │   └── game.py                # Game, Move, GameReport ORM models
│   ├── schemas/
│   │   └── game.py                # Pydantic request/response schemas
│   ├── api/routes/
│   │   └── games.py               # All game endpoints
│   ├── services/
│   │   ├── pgn_parser.py          # PGN parsing with python-chess
│   │   ├── stockfish_service.py   # Stockfish evaluation wrapper
│   │   ├── feature_extractor.py   # Per-move feature extraction
│   │   └── report_builder.py      # Accuracy + blunder report logic
│   └── worker/
│       ├── celery_app.py          # Celery configuration
│       └── tasks.py               # process_game async task
├── alembic/                       # Database migrations
├── docker-compose.yml             # PostgreSQL + Redis
├── requirements.txt
└── .env.example
```

---

## Notes

- Processing time scales with game length and `STOCKFISH_DEPTH`. Depth 18 takes ~1-3 seconds per move.
- Lower `STOCKFISH_DEPTH` to 10-12 for faster processing during development.
- Celery `--concurrency=2` runs 2 parallel workers. Each worker holds one Stockfish process. Do not exceed your CPU core count.
- The `features` JSONB column on each move stores extended data (material balance, king safety, pawn structure, center control) for future ML model use.
