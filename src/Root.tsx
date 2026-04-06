// Root.tsx
import { AuthProvider, useAuth } from "./AuthContext";
import App from "./App";
import Login from "./Login";
import SignUp from "./SignUp";
import { useState } from "react";

function Gate() {
  const { token } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  if (token) return <App />;

  return authView === "login" ? (
    <Login onSuccess={() => {}} onToggleView={() => setAuthView("signup")} />
  ) : (
    <SignUp onBackToLogin={() => setAuthView("login")} />
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
