import client from "./client";

export async function fetchUsers(page = 1, perPage = 20) {
  const res = await client.get("/api/users", {
    params: { page, per_page: perPage },
  });
  return res.data;
}

export async function createUser(payload) {
  const res = await client.post("/api/users", payload);
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await client.put(`/api/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id) {
  const res = await client.delete(`/api/users/${id}`);
  return res.data;
}
