
export const fetchMessage = async () => {
    try {
      console.log("url",`${import.meta.env.VITE_API_BASE_URL}/api/frontend/main`)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/frontend/main`);
      console.log(res);
      return await res.text();
    } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
    }
  };
