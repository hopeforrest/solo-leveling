# 部署到 GitHub Pages

> 结论先说：**这个站是纯静态的，没有任何构建步骤，上传就能跑。**
> 全程不装任何软件，10 分钟以内。

---

## 方案 A：网页拖拽（推荐，3 分钟）

### 1. 建仓库

1. 打开 <https://github.com/new>
2. **Repository name** 填 `solo-leveling`（英文小写，别用中文和空格）
3. 选 **Public**（Private 仓库要付费才能开 Pages）
4. 下面的 README / .gitignore / license **全都不勾**
5. 点 **Create repository**

### 2. 上传文件

在空仓库页面点 **uploading an existing file**，然后把本文件夹里的文件全选、拖进去。

**要传的 12 个文件，都在仓库根目录（不要建子文件夹）：**

```
index.html      style.css      data.js        content.js
worlds2.js      milestones.js  route.js       intel.js
app.js          README.md      DEPLOY.md      serve.ps1
.nojekyll
```

> ⚠️ 拖的是**文件本身**，不是整个 `quest` 文件夹。如果拖成了文件夹，网址会变成 `.../仓库/quest/`。
> ⚠️ `.nojekyll` 是隐藏文件，Windows 拖不进去就：**Add file → Create new file → 文件名输入 `.nojekyll` → 内容留空 → Commit**。

拖完点绿色 **Commit changes**。

### 3. 开启 Pages

1. 进仓库顶部的 **Settings**
2. 左侧菜单拉到最下，点 **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，右边目录选 `/ (root)`
5. 点 **Save**

### 4. 等 1–2 分钟

刷新这个页面，顶部会出现：

```
Your site is live at https://<你的用户名>.github.io/solo-leveling/
```

**这个网址就是你的了。** 手机、平板、任何电脑都能打开，进度存在各自浏览器里。

以后改了内容，重新上传覆盖同名文件，Commit 后约 1 分钟自动更新。

---

## 方案 B：装了 Git 之后

```powershell
cd "<你的 quest 文件夹路径>"

git init
git add .
git commit -m "learn quest v1"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

Pages 设置同方案 A 的第 3 步。

---

## 常见问题

**打开是 404**
- 刚开启 Pages 要等 1–2 分钟，先等等
- 确认 Branch 是 `main`、目录是 `/ (root)`
- 确认文件名是小写的 `index.html`（Linux 服务器区分大小写）

**页面白屏 / 没有样式**
- 十有八九是文件没传全。仓库根目录应该有 12 个文件
- 电脑上按 F12 → Console，看是不是 `style.css` 或 `app.js` 报 404

**改完没变化**
- 强刷：`Ctrl + F5`；手机请换隐私模式或清缓存
- Pages 前面有 CDN，有 1 分钟左右的缓存

**手机上进度会不会丢**
- 不会，而且 https 下比本地文件更稳（`localStorage` 在 https 源下是完整支持的）
- 想加到桌面：Safari「分享 → 添加到主屏幕」

**换设备怎么同步**
- 存档在浏览器本地，不跟着账号走
- 同步办法：在「存档」页点**导出存档**，把 JSON 发到新设备，再**导入存档**

**要不要担心公开**
- Public 仓库任何人都能看到源码。这个站里没有任何隐私数据（没有账号、没有你的真实姓名），只有你自己的进度存在浏览器里，不在仓库里。

---

## 部署后自检清单

打开网址后，依次确认：

- [ ] 顶部显示「我独自升级」，等级是 `E 级猎人`
- [ ] 地图页有两个世界线卡片（计算机 / 数字媒体），实际是四个
- [ ] 里程碑页能切换「并行四条线 / 推荐路线」，日期是今天的
- [ ] 情报页四条周任务能勾选，刷新后还在
- [ ] 随便打开一关，能看到「学习内容」和「课程与资料」
- [ ] 断网后再打开，页面仍然能显示（纯静态，无 CDN）

六条都对，就说明部署成功。
