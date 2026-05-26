# office_mobile 打成 IPA（免费个人 Apple ID）

> **重要：** 你当前是 **Windows**，本机 **无法** 直接生成 `.ipa`。  
> 免费 Apple ID **不能** 用 EAS 云端给真机出安装包（需 $99/年开发者计划）。  
> 可行做法：在 **Mac + Xcode** 上用个人 Apple ID 签名并导出 IPA（约 7 天有效，到期需重装）。

---

## 一、已为本项目做好的配置

| 文件 | 内容 |
|------|------|
| `app.json` | `bundleIdentifier`: `com.office.manage`；允许访问 `http://118.31.109.161` |
| `eas.json` | `preview-ios` 配置（付费账号时可用 `npm run build:ipa:cloud`） |
| `.env` | `EXPO_PUBLIC_API_URL=http://118.31.109.161` |

---

## 二、在 Mac 上导出 IPA（免费 Apple ID）

### 准备

1. Mac 安装 **Xcode**（App Store）
2. Xcode → **Settings → Accounts** → 登录你的 **免费 Apple ID**
3. iPhone 用数据线连 Mac（可选，用于直接 Run；导出 IPA 不强制）

### 步骤

```bash
# 1. 进入工程
cd office_mobile
npm install

# 2. 生成原生 iOS 工程（只需做一次，或改原生配置后重做）
npx expo prebuild --platform ios --clean

# 3. 安装 CocoaPods 依赖
cd ios && pod install && cd ..

# 4. 用 Xcode 打开（注意是 .xcworkspace）
open ios/*.xcworkspace
```

在 Xcode 中：

1. 左侧选 **工程名** → **TARGETS** → **office-mobile**（名称以实际为准）
2. **Signing & Capabilities**
   - 勾选 **Automatically manage signing**
   - **Team** 选你的个人 Apple ID（Personal Team）
   - 若提示 Bundle ID 冲突，把 `com.office.manage` 改成唯一值（如 `com.office.manage.yourname`），并同步改 `app.json` 里 `ios.bundleIdentifier`
3. 若有 **Push Notifications** 等能力报错，可先 **删除** 该 Capability（本 App 不需要推送）
4. 顶部设备选 **Any iOS Device (arm64)**（不要选模拟器）
5. 菜单 **Product → Archive**，等待完成
6. 弹出 **Organizer** → 选中刚打的包 → **Distribute App**
7. 选 **Custom** → **Development**（开发分发，适合免费账号）
8. 一路 Next，导出得到 **`Office Manage.ipa`**（或你起的名字）

### 装到 iPhone

- **方式 A：** Organizer 里选 **Distribute → Development**，连手机直接安装  
- **方式 B：** 把 `.ipa` 拷到 Windows，用 **爱思助手 / Sideloadly**，登录同一 Apple ID 安装（免费号约 7 天需重签）

---

## 三、Windows 上刚才试过 EAS 的结果

```text
EAS CLI couldn't find any credentials suitable for internal distribution
```

说明：未绑定 **付费** Apple Developer，云端打不出可装真机的 IPA。  
若以后开通 $99/年，在本机执行：

```powershell
cd office_mobile
npm run build:ipa:cloud
```

按提示在浏览器登录 Apple 开发者账号，完成后在 [expo.dev](https://expo.dev) 下载 `.ipa`。

---

## 四、不装 IPA 时的演示（Windows 即可）

```powershell
cd office_mobile
npm start
# 或 npx expo start --lan
```

iPhone 装 **Expo Go**，扫终端二维码，账号 `admin` / `admin123`。  
**不是独立 IPA**，但答辩演示业务足够。

---

## 五、常见问题

| 现象 | 处理 |
|------|------|
| 登录后白屏 / 网络错误 | 确认手机能打开 `http://118.31.109.161/health` |
| Signing 失败 | Team 选 Personal Team；改唯一 Bundle ID |
| Archive 灰色 | 设备选 Any iOS Device，不要选 Simulator |
| 7 天后打不开 | 免费证书过期，Mac 上重新 Archive 或重签 |

---

*路径：`office_mobile/打包iOS-免费AppleID.md`*
