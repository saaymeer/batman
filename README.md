# Batman Battery 24/7

A mobile-first web application for **Batman Battery 24/7**, a 24/7 mobile car and motorcycle battery replacement & jumpstart dispatch service based in Cebu, Philippines.

---

## 📁 Repository Structure

This repository is structured as follows:

```
Batman battery/
├── README.md               # Main repository documentation
└── batman-battery-app/     # Frontend React + Vite application
    ├── src/                # Application source code
    ├── public/             # Static assets
    ├── package.json        # Dependencies and NPM scripts
    ├── .env.example        # Environment variable template
    └── README.md           # App-specific documentation
```

---

## ⚡ Quick Start

### 1. Navigate to the app directory
All application code and scripts reside in the `batman-battery-app` folder:

```bash
cd batman-battery-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🛠️ Features

### 🚗 Customer App
- **Quick Request Form:** Submit battery jumpstart or replacement requests with minimal steps.
- **GPS Pinpoint Location:** Auto-detect location with interactive map pin correction.
- **Real-Time Order Tracking:** View live technician status updates at `/track/:id`.
- **Feedback & Rating:** Rate completed services directly from the app.

### 🛡️ Dispatcher / Admin Dashboard
- **Admin Authentication:** Secure Firebase login at `/admin/login`.
- **Live Operations Map:** Interactive Leaflet map with status color-coded markers.
- **Request Management:** Filter, assign technicians, update job statuses (`pending` → `assigned` → `en_route` → `arrived` → `completed`).
- **Quick Actions:** Tap-to-call customers and direct Google Maps navigation links.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State & Backend:** Firebase (Firestore, Authentication)
- **Maps:** Leaflet, React-Leaflet (OpenStreetMap)
- **Icons:** Lucide React

---

## 📜 Available Scripts

Run these inside `batman-battery-app/`:

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Starts Vite dev server on port 5173 |
| Production Build | `npm run build` | Builds app for production |
| Preview | `npm run preview` | Previews production build locally |

---

## 📄 Detailed Documentation

For full setup guidelines including Firebase security rules, database schemas, and feature roadmaps, check out [batman-battery-app/README.md](file:///c:/Users/rigie/OneDrive/Documents/Projects/Batman%20battery/batman-battery-app/README.md).
