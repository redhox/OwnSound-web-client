// api/user.tsx

const API_URL = import.meta.env.VITE_API_URL || "/api-backend";

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
  return res.json();
}

export async function fetchRegister(payload: {
  username: string;
  password: string;
  email: string;
  token: string;
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`REGISTER_FAILED ${res.status}`);
  }

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
    throw new Error(`GET_USERS_FAILED ${res.status}`);
  }
  return res.json();
}
/* ======================
   ADMIN — SYSTEM
====================== */

export async function fetchGenerateToken(
  token: string
) {
  const res = await fetch(`${API_URL}/admin/generateToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`GENERATE_TOKEN_FAILED ${res.status}`);
  }

  return res.json();
}

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

export async function createLibrary(token: string, payload: any) {
  const res = await fetch(`${API_URL}/admin/libraries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("CREATE_LIBRARY_FAILED");
  return res.json();
}

export async function updateLibrary(token: string, index: number, payload: any) {

  const res = await fetch(`${API_URL}/admin/libraries/${index}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("UPDATE_LIBRARY_FAILED");
  return res.json();
}

export async function fetchLibraries(token: string) {
  const res = await fetch(`${API_URL}/admin/libraries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("FETCH_LIBRARIES_FAILED");
  return res.json();
}

export async function scanBucket(token: string, libraryId?: number) {
  const res = await fetch(`${API_URL}/admin/scan-bucket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ library_id: libraryId }),
  });
  if (!res.ok) throw new Error("SCAN_BUCKET_FAILED");
  return res.json();
}

export async function scanArtistImages(token: string) {
  const res = await fetch(`${API_URL}/admin/scan-artist-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("SCAN_ARTIST_IMAGES_FAILED");
  return res.json();
}

export async function fetchUserHistory(token: string) {
  const res = await fetch(`${API_URL}/user/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("FETCH_HISTORY_FAILED");
  return res.json();
}
