export const getAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token || typeof token !== "string" || token === "undefined") return null;
    return token;
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  try {
    if (token && typeof token === "string") {
      localStorage.setItem("authToken", token);
    }
  } catch {}
};

export const removeAuthToken = () => {
  try {
    localStorage.removeItem("authToken");
  } catch {}
};
