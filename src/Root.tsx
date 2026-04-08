// Root.tsx
import { AuthProvider, useAuth } from "./AuthContext";
import App from "./App";
import Login from "./Login";
import SignUp from "./SignUp";
import { useState } from "react";

function Gate() {
  const { token, user } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  if (token && user) return <App />;

  if (authView === "signup") {
    return <SignUp onBackToLogin={() => setAuthView("login")} />;
  }

  return (
    <Login onSuccess={() => {}} onToggleView={() => setAuthView("signup")} />
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
