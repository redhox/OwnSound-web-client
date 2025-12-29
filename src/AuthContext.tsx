// AuthContext.tsx
import { createContext, useContext, useState } from "react";

type User = {
  id: number
  username: string
  email?: string
}

type AuthContextType = {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalGetToken: (() => string | null) | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  )

  function login(token: string, user: User) {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  globalGetToken = () => token

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


// Hook pour composants React
// Hook pour composants React
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Fonction globale pour récupérer le token dans n’importe quel fichier
export function getToken(): string | null {
  if (!globalGetToken) return null;
  return globalGetToken();
}
