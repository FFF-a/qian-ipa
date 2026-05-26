# Office Mobile — Expo 前端

对接 Flask 后端 `http://127.0.0.1:5000`，实现登录、员工、设备分类、设备管理。

## 功能

| 页面 | 功能 |
|------|------|
| 登录 | 用户名密码，JWT 存入 AsyncStorage |
| 员工列表 | FlatList、下拉刷新、新增/编辑/删除 |
| 设备分类 | 列表 CRUD，显示设备数量 |
| 设备管理 | 列表 CRUD，联表显示分类，表单选择分类 |

## 技术

- React Native Expo + 函数组件 Hooks
- axios + 请求拦截器自动带 `Bearer` JWT
- 响应拦截解析 `{ code, message, data }`
- HTTP/code 401 清除令牌并回到登录页

## 启动

```powershell
cd office_mobile
npm install
copy .env.example .env
npm start
```

**Expo SDK 54**（兼容 iPhone 最新版 Expo Go）。确保 `.env`：

```env
EXPO_PUBLIC_API_URL=http://118.31.109.161
```

### iPhone Expo Go 演示

1. App Store 安装 **Expo Go**
2. 电脑 `npm start`（同一 WiFi 用 `npx expo start --lan`）
3. 扫码，或 Expo Go 手动输入 `exp://电脑局域网IP:8081`
4. 登录 `admin` / `admin123`

> SDK 52 与新版 Expo Go 不兼容；已升级到 SDK 54。

确保后端已运行：`python run.py`（office_backend 目录）

### 网络地址说明

| 环境 | EXPO_PUBLIC_API_URL |
|------|---------------------|
| iOS 模拟器 / Web | `http://127.0.0.1:5000` |
| Android 模拟器 | `http://10.0.2.2:5000` |
| 真机 | 电脑局域网 IP，如 `http://192.168.1.100:5000` |

默认账号：`admin` / `admin123`

## 目录结构

```
src/
├── api/          # axios 封装与接口
├── context/      # AuthContext
├── navigation/   # 路由
├── screens/      # 页面
├── components/   # 表单弹窗
├── utils/        # AsyncStorage
└── config.js     # API 地址
```
