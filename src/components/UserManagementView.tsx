import { useEffect, useState } from "react";
import { useAuth } from "@/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  changeUsername,
  changePassword,
  setUserRole,
  getUserAll,
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

  const handleChangeUsername = async () => {
    if (!newUsername) return;
    try {
      const data = await changeUsername(token, newUsername);
      setStatusMsg({ type: "success", text: `Nom mis à jour: ${data.username}` });
      setNewUsername("");
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Erreur: ${err.message}` });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    try {
      await changePassword(token, newPassword);
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
    try {
      const data = await getUserAll(token);
      setUsers(data.users);
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId: string, role: "user" | "admin") => {
    try {
      await setUserRole(token, userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
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
                        <TableHead className="text-right">Rôle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">#{u.id}</TableCell>
                          <TableCell className="font-medium">{u.username}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={u.role}
                              onValueChange={(val: "user" | "admin") => handleRoleChange(u.id, val)}
                            >
                              <SelectTrigger className="w-32 ml-auto h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
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
