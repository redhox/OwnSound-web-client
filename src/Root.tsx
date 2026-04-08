// Root.tsx
import { AuthProvider, useAuth } from "./AuthContext";
import App from "./App";
import Login from "./Login";
import SignUp from "./SignUp";
import { useState, useEffect } from "react";
import PasswordResetView from "./PasswordResetView";

function Gate() {
  const { token: authToken, user } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rToken = params.get("reset_token");
    if (rToken) {
      setResetToken(rToken);
      setAuthView("reset");
    }
  }, []);

  if (authToken && user) return <App />;

  if (authView === "signup") {
    return <SignUp onBackToLogin={() => setAuthView("login")} />;
  }

  if (authView === "forgot" || authView === "reset") {
    return (
      <PasswordResetView 
        token={resetToken} 
        onBackToLogin={() => {
          setAuthView("login");
          setResetToken(null);
          // Clean URL
          window.history.replaceState({}, document.title, "/");
        }} 
      />
    );
  }

  return (
    <Login 
      onSuccess={() => {}} 
      onToggleView={() => setAuthView("signup")} 
      onToggleForgot={() => setAuthView("forgot")}
    />
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
