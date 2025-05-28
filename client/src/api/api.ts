// src/api.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchMessage = async () => {
    try {
      console.log("API_BASE", API_BASE)
      console.log("fetching message, is prod",import.meta.env.PROD)
      console.log("fetching message, is dev",import.meta.env.DEV)
      const res = await fetch(`${API_BASE}/api/frontend/main`);
      console.log(res);
      return await res.text();
    } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
    }
  };
