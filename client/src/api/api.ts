
export const fetchMessage = async () => {
    try {
      console.log("url",`${import.meta.env.VITE_API_BASE_URL}/api/frontend/main`)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/frontend/main`);
      console.log(res);
      return res.json();
    } catch (err) {
      console.error("Fetch failed fetchMessage:", err);
      throw err;
    }
  };


  export const fetchTest = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/frontend/test`);
      console.log(res);
      return res.json();
    } catch (err) {
      console.error("Fetch failed fetchTest:", err);
      throw err;
    }
  };


  export const fetchBenchmark = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/frontend/benchmark`);
      console.log(res);
      return res.json();
    } catch (err) {
      console.error("Fetch failed fetchBenchmark:", err);
      throw err;
    }
  };
