import { useState } from "react";
import { useAuth } from "@/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchLogin } from "@/api/user";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login({ 
  onSuccess,
  onToggleView,
  onToggleForgot,
}: { 
  onSuccess: () => void;
  onToggleView: () => void;
  onToggleForgot: () => void;
}) {
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
    <ThemeProvider storageKey="data-theme" defaultTheme="dark">
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
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
              <Button type="submit" className="w-full">
                Connexion
              </Button>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="ghost" className="w-full text-xs" onClick={onToggleView}>
                  Pas encore de compte ? Créer un compte
                </Button>
                <Button type="button" variant="link" className="w-full text-xs text-muted-foreground" onClick={onToggleForgot}>
                  Mot de passe oublié ?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
