# 建立新的 GitHub 儲存庫：Lumi system .v10

這份專案已整理成可直接放到新 GitHub repo 的網頁版本。因為此執行環境沒有 GitHub 外掛授權、GitHub token，也沒有 `gh` CLI，所以無法在你的 GitHub 帳號中直接按下「Create repository」。請用以下步驟建立新的 repo，然後把整包推上去。

## 1. 建議的 repo 名稱

GitHub repo 名稱建議使用不含空白與句點的格式：

```text
Lumi-system-v10
```

顯示名稱或描述可以寫：

```text
Lumi system .v10 - Render web version
```

## 2. 先在本機產生乾淨整包

在此專案根目錄執行：

```bash
npm run export:v10
```

產生結果：

```text
.artifacts/Lumi-system-v10/
.artifacts/Lumi-system-v10.zip
```

這個資料夾 / ZIP 會排除 `.git`、`node_modules`、`.artifacts` 等不該放進新 repo 的內容。

## 3. 在 GitHub 建立新 repo

1. 到 <https://github.com/new>。
2. Repository name 輸入：`Lumi-system-v10`。
3. 選 Public 或 Private。
4. 不要勾選 README / .gitignore / License，避免跟這包內容衝突。
5. 按 **Create repository**。

## 4. 把整包推到新 repo

假設你已經產生 `.artifacts/Lumi-system-v10/`，執行：

```bash
cd .artifacts/Lumi-system-v10
git init
git add .
git commit -m "Initial Lumi system v10 web version"
git branch -M main
git remote add origin https://github.com/<你的帳號>/Lumi-system-v10.git
git push -u origin main
```

推上去後，就可以到 Render 用這個新的 GitHub repo 建立 Blueprint / Static Site。
