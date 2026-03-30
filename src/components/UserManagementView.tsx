import { useEffect, useState } from "react";
import { useAuth } from "@/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [statusMsg, setStatusMsg] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminMsg, setAdminMsg] = useState("");

  // --- USER ---
  const handleChangeUsername = async () => {
    if (!newUsername) return;
    try {
      const data = await changeUsername(token, newUsername);
      setStatusMsg(`Nom mis à jour: ${data.username}`);
    } catch (err: any) {
      setStatusMsg(`Erreur: ${err.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    try {
      await changePassword(token, newPassword);
      setStatusMsg("Mot de passe mis à jour");
    } catch (err: any) {
      setStatusMsg(`Erreur: ${err.message}`);
    }
  };

  // --- ADMIN ---
  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUserAll(token);
      setUsers(data.users);
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  const handleRoleChange = async (
    userId: string,
    role: "user" | "admin"
  ) => {
    try {
      await setUserRole(token, userId, role);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role } : u
        )
      );
      setAdminMsg(`Rôle mis à jour pour ${userId}`);
    } catch (err: any) {
      setAdminMsg(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-3xl p-4">
      <h2 className="text-lg font-bold">Mon compte</h2>

      <div className="flex flex-col space-y-2 max-w-md">
        <Input
          placeholder="Nouveau nom d'utilisateur"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <Button onClick={handleChangeUsername}>
          Changer le nom
        </Button>

        <Input
          placeholder="Nouveau mot de passe"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={handleChangePassword}>
          Changer le mot de passe
        </Button>

        {statusMsg && (
          <div className="text-sm text-muted-foreground">
            {statusMsg}
          </div>
        )}
      </div>

      {user?.role === "admin" && (
        <>
          <h2 className="text-lg font-bold mt-6">
            Administration des utilisateurs
          </h2>

          <table className="w-full border">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(
                          u.id,
                          e.target.value as "user" | "admin"
                        )
                      }
                      className="p-1 border rounded"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {adminMsg && (
            <div className="text-sm text-muted-foreground">
              {adminMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}
