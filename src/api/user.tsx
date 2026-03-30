// api/user.tsx

const API_URL = import.meta.env.VITE_API_URL;

/* ======================
   AUTH
====================== */

export async function fetchLogin(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(`LOGIN_FAILED ${res.status}`);
  }
  console.log(res)
  return res.json();
}


/* ======================
   ADMIN — USERS
====================== */

export async function createUser(
  token: string,
  payload: {
    username: string;
    password: string;
    email: string;
    role?: "user" | "admin";
  }
) {
  const res = await fetch(`${API_URL}/admin/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`CREATE_USER_FAILED ${res.status}`);
  }

  return res.json();
}

export async function setUserRole(
  token: string,
  userId: string,
  role: "user" | "admin"
) {
  const res = await fetch(`${API_URL}/admin/user/role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      role,
    }),
  });

  if (!res.ok) {
    throw new Error(`SET_ROLE_FAILED ${res.status}`);
  }

  return res.json();
}

export async function getUserAll(
  token: string,
) {
  const res = await fetch(`${API_URL}/admin/user/listUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    throw new Error(`SET_ROLE_FAILED ${res.status}`);
  }
  console.log(res)

  return res.json();
}
/* ======================
   USER — SELF
====================== */

export async function changeUsername(
  token: string,
  username: string
) {
  const res = await fetch(`${API_URL}/user/username`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    throw new Error(`CHANGE_USERNAME_FAILED ${res.status}`);
  }

  return res.json();
}

export async function changePassword(
  token: string,
  password: string
) {
  const res = await fetch(`${API_URL}/user/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    throw new Error(`CHANGE_PASSWORD_FAILED ${res.status}`);
  }

  return res.json();
}
