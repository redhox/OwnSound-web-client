import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Login from "./Login";
import { AuthProvider, useAuth } from "@/AuthContext";
import "./index.css";

function Root() {
  const { token } = useAuth();
  return token ? <App /> : <Login onSuccess={() => {}} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
