import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchRegister } from "@/api/user";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUp({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regToken, setRegToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    setIsLoading(true);
    setError("");
    try {
      await fetchRegister({
        username,
        email,
        password,
        token: regToken
      });
      setSuccess(true);
      setTimeout(() => onBackToLogin(), 3000);
    } catch (err: any) {
      setError("Échec de l'inscription. Vérifiez vos informations et votre jeton.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemeProvider storageKey="data-theme" defaultTheme="dark">
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm border-border/40 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
            <CardDescription className="text-center">
              Entrez vos informations pour vous inscrire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-center font-medium">Compte créé avec succès ! Redirection...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Jeton d'invitation (Token)"
                    value={regToken}
                    onChange={(e) => setRegToken(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                  </div>
                )}
                <Button className="w-full" onClick={handleRegister} disabled={isLoading}>
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </>
            )}
          </CardContent>
          {!success && (
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs" onClick={onBackToLogin}>
                Déjà un compte ? Se connecter
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ThemeProvider>
  );
}
