// src/api.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchMessage = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/frontend/main`);
      console.log(res);
      return await res.text();
    } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
    }
  };
