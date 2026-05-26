# 前端 GitHub 自动化说明

## Workflow：`eas-android.yml`

- 触发：push 到 `main` / `master`，或 Actions 里手动 **Run workflow**
- 作用：在 Expo 云端自动构建 Android APK（与本地 `eas build` 相同）

## 一次性配置

### 1. 新建 GitHub 仓库（若还没有）

在 GitHub 创建 **`office-mobile`**（或你喜欢的名字），然后：

```powershell
cd office_mobile
git add .
git commit -m "ci: add EAS GitHub Actions"
git remote add origin https://github.com/FFF-a/office-mobile.git
git branch -M main
git push -u origin main
```

### 2. 配置 GitHub Secrets

仓库 **Settings → Secrets and variables → Actions → New repository secret**：

| Secret | 如何获取 |
|--------|----------|
| `EXPO_TOKEN` | https://expo.dev/accounts/fff0066/settings/access-tokens → Create token |
| `EXPO_PUBLIC_API_URL` | 后端公网地址，如 `http://123.45.67.89:5000`（部署后端后填写） |

### 3. 查看构建结果

push 后打开 **Actions** 标签，或 https://expo.dev → office-mobile → Builds → Download APK。

## Workflow：`ios-ipa-unsigned.yml`（iOS · 爱思助手用）

- 触发：**Run workflow** 手动，或 push 到 `main`/`master`（改代码时自动跑，不含仅改安卓 workflow 的提交）
- 作用：在 **GitHub macOS 虚拟机** 上 `expo prebuild` + 打出 **未签名 `.ipa`**
- **不需要** `EXPO_TOKEN`，**不需要** $99 苹果开发者账号
- 下载产物后，在 Windows 用 **爱思助手 + 个人 Apple ID** 签名装到 iPhone

详细步骤见：**`爱思助手安装IPA.md`**

| Secret（可选） | 说明 |
|----------------|------|
| `EXPO_PUBLIC_API_URL` | 不填则默认 `http://118.31.109.161` |

---

## 说明

- 未配置 `EXPO_TOKEN` 时 **安卓** workflow 会失败。
- `EXPO_PUBLIC_API_URL` 不配置时，使用 `eas.json` 里默认的局域网地址（仅同 WiFi 可用）。
