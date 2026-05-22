import client from "./client";

export async function fetchCategories() {
  const res = await client.get("/api/device-categories");
  return res.data;
}

export async function createCategory(payload) {
  const res = await client.post("/api/device-categories", payload);
  return res.data;
}

export async function updateCategory(id, payload) {
  const res = await client.put(`/api/device-categories/${id}`, payload);
  return res.data;
}

export async function deleteCategory(id) {
  const res = await client.delete(`/api/device-categories/${id}`);
  return res.data;
}
