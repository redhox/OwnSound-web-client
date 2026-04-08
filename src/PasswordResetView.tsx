import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchForgotPassword, fetchResetPassword } from "@/api/user";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";

export default function PasswordResetView({ 
  token: initialToken,
  onBackToLogin 
}: { 
  token?: string | null;
  onBackToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token] = useState<string | null>(initialToken || null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If token is in URL, we are in RESET mode, otherwise FORGOT mode
  const isResetMode = !!token;

  async function handleForgot() {
    setIsLoading(true);
    setError("");
    try {
      const resp = await fetchForgotPassword(email);
      setSuccess(resp.message || "Un lien a été généré.");
    } catch (err) {
      setError("Échec de la demande. Réessayez plus tard.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await fetchResetPassword(token!, password);
      setSuccess("Mot de passe mis à jour ! Redirection vers la connexion...");
      setTimeout(() => onBackToLogin(), 3000);
    } catch (err) {
      setError("Jeton invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemeProvider storageKey="data-theme" defaultTheme="dark">
      <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans antialiased">
        <Card className="w-full max-w-sm border-border/40 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <CardHeader className="space-y-1 bg-primary/5 border-b border-border/40 pb-6">
            <div className="flex justify-center mb-2">
               <div className="p-2 bg-primary/10 rounded-full">
                 <AlertCircle className="w-6 h-6 text-primary" />
               </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {isResetMode ? "Nouveau mot de passe" : "Mot de passe oublié"}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetMode 
                ? "Choisissez votre nouveau mot de passe." 
                : "Entrez votre email pour recevoir un lien de récupération."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            {success ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-center font-medium text-green-600 dark:text-green-400">
                  {success}
                </p>
                {!isResetMode && (
                   <Button variant="outline" className="mt-4 rounded-full" onClick={onBackToLogin}>
                     Retour à la connexion
                   </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isResetMode ? (
                  <>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nouveau mot de passe</label>
                       <Input
                         type="password"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="bg-muted/30 focus:bg-background transition-colors"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirmer le mot de passe</label>
                       <Input
                         type="password"
                         placeholder="••••••••"
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         className="bg-muted/30 focus:bg-background transition-colors"
                       />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Adresse Email</label>
                    <Input
                      type="email"
                      placeholder="nom@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in shake-in duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <Button 
                  className="w-full rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  onClick={isResetMode ? handleReset : handleForgot} 
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isResetMode ? "Mise à jour..." : "Envoi...") 
                    : (isResetMode ? "Réinitialiser" : "Envoyer le lien")}
                </Button>
              </div>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="bg-muted/5 border-t border-border/40 py-4 flex justify-center">
              <Button variant="ghost" size="sm" className="text-xs gap-2 hover:bg-transparent hover:text-primary transition-colors" onClick={onBackToLogin}>
                <ChevronLeft className="w-3 h-3" />
                Retour à la connexion
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ThemeProvider>
  );
}
