# SafeID — AI-Powered Emergency QR Response System

> A full-stack emergency response system where users create digital medical profiles linked to QR codes. When scanned by a bystander in an emergency, a web page opens instantly showing critical medical info with a one-click "Notify Family" button.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- Twilio account (for real SMS) or use mock mode

### 1. Clone & Setup Environment

```bash
cd safeid-project
```

Copy `.env` and fill in your API keys (already configured if using the template).

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📁 Project Structure

```
safeid-project/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── config.py     # Settings & env vars
│   │   ├── database.py   # SQLAlchemy setup
│   │   ├── models/       # ORM models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   ├── qr/generated/     # Generated QR images
│   └── requirements.txt
├── frontend/             # React (Vite) frontend
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth state
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Router
│   │   └── index.css     # Design system
│   └── package.json
├── ai-service/           # AI model wrappers
├── .env                  # Environment variables
├── docker-compose.yml
└── README.md
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **QR Emergency Profile** | One scan → instant medical info |
| **Smart SOS Messages** | AI generates context-aware alerts |
| **SMS + WhatsApp Alerts** | Twilio-powered multi-channel |
| **GPS + Google Maps** | Auto location capture & sharing |
| **Voice Commands** | Hands-free "Send Help" |
| **Severity Estimation** | AI classifies: Minor/Moderate/Critical |
| **Risk Prediction** | AI health warnings on dashboard |
| **Anti-Prank Slider** | 5-second confirmation to prevent abuse |
| **SMS Fallback** | Offline fallback code below QR |

---

## 🔥 Core Flow

1. **User registers** → adds medical info + emergency contacts
2. **QR code generated** → contains `http://localhost:3000/scan/{user_id}`
3. **Bystander scans QR** → sees medical info (no app needed)
4. **Clicks "NOTIFY FAMILY"** → GPS captured → confirmation slider
5. **Alert sent** → SMS + WhatsApp to all emergency contacts
6. **AI message** → "🚨 Nishant may need help. Blood: O+. Location: [map link]"

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register user |
| POST | `/auth/login` | ❌ | Login |
| GET | `/user/profile` | ✅ | Get profile |
| POST | `/user/medical` | ✅ | Save medical info |
| GET/POST | `/user/contacts` | ✅ | Manage contacts |
| POST | `/qr/generate` | ✅ | Generate QR code |
| GET | `/scan/{user_id}` | ❌ | Public scan data |
| POST | `/alert/trigger` | ❌ | Send SOS alerts |
| POST | `/ai/risk` | ✅ | Risk prediction |

Full API docs: http://localhost:8000/docs

---

## 🛡️ Security

- JWT authentication for all user endpoints
- Public scan endpoint returns **minimal safe data only** (no phone, no email)
- Rate limiting on scan endpoints
- Anti-prank confirmation slider (5-second hold)
- Bcrypt password hashing
- CORS restricted to frontend origin

---

## 🤖 AI Features (Anthropic Claude)

1. **Smart SOS Message Generator** — AI creates clear, contextualized emergency messages
2. **Severity Estimation** — Classifies: Minor / Moderate / Critical
3. **Voice Input** — Browser Speech API, trigger words: "send help", "emergency"
4. **Risk Prediction** — Personalized health warnings based on medical data

> If no AI key is configured, all features gracefully fallback to template-based alternatives.

---

## 📱 Technologies

- **Frontend**: React 19, Vite 8, React Router
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **AI**: Anthropic Claude API
- **SMS/Calls**: Twilio
- **Maps**: Google Maps Geocoding API
- **QR**: qrcode library (Python)

---

## ☁️ Free Cloud Deployment (Make QR Codes work everywhere!)

If you want your QR codes to be **100% free forever** and **scannable by anyone, anywhere**, you must deploy this application instead of running it on `localhost` or via Ngrok tunnels.

We have prepared the repository for **true free cloud hosting**.

### 1. Host the Backend on Render
1. Create a free account at [Render](https://render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository containing SafeID.
4. Render will automatically detect the `backend/render.yaml` file and deploy your FastAPI backend for free!
5. After deployment, copy your Render URL (e.g., `https://safeid-backend.onrender.com`).

### 2. Host the Frontend on Vercel
1. Create a free account at [Vercel](https://vercel.com).
2. Click **Add New Project**.
3. Import your GitHub repository.
4. In the configuration, set the **Framework Preset** to `Vite` and change the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: `[Your Render Backend URL]` (from step 1)
6. Click **Deploy**.

### 3. Link them together
Once deployed, go back to your Render Dashboard, select your Web Service, go to **Environment**, and add:
- `BASE_URL`: `[Your Vercel URL]`
- `FRONTEND_URL`: `[Your Vercel URL]`
This ensures any NEW QR codes generated by the app will embed the permanent, free Vercel URL, making them scannable natively from any phone without requiring local server connections!

