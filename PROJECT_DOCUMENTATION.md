# 🚑 ResQ — Project Comprehensive Documentation

## 1. Project Vision
**ResQ** is an AI-powered emergency response ecosystem designed to bridge the critical information gap during medical emergencies. When a person is unconscious or incapacitated, first responders often lack access to vital medical history, allergies, or emergency contacts. ResQ uses physical identifiers (QR codes and NFC tags) to instantly unlock this data and automatically alert family members with the victim's exact location.

### The Problem it Solves:
- **Rescuer Information Gap**: Rescuers don't know a patient's blood type, allergies (like Penicillin), or pre-existing conditions (like Diabetes/Heart issues).
- **Communication Delay**: It can take hours to identify a victim and notify their family. ResQ does this in seconds.
- **Location Precision**: Finding a victim in remote or crowded areas is difficult. ResQ provides high-precision GPS and What3Words coordinates.
- **Language/Complexity Barriers**: AI-generated summaries help non-medical bystanders understand the situation quickly.

---

## 2. Core Features & Technology Mapping

| Feature | Description | Technology Used |
| :--- | :--- | :--- |
| **Interactive 3D Landing** | Premium, high-energy entry point with interactive 3D Mesh backgrounds. | **React, Three.js, Framer Motion** |
| **Dynamic QR Generation** | Personal cryptographic QR codes for stickers, cards, or badges. | **qrcode.react, Canvas API** |
| **NFC Smart Tagging** | Program physical stickers/bracelets via phone to link to your profile. | **Web NFC API, NDEFReader** |
| **Multi-Channel Alerts** | Instant SMS, WhatsApp, and Email notification to all emergency contacts. | **Twilio (SMS/WA), SMTP/Gmail API** |
| **AI Medical Insights** | AI-generated risk predictions and medical history summaries for rescuers. | **Google Gemini AI 1.5 Pro** |
| **Live Location Tracking** | Real-time GPS coordinates + Google Maps integration + What3Words. | **Leaflet, Google Maps API, What3Words API** |
| **PWA (Get App)** | Installable mobile experience for instant access on the go. | **Service Workers, Manifest.json (PWA)** |
| **ABHA Health Sync** | Integration with official Indian Health IDs for verified medical data. | **Custom API Integration** |
| **Incident History** | Detailed logs of every scan, including location and responder interactions. | **FastAPI, PostgreSQL (Neon)** |
| **Premium Dashboard** | Dark-mode "Midnight Aurora" analytics suite for health monitoring. | **Recharts, Glassmorphism CSS** |

---

## 3. Detailed Project Structure

```text
resq-project/
├── backend/                # FastAPI Python Server
│   ├── app/
│   │   ├── models/        # Database Schemas (User, Alert, Contact, Medical)
│   │   ├── routes/        # API Endpoints (Auth, Alerts, Users, AI)
│   │   ├── services/      # Logic (Email, Twilio, Gemini AI, GPS)
│   │   ├── schemas/       # Pydantic Data Validation
│   │   └── main.py        # Application Entry Point
│   ├── api/               # Vercel Deployment Bridge
│   └── requirements.txt   # Backend Dependencies
│
├── frontend/               # React Vite Application
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, MeshBackground, Analytics)
│   │   ├── pages/         # View Pages (Landing, Dashboard, QR, NFC, Scan)
│   │   ├── context/       # State Management (AuthContext)
│   │   └── index.css      # Design System (Midnight Aurora & Sky Blue)
│   ├── public/            # Static Assets (sw.js, manifest.json, Icons)
│   └── package.json       # Frontend Dependencies
│
├── vercel.json           # Global Deployment & Routing Configuration
├── .env.local             # Local Environment Secrets
└── PROJECT_DOCUMENTATION  # This File
```

---

## 4. Why ResQ is Premium?

- **Zero-Friction Access**: No app install required for rescuers. They just scan and see.
- **Hybrid Theme Engine**: A high-energy "Sky Blue" landing page for marketing, and a professional "Midnight Aurora" dark mode for utility.
- **Privacy First**: Data is encrypted using **AES-256** standards, ensuring medical data is only accessible during a verified emergency scan.
- **Global Reach**: Works anywhere in the world with standard internet/mobile coverage.

---

**Designed and Developed to save lives, one scan at a time.**
