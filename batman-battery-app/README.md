# Batman Battery 24/7 — Dispatch App

A mobile-first web application for **Batman Battery 24/7**, a 24/7 mobile car and motorcycle battery service in Cebu, Philippines.

## Features

**Customer side**
- Submit a request in seconds — name, phone, vehicle, issue type
- Automatic GPS location capture with a draggable map pin for correction
- Live tracking page (`/track/:id`) — status updates in real time
- 5-star rating after job completion

**Admin / Dispatcher side**
- Secure login at `/admin/login` (Firebase Email/Password Auth)
- Live map (Leaflet/OpenStreetMap) with a color-coded pin per active request
- Request list with newest-first ordering and status badges
- Full detail panel: customer info, tap-to-call, vehicle, notes, mini map, Google Maps link
- Technician assignment (dropdown from a hardcoded list)
- Status transitions: pending → assigned → on the way → arrived → done
- History tab for completed/cancelled requests
- Stats: requests today, average completion time

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | react-router-dom |
| Backend | Firebase (Firestore + Auth) |
| Map | Leaflet + react-leaflet (OpenStreetMap tiles) |
| Icons | lucide-react |

## Getting started

### 1. Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (the free Spark plan is sufficient)
3. Enable **Firestore Database** — start in test mode initially
4. Enable **Authentication → Email/Password** sign-in method
5. Go to **Project settings → General → Your apps → Web** and copy the config

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### 3. Create the admin account

In Firebase console → **Authentication → Users → Add user**, create one admin account (email + password). This is what you'll use to log in at `/admin/login`.

### 4. Set Firestore security rules

In Firebase console → **Firestore → Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /requests/{requestId} {
      // Anyone can create (customers don't need to sign in)
      allow create: if true;

      // Only authenticated admins can read and update
      // ⚠️ Before production: add more specific admin checks here
      allow read, update: if request.auth != null;
    }
  }
}
```

> **⚠️ Before going live:** tighten the rules further — e.g., restrict which users can update (by UID), and prevent customers from updating status fields.

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Routes

| URL | Who | What |
|-----|-----|------|
| `/` | Customer | Request form |
| `/track/:id` | Customer | Live status tracking |
| `/admin/login` | Admin | Login page |
| `/admin` | Admin (auth required) | Dispatch dashboard |

## Data model

```
requests (Firestore collection)
├── id                   auto-generated
├── customerName         string
├── customerPhone        string
├── vehicle              { make, model, plate }
├── issueType            "jumpstart" | "replacement" | "unsure"
├── notes                string, optional
├── location             { lat, lng, accuracy }
├── addressText          string, optional
├── status               "pending" | "assigned" | "en_route" | "arrived" | "completed" | "cancelled"
├── assignedTechnician   string, optional
├── createdAt            server timestamp
├── updatedAt            server timestamp
├── completedAt          server timestamp, optional
└── rating               number 1-5, optional
```

## Future work (not in v1)

- **SMS notifications** — Twilio or a local Philippine SMS gateway to notify the customer and technician on status changes
- **Push notifications** — Firebase Cloud Messaging for real-time browser/mobile alerts
- **Payment integration** — GCash / PayMaya payment links after job completion
- **Technician app** — A richer mobile app for technicians with turn-by-turn navigation
- **Multi-admin / role management** — Different permission levels (dispatcher, manager, owner)
- **Analytics dashboard** — Revenue per technician, jobs per day/week, heatmap of service areas
- **Repeat customer recognition** — Look up a phone number to pre-fill the form for returning customers

## Project structure

```
src/
├── components/
│   ├── common/          # Button, Input, StatusBadge, StatusStepper, LoadingSpinner
│   ├── customer/        # RequestForm, LocationPicker, RatingControl
│   └── admin/           # DispatchMap, RequestList, RequestCard, RequestDetailPanel
├── pages/               # CustomerRequestPage, CustomerTrackPage, AdminLoginPage, AdminDashboardPage
├── hooks/               # useGeolocation, useRequest, useRequestsList
├── services/            # firebase.js, requestService.js (all Firestore I/O here)
├── context/             # AuthContext.jsx
└── utils/               # statusConfig.js (single source of truth), formatTime.js
```
