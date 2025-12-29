import { useState } from "react";
import { useAuth } from "@/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchLogin } from "@/api/user";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const data = await fetchLogin(email, password);
      if (!data.token) throw new Error();
      login(data.token, data.user);
      onSuccess();
    } catch {
      setError("Email ou mot de passe invalide");
    }
  }

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark">
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="text-sm text-destructive text-center">
                {error}
              </p>
            )}
            <Button className="w-full" onClick={handleLogin}>
              Connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
