# SafeID Project Architecture

This document provides a 'graphified' view of the SafeID ecosystem, detailing the project structure and how the various components interact.

## 📂 Project Structure

```text
safeid-project/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── models/        # SQLAlchemy Models (User, Medical, Alert, etc.)
│   │   ├── routes/        # API Endpoints (REST)
│   │   ├── schemas/       # Pydantic Validation Schemas
│   │   ├── services/      # Business Logic (Auth, Twilio, OpenAI)
│   │   ├── main.py        # App Entry Point
│   │   └── database.py    # SQL Engine Config
│   └── alembic/           # Migrations (if applicable)
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── api/           # Axios Client
│   │   ├── components/    # Reusable UI Blocks (Navbar, Charts)
│   │   ├── context/       # Auth State
│   │   ├── pages/         # Screen Components
│   │   └── index.css      # Core Design Tokens (Midnight Aurora)
│   └── vite.config.js     # Build Config
└── docs/                  # Documentation
```

## 📊 System Flow

```mermaid
graph TD
    subgraph Frontend
        LB[Landing Page] --> DP[Dashboard]
        DP --> MD[Medical Info]
        DP --> EC[Emergency Contacts]
        DP --> AN[Analytics Dashboard]
        QR[QR Engine] --> SC[Scan Page]
    end

    subgraph Backend
        AU[Auth Service]
        US[User Service]
        AS[Alert Service]
        AI[AI Risk Engine]
        DB[(PostgreSQL/SQLite)]
    end

    AN <--> US
    SC --> AS
    AS --> SMS[Twilio SMS]
    MD --> AI
    AI --> DP
    DP <--> DB
    AU <--> DB

## 🕸️ View & Navigation Graph

This graph illustrates the application's routing architecture, distinguishing between public entry points and protected user areas.

```mermaid
graph LR
    subgraph Public_Zone ["🌍 Public Zone"]
        L[Landing /]
        LG[Login /login]
        RG[Register /register]
        S[Scan /scan/:id]
    end

    subgraph Protected_Vault ["🔒 Protected Vault"]
        D[Dashboard /dashboard]
        P[Profile /profile]
        C[Contacts /contacts]
        Q[QR Engine /qr]
        N[NFC Portal /nfc]
        H[History /history]
    end

    L --> LG
    L --> RG
    LG --> D
    RG --> D
    
    D --> P
    D --> C
    D --> Q
    D --> N
    D --> H
    
    S --> |Trigger Alert| AS[Backend Alert Service]
    
    style Public_Zone fill:rgba(0,242,255,0.05),stroke:var(--accent-cyan)
    style Protected_Vault fill:rgba(204,0,255,0.05),stroke:var(--accent-purple)
```

## 🛠 Technology Stack

- **Frontend**: React, Vite, Recharts, Leaflet, Axios
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **AI/Services**: OpenAI (Risk Prediction), Twilio (Emergency Alerts)
- **Styling**: Vanilla CSS with Design Tokens (Aurora/Glassmorphism)
