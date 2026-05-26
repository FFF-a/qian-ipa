import axios from "axios";
import { API_BASE_URL } from "../config";
import { clearToken, getToken } from "../utils/storage";

/** 401 时由 AuthContext 注册的回调 */
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/** 请求拦截：自动携带 JWT */
client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

function normalizeError(error, body, status) {
  if (!error.response && !body) {
    const msg = error.message || "";
    if (msg.includes("Network Error") || msg.includes("ERR_CONNECTION")) {
      return {
        code: 0,
        message: `无法连接服务器（${API_BASE_URL}），请检查手机网络或浏览器打开 ${API_BASE_URL}/health 测试`,
        data: null,
      };
    }
    return {
      code: 0,
      message: msg || "网络异常",
      data: null,
    };
  }
  const resBody = body ?? error.response?.data;
  const httpStatus = status ?? error.response?.status;
  const code = resBody?.code ?? httpStatus ?? 500;
  return {
    code,
    message: resBody?.message || error.message || "请求失败",
    data: resBody?.data ?? null,
  };
}

/** 响应拦截：解析 { code, message, data }，401 跳转登录 */
client.interceptors.response.use(
  async (response) => {
    const body = response.data;
    if (body && typeof body.code === "number") {
      if (body.code === 401) {
        await clearToken();
        onUnauthorized?.();
        return Promise.reject({
          code: 401,
          message: body.message || "未授权",
          data: body.data,
        });
      }
      if (body.code !== 200) {
        return Promise.reject({
          code: body.code,
          message: body.message || "请求失败",
          data: body.data,
        });
      }
      return { ...response, data: body.data, message: body.message };
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    const code = body?.code ?? status;

    if (code === 401 || status === 401) {
      await clearToken();
      onUnauthorized?.();
      return Promise.reject(
        normalizeError(error, body, status)
      );
    }

    return Promise.reject(normalizeError(error, body, status));
  }
);

export default client;
