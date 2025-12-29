// api/auth.ts
export async function fetchLogin(email: string, password: string) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });
  
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status}`);
      }
  
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("fetchLogin failed:", err);
      throw err;
    }
  }
  