# 用 GitHub Actions 打 IPA + 爱思助手签名安装

> 流程：**GitHub 云端打出未签名 IPA** → 下载 → **爱思助手用 Apple ID 签名** → 装到 iPhone。

---

## 一、把代码推到 GitHub

若仓库是 **`FFF-a/office-mobile`**（仅前端），在 `office_mobile` 目录：

```powershell
cd C:\Users\JD\Desktop\office_competition\office_mobile
git add .
git commit -m "ci: add GitHub Actions iOS unsigned IPA"
git push origin main
```

若整个 `office_competition` 是一个大仓库，需把 workflow 放到仓库根目录的 `.github/workflows/`，并在 workflow 里加 `defaults.run.working-directory: office_mobile`（或把 `office_mobile` 单独建仓）。

---

## 二、在 GitHub 触发打包

1. 打开仓库 → **Actions**
2. 左侧选 **Build iOS IPA (unsigned)**
3. 点 **Run workflow** → 选分支 `main` → **Run workflow**
4. 等待约 **15～40 分钟**（首次较慢）
5. 完成后点进该次运行 → 底部 **Artifacts** → 下载 **`office-manage-unsigned-ipa`**
6. 解压得到 **`office-manage-unsigned.ipa`**

### 可选 Secret

**Settings → Secrets → Actions** 添加 `EXPO_PUBLIC_API_URL`（不填则默认 `http://118.31.109.161`）。

---

## 三、爱思助手签名并安装

1. Windows 安装 [爱思助手](https://www.i4.cn/)（官网下载）
2. iPhone 数据线连接电脑，手机上点 **信任此电脑**
3. 爱思助手 → **应用游戏** → **导入安装**（或 **IPA 签名**）
4. 选择下载的 **`office-manage-unsigned.ipa`**
5. 使用你的 **Apple ID** 登录（免费个人号即可）
6. 按提示完成签名并 **安装到手机**
7. 若提示「不受信任的企业级开发者」：iPhone **设置 → 通用 → VPN与设备管理** → 信任对应描述文件

### 注意（免费 Apple ID）

| 项目 | 说明 |
|------|------|
| 有效期 | 约 **7 天**，过期需用爱思 **重新签名安装** |
| 设备数 | 免费号同时安装数量有限制 |
| 网络 | 手机需能访问 `http://118.31.109.161`（与安卓相同） |
| 登录 | `admin` / `admin123` |

---

## 四、Workflow 失败时

| 现象 | 处理 |
|------|------|
| Actions 里没有该 workflow | 确认 `.github/workflows/ios-ipa-unsigned.yml` 已 push |
| `pod install` 失败 | 看日志；多为网络，可 **Re-run job** |
| `xcodebuild archive` 失败 | 把 Actions 日志最后 50 行发出来排查 |
| 爱思无法签名 | 确认 IPA 完整；换最新版爱思；Apple ID 在 appleid.apple.com 可正常登录 |
| 装完闪退 | 重新签名安装；检查 iOS 版本是否过旧 |

---

## 五、和 EAS / Mac 方案的区别

| 方式 | 需要 $99/年 | 需要 Mac |
|------|------------|----------|
| **本方案（GHA + 爱思）** | 否 | 否 |
| EAS 云构建 iOS | 是 | 否 |
| Mac + Xcode 导出 | 否 | 是 |

---

*Workflow 文件：`office_mobile/.github/workflows/ios-ipa-unsigned.yml`*
