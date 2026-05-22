# Office Mobile 打包 Android APK

## 已配置项

- `app.json`：包名 `com.office.manage`，允许 HTTP（`usesCleartextTraffic`，对接 `http://172.20.10.10:5000`）
- `eas.json`：输出 **APK**（非 AAB）
- `.env` 中 `EXPO_PUBLIC_API_URL` 会在构建时写入安装包

> 手机安装 APK 后，需与后端 **同一局域网**，且后端运行在 `172.20.10.10:5000`（或改 `.env` 后重新打包）。

---

## 方式一：EAS 云打包（推荐，无需本机 Android Studio）

1. 注册/登录 https://expo.dev
2. 在项目目录执行：

```powershell
cd c:\Users\JD\Desktop\office_competition\office_mobile
npm install
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

3. 终端会给出一个构建链接，等 10～20 分钟完成后 **Download APK**。
4. 将 APK 传到手机安装（需允许「未知来源」）。

首次运行会提示关联 Expo 项目，按提示选 **Yes** 即可。

---

## 方式二：本机 Gradle 打包（需 Android 环境）

### 安装

1. 安装 [Android Studio](https://developer.android.com/studio)（含 SDK）
2. 安装 JDK 17（Android Studio 一般自带）
3. 环境变量（安装后重启终端）：
   - `JAVA_HOME` → JDK 目录
   - `ANDROID_HOME` → `C:\Users\你的用户名\AppData\Local\Android\Sdk`

### 打包

```powershell
cd c:\Users\JD\Desktop\office_competition\office_mobile
npm install
npx expo prebuild --platform android --clean
cd android
.\gradlew.bat assembleRelease
```

生成的 APK 路径：

```
android\app\build\outputs\apk\release\app-release.apk
```

可复制到桌面并重命名为 `office-manage.apk`。

---

## 修改后端地址后重新打包

编辑 `.env`：

```
EXPO_PUBLIC_API_URL=http://你的电脑IP:5000
```

然后重新执行方式一或方式二。

---

## 常见问题

| 问题 | 处理 |
|------|------|
| 手机连不上接口 | 手机与电脑同一 WiFi；Windows 防火墙放行 5000 端口 |
| 仅 HTTPS | 后端目前是 HTTP，已开启 `usesCleartextTraffic` |
| `eas login` 失败 | 开代理或浏览器登录 expo.dev 后再试 |
