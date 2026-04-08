import { useEffect, useState } from "react";
import { useAuth } from "@/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Key, AlertCircle, CheckCircle2, Trash2, Copy, Check, RefreshCw } from "lucide-react";
import {
  changeUsername,
  changePassword,
  setUserRole,
  getUserAll,
  deleteSelfAccount,
  adminDeleteUser,
  fetchGenerateToken,
} from "@/api/user";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
};

export default function UserManagementView() {
  const { user, token } = useAuth();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminMsg, setAdminMsg] = useState("");

  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChangeUsername = async () => {
    if (!newUsername || !token) return;
    try {
      const data = await changeUsername(token!, newUsername);
      setStatusMsg({ type: "success", text: `Nom mis à jour: ${data.username}` });
      setNewUsername("");
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Erreur: ${err.message}` });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !token) return;
    try {
      await changePassword(token!, newPassword);
      setStatusMsg({ type: "success", text: "Mot de passe mis à jour avec succès" });
      setNewPassword("");
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Erreur: ${err.message}` });
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user?.role]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const data = await getUserAll(token!);
      setUsers(data.users);
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId: string, role: "user" | "admin") => {
    try {
      await setUserRole(token!, userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  const handleDeleteSelf = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    try {
      await deleteSelfAccount(token!);
      window.location.href = "/login"; // Logout
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Erreur: ${err.message}` });
    }
  };

  const handleAdminDeleteUser = async (userId: string) => {
    if (!token) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur #${userId} ? Cette action est irréversible.`)) return;
    try {
      await adminDeleteUser(token!, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  const handleGenerateToken = async () => {
    setIsLoadingToken(true);
    setTokenError("");
    setGeneratedToken("");
    try {
      const data = await fetchGenerateToken(token!);
      setGeneratedToken(data.token || data.registration_token || "");
      if (!data.token && !data.registration_token) {
        setTokenError("Erreur: Aucun token retourné par le serveur.");
      }
    } catch (err: any) {
      setTokenError(`Erreur lors de la génération: ${err.message}`);
    } finally {
      setIsLoadingToken(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-500 py-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres du compte</h2>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Profil
          </TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" /> Administration
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Informations personnelles
                </CardTitle>
                <CardDescription>Mettez à jour votre nom d'utilisateur public.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                   <p className="text-xs font-medium text-muted-foreground">Nom d'utilisateur actuel</p>
                   <p className="font-bold">{user?.username}</p>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Nouveau nom d'utilisateur"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-muted/30 border-muted-foreground/20"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border/40 py-3">
                <Button onClick={handleChangeUsername} size="sm" className="ml-auto">Sauvegarder</Button>
              </CardFooter>
            </Card>

            <Card className="border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" /> Sécurité
                </CardTitle>
                <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Nouveau mot de passe"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-muted/30 border-muted-foreground/20"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border/40 py-3">
                <Button onClick={handleChangePassword} variant="secondary" size="sm" className="ml-auto">Mettre à jour</Button>
              </CardFooter>
            </Card>

            <Card className="border-border/40 shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" /> Zone de danger
                </CardTitle>
                <CardDescription>Supprimez définitivement votre compte et toutes ses données.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Une fois votre compte supprimé, il n'y a pas de retour en arrière possible. Vos favoris, vos playlists et votre historique seront définitivement supprimés.
                </p>
              </CardContent>
              <CardFooter className="bg-destructive/5 border-t border-destructive/10 py-3">
                <Button onClick={handleDeleteSelf} variant="destructive" size="sm" className="ml-auto">Supprimer mon compte</Button>
              </CardFooter>
            </Card>
          </div>

          {statusMsg.text && (
            <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-sm ${
              statusMsg.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}>
              {statusMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">{statusMsg.text}</p>
            </div>
          )}
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="admin" className="mt-6 space-y-6">
            <Card className="border-border/40 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border/40">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Invitation Utilisateur
                </CardTitle>
                <CardDescription>
                  Générez un jeton d'inscription à usage unique pour permettre à un nouvel utilisateur de créer son compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleGenerateToken} 
                      disabled={isLoadingToken}
                      className="gap-2 rounded-full"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingToken ? "animate-spin" : ""}`} />
                      Générer un jeton
                    </Button>
                  </div>

                  {generatedToken && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm font-medium text-muted-foreground">Jeton d'inscription généré :</p>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/40 font-mono text-sm break-all relative group">
                        <span className="flex-1">{generatedToken}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={copyToClipboard}
                          className="shrink-0 h-8 w-8"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Ce jeton est confidentiel et permet l'accès à la création de compte.
                      </p>
                    </div>
                  )}

                  {tokenError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                      <Key className="w-4 h-4 shrink-0" />
                      {tokenError}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/5 border-t border-border/40 text-[11px] text-muted-foreground">
                Note: Les jetons expirent généralement après une utilisation ou une période définie par le serveur.
              </CardFooter>
            </Card>

            <Card className="border-border/40 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Liste des utilisateurs</CardTitle>
                  <CardDescription>Gérez les comptes et les droits d'accès des utilisateurs.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadUsers}>Rafraîchir</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border/40">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead className="w-20 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                          <TableCell className="font-medium">{u.username}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                           <TableCell>
                            <Select
                                value={u.role}
                                onValueChange={(val: "user" | "admin") => handleRoleChange(u.id, val)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Utilisateur</SelectItem>
                                  <SelectItem value="admin">Administrateur</SelectItem>
                                </SelectContent>
                              </Select>
                           </TableCell>
                           <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                               onClick={() => handleAdminDeleteUser(u.id)}
                                disabled={String(u.id) === String(user?.id)} // Don't let admin delete themselves here to avoid mistakes (they can use the profile tab instead)
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                           </TableCell>
                         </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {adminMsg && <p className="text-sm text-destructive mt-4">{adminMsg}</p>}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
