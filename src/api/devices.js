import client from "./client";

export async function fetchDevices(page = 1, perPage = 20, categoryId) {
  const params = { page, per_page: perPage, with_category: 1 };
  if (categoryId) params.category_id = categoryId;
  const res = await client.get("/api/devices", { params });
  return res.data;
}

export async function createDevice(payload) {
  const res = await client.post("/api/devices", payload);
  return res.data;
}

export async function updateDevice(id, payload) {
  const res = await client.put(`/api/devices/${id}`, payload);
  return res.data;
}

export async function deleteDevice(id) {
  const res = await client.delete(`/api/devices/${id}`);
  return res.data;
}
