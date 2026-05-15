const BASE_URL = "http://localhost:5555";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });


  if (!res.ok) {
    // try to parse error message, but don't crash if body isn't JSON
    let message = "Something went wrong.";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // response wasn't JSON, use status text instead
      message = res.statusText || message;
    }
    throw new Error(message);
  }

  return res.json();
}

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (username, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request("/auth/logout", { method: "DELETE" }),

  me: () => request("/auth/me"),
};

// ── Stations ─────────────────────────────────────────────
export const stationsAPI = {
top: (page = 1, limit = 20) =>
  request(`/stations/top?page=${page}&limit=${limit}`),

search: (q, page = 1, limit = 20) =>
  request(`/stations/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  byGenre: (genre, page = 1) => request(`/stations/genre/${encodeURIComponent(genre)}?page=${page}`),

  byCountry: (code, page = 1) => request(`/stations/country/${code}?page=${page}`),

  tags: () => request("/stations/tags"),

  countries: () => request("/stations/countries"),
};

// ── Favorites ─────────────────────────────────────────────
export const favoritesAPI = {
  getAll: () => request("/favorites"),

  add: (station) =>
    request("/favorites/add", {
      method: "POST",
      body: JSON.stringify({
        station_uuid: station.stationuuid,
        station_name: station.name,
        station_url: station.url_resolved,
        station_favicon: station.favicon,
        station_tags: station.tags,
        station_country: station.country,
      }),
    }),

  remove: (stationUuid) =>
    request(`/favorites/remove/${stationUuid}`, { method: "DELETE" }),

  check: (stationUuid) => request(`/favorites/check/${stationUuid}`),
};