# KB Radio — Full Stack Radio Browser App

A full stack web application for discovering, filtering, and saving internet radio stations from around the world. Built with Flask and React.

---

## Tech Stack

**Backend**
- Python / Flask
- Flask-SQLAlchemy (SQLite)
- Flask-Bcrypt (password hashing)
- Flask-CORS
- Radio Browser API (free, public, no key required)

**Frontend**
- React 18 + Vite
- React Router v6
- Component-scoped CSS

---

## Project Structure

```
summative_3/
├── app.py              # App factory
├── config.py           # Flask config
├── run.py              # Entry point
├── models/
│   ├── user.py         # User model
│   └── favorite.py     # Favorite model (caches station metadata)
├── routes/
│   ├── auth.py         # /auth/* routes
│   ├── auth_middleware.py  # @login_required decorator
│   ├── stations.py     # /stations/* proxy routes
│   └── favorites.py    # /favorites/* protected routes
└── client/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   └── client.js       # All fetch calls to Flask
        ├── context/
        │   ├── AuthContext.jsx  # Global auth state + provider
        │   └── useAuth.js      # Auth hook
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StationCard.jsx
        │   ├── PlayerModal.jsx
        │   ├── FilterPanel.jsx
        │   ├── Pagination.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            └── Favorites.jsx
```

---

## Setup & Running Locally

### Backend

```bash
# From the project root
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install flask flask-sqlalchemy flask-bcrypt flask-cors requests
python run.py
```

Flask runs at **http://localhost:5555**. The SQLite database is created automatically on first run.

### Frontend

```bash
# In a separate terminal
cd client
npm install
npm run dev
```

Vite runs at **http://localhost:5173**.

Both servers must be running at the same time.

---

## Features

### Station Discovery
- Loads the top 200 stations by popularity on the home page
- Full text search across 50,000+ stations from the Radio Browser API
- Results update in real time with every search

### Filtering
- Filter by genre tag and country of origin independently
- Filter chips show station counts and update dynamically based on active filters (dependent filtering)
- Chips are horizontally scrollable
- Filters reset automatically on new searches

### Playback
- Click any station card to open a floating player modal
- Audio streams directly in the browser via the HTML5 audio element
- Stream error handling with user-facing messages for unsupported or unavailable streams
- Close with the ✕ button or the Escape key

### Authentication
- Session-based auth (no JWT)
- Passwords hashed and salted with bcrypt
- Register via popup modal on the login page
- Session persists across page refreshes via `/auth/me` check on mount

### Favorites
- Save and remove stations with the ♡ button on any station card
- Favorites page shows all saved stations
- Station metadata (name, URL, favicon, tags, country) is cached locally so favorites load without hitting the external API
- Unauthenticated users see a toast prompt to log in when clicking the favorite button

### Pagination
- Frontend pagination against the full 200-station result set
- Filters and pagination work together correctly — no blank pages

---

## API Reference

### Auth — `/auth`

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | `{username, email, password}` | Register + auto-login |
| POST | `/auth/login` | `{username, password}` | Login |
| DELETE | `/auth/logout` | — | Logout |
| GET | `/auth/me` | — | Current session user |

### Stations — `/stations` (public)

| Method | Route | Params | Description |
|--------|-------|--------|-------------|
| GET | `/stations/top` | `?page=1&limit=20` | Top stations by popularity |
| GET | `/stations/search` | `?q=jazz&page=1&limit=20` | Search by name |
| GET | `/stations/genre/<genre>` | `?page=1` | Filter by genre tag |
| GET | `/stations/country/<code>` | `?page=1` | Filter by country code |
| GET | `/stations/tags` | — | Top 50 genre tags |
| GET | `/stations/countries` | — | All countries |

### Favorites — `/favorites` (session required)

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| GET | `/favorites` | — | All favorites for current user |
| POST | `/favorites/add` | `{station_uuid, station_name, ...}` | Add a favorite |
| DELETE | `/favorites/remove/<uuid>` | — | Remove a favorite |
| GET | `/favorites/check/<uuid>` | — | Check if a station is favorited |

---

## Notes

- Not all stations will play in all browsers. Streams served over `http://` may be blocked by browser security policies. AAC+ streams may not play in Firefox without additional codec support. This is a limitation of the Radio Browser API data, not the application.
- The Radio Browser API is community-maintained and free. Station availability and metadata accuracy may vary.
- `StrictMode` is disabled in `main.jsx` to prevent double-invocation of audio effects in development.