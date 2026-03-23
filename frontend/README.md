# Chess Coach AI — Frontend

Next.js frontend for the Personal AI Chess Coach backend. Upload a PGN, watch it process, and get a full analysis dashboard with accuracy scores, blunder detection, board viewer, and move-by-move breakdown.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **react-chessboard** — interactive board viewer
- **chess.js** — FEN position reconstruction

---

## Prerequisites

1. The backend must be running at `http://localhost:8000`
   - See `../chess_coach/README.md` for backend setup
2. Node.js 18+

---

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # already included as .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Change this to your deployed backend URL if running in the cloud (Codespaces, Railway, etc.).

---

## Features

| Feature | Description |
|---------|-------------|
| PGN Upload | Paste any valid PGN, click Analyze |
| Live polling | Status updates every 2 seconds until done |
| Accuracy cards | Per-player accuracy + average centipawn loss |
| Error summary | Blunders, mistakes, inaccuracies side by side |
| Phase breakdown | Opening / middlegame / endgame ACPL per player |
| Moves table | Full move list with color-coded error highlighting |
| Board viewer | Interactive board with move navigation, best-move arrows, and square highlights |

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx        # Root layout + fonts
│   ├── page.tsx          # Main page (routing between states)
│   └── globals.css       # Tailwind + CSS variables
├── components/
│   ├── UploadPanel.tsx       # PGN input form
│   ├── ProcessingScreen.tsx  # Loading state with progress steps
│   ├── GameDashboard.tsx     # Tab container for results
│   ├── ui/
│   │   └── ErrorPanel.tsx
│   ├── report/
│   │   ├── AccuracyCard.tsx
│   │   ├── BlunderSummary.tsx
│   │   ├── PhaseBreakdown.tsx
│   │   └── MovesTable.tsx
│   └── board/
│       └── BoardViewer.tsx   # Chessboard + move navigation
├── hooks/
│   └── useGameAnalysis.ts    # Upload → poll → fetch state machine
├── lib/
│   └── api.ts                # All backend API calls
├── types/
│   └── index.ts              # Shared TypeScript types
├── .env.local
└── package.json
```

---

## User Flow

```
Paste PGN → Submit → Upload API → Poll /status → Done
                                              ↓
                              Fetch /report + /moves
                                              ↓
                              Dashboard: Overview | Moves | Board
```
