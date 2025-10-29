# Hymn Online - Web Frontend

A React.js web application for Ethiopian Orthodox Church hymn learning and management.

## Features

- **User Authentication**: Register and login with role-based access (Student/Deacon)
- **Student Dashboard**: Fetch and read hymns in multiple languages (English, Amharic, Ge'ez)
- **Deacon Dashboard**: Manage sessions and view all available hymns
- **Session Management**: Real-time session tracking and progress monitoring
- **Multi-language Support**: View hymns in English, Amharic, and Ge'ez

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Project Structure

```
web-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── DeaconDashboard.js
│   │   ├── Login.js
│   │   ├── Navbar.js
│   │   ├── PrivateRoute.js
│   │   ├── Register.js
│   │   └── StudentDashboard.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## API Endpoints Used

- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `GET /api/session/status/` - Get session status
- `POST /api/session/start/` - Start session (Deacon only)
- `POST /api/session/stop/` - Stop session (Deacon only)
- `GET /api/hymns/` - List all hymns
- `GET /api/hymns/next/` - Get next hymn (Student only)
- `POST /api/hymns/finish/` - Mark hymn as read (Student only)

## User Roles

### Student
- Register and login
- Fetch next available hymn
- View hymn in multiple languages
- Mark hymns as read
- Track session progress

### Deacon
- Register and login
- Start and stop sessions
- View all available hymns
- Monitor session progress
- View hymn statistics

## Technologies Used

- React 18
- React Router v6
- Axios
- Context API for state management
- CSS3 for styling
