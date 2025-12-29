// Root.tsx
import { AuthProvider, useAuth } from "./AuthContext";
import App from "./App";
import Login from "./Login";

function Gate() {
  const { token } = useAuth();
  return token ? <App /> : <Login />;
}

export default function Root() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
