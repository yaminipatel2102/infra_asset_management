**VIDEO LINK**
https://drive.google.com/file/d/1UOReCdDlniRM6OdewuZXTgdPHn-N_YDh/view?usp=sharing


# R&B Asset Lifecycle Management System
> **Roads & Buildings (R&B) Department - Government of Gujarat**
> Real-Time End-to-End Infrastructure Asset Inventory, Digital Asset Passport, Explainable Risk Assessment Engine, Inspection & Work Order Management System.

---

## 📌 Executive Overview

The **R&B Asset Lifecycle Management System** is a production-grade full-stack web application built to track and manage state infrastructure assets (Roads, Bridges, Government Buildings) across their entire operational lifecycle. 

It provides decision-makers and division engineers with:
1. **Centralized Digital Asset Inventory** with real-time PostgreSQL database persistence.
2. **Digital Asset Passport** containing structural specs, inspection logs, maintenance history, and a complete chronological lifecycle timeline.
3. **Transparent Explainable Risk Engine** that scores assets (0–100) based on Condition (40%), Age (20%), Criticality (20%), and Maintenance History (20%).
4. **Maintenance Priority Matrix** automatically ordering high-risk infrastructure requiring immediate intervention.
5. **Work Order Management** supporting status transitions (`PENDING` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `COMPLETED`) with **Before & After Photo Evidence Verification**.
6. **GIS Map View** powered by Leaflet with color-coded markers (Green = Good, Yellow = Moderate, Orange = High Risk, Red = Critical).
7. **Governance Reports & CSV Export** for executive audits.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with custom glassmorphism design system & dark mode governance aesthetic
- **Icons:** Lucide React
- **Charts:** Recharts
- **GIS Map:** Leaflet & React-Leaflet
- **Animations / Micro-Interactions:** Canvas-Confetti

### Backend
- **Runtime:** Node.js with TypeScript & Express
- **Database:** PostgreSQL (v17)
- **ORM:** Prisma Client (v5)
- **API Architecture:** RESTful JSON APIs with transaction safety & structured error handling

---

## 🗄️ Database Schema (Prisma & PostgreSQL)

The database schema is defined in `backend/prisma/schema.prisma`:

- `Asset`: Core infrastructure model (`assetCode`, `name`, `assetType`, `district`, `location`, `latitude`, `longitude`, `constructionDate`, `currentCondition`, `criticality`, `responsibleDivision`, `status`).
- `RoadDetails`: Subtype extension for roads (`roadLength`, `roadCategory`, `surfaceType`).
- `BridgeDetails`: Subtype extension for bridges (`bridgeLength`, `bridgeType`, `numberOfLanes`).
- `BuildingDetails`: Subtype extension for buildings (`buildingType`, `numberOfFloors`, `builtUpArea`).
- `Inspection`: Field audit logs (`inspectionDate`, `inspectorName`, `condition`, `observations`, `recommendedAction`, `photoUrl`).
- `Maintenance`: Work orders (`issue`, `priority`, `action`, `assignedTo`, `expectedCompletionDate`, `actualCompletionDate`, `cost`, `status`, `beforePhotoUrl`, `afterPhotoUrl`).
- `LifecycleEvent`: Chronological audit trail (`eventType`, `eventDate`, `description`, `performedBy`).
- `RiskAssessment`: Stored explainable risk score calculations (`conditionScore`, `ageScore`, `criticalityScore`, `maintenanceScore`, `totalRiskScore`, `riskLevel`).

---

## ⚡ Risk Engine Formula

The system uses a transparent, explainable scoring algorithm (0–100 points):

$$\text{Total Risk Score} = \text{Condition (40\%)} + \text{Age (20\%)} + \text{Criticality (20\%)} + \text{Maintenance (20\%)}$$

- **Condition Score (Max 40):** GOOD = 5, MODERATE = 20, POOR = 32, CRITICAL = 40.
- **Age Score (Max 20):** 0–5 yrs = 4, 6–15 yrs = 8, 16–30 yrs = 14, >30 yrs = 20.
- **Criticality Score (Max 20):** LOW = 5, MEDIUM = 10, HIGH = 15, VERY_HIGH = 20.
- **Maintenance Score (Max 20):** Active CRITICAL order = 20, HIGH = 15, MEDIUM = 10, LOW = 5, None = 0.

### Risk Levels:
- **0 – 24:** `LOW`
- **25 – 49:** `MEDIUM`
- **50 – 74:** `HIGH`
- **75 – 100:** `CRITICAL`

---

## 🚀 Quick Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+) & npm
- PostgreSQL database running on `localhost:5432`

### 2. Environment Setup
Copy `.env.example` to `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rnb_asset_db?schema=public"
NODE_ENV=development
```

### 3. Database Migration & Seeding
From the `backend` directory:
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
```

### 4. Running Application
Start backend and frontend concurrently:

**Backend:**
```bash
cd backend
npm run dev
# Backend API will start on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Web App will start on http://localhost:3000
```

---

## 📡 REST API Documentation

### Assets API
- `GET /api/assets`: Search, filter & sort asset inventory.
- `GET /api/assets/:id`: Fetch Digital Asset Passport details.
- `POST /api/assets`: Register a new asset with subtype specifications.
- `PUT /api/assets/:id`: Update asset specifications or condition.
- `DELETE /api/assets/:id`: Remove asset record.

### Inspections API
- `GET /api/inspections`: Fetch all inspection logs.
- `POST /api/inspections`: Record field inspection, update asset condition & trigger automated risk recalculation.

### Maintenance API
- `GET /api/maintenance`: Fetch work orders.
- `POST /api/maintenance`: Create maintenance work order.
- `PUT /api/maintenance/:id`: Update status (`IN_PROGRESS`, `COMPLETED`) and attach before/after photos.

### Dashboard & Reports API
- `GET /api/dashboard/stats`: Aggregated database statistics & priority table.
- `GET /api/reports/summary`: District breakdown metrics.
- `GET /api/reports/export-csv`: Download CSV export of inventory.

---

## 📽️ Demo Flow Verification

1. **Dashboard Overview:** Displays live PostgreSQL stats for 21 Gujarat assets across Ahmedabad, Surat, Vadodara, Rajkot, Kutch, etc.
2. **Asset Inventory Filter:** Filter by Category = `BRIDGE` and Condition = `CRITICAL`.
3. **Digital Asset Passport:** Inspect `BRG-SRT-102` or `BRG-KTC-106` to review specs, risk breakdown, inspection history, maintenance, and lifecycle timeline.
4. **Record Inspection:** Log a field inspection; observe real-time risk score recalculation.
5. **Priority Matrix:** Verify asset moves to the top of priority rankings.
6. **Work Order & Evidence:** Issue work order, transition to `COMPLETED`, view before/after photo evidence lightbox.
7. **Lifecycle Timeline:** Verify newly logged lifecycle events in database audit history.
