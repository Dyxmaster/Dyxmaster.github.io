---
title: "小白 Git 速通宝典：比喻 + 场景搞懂 Git（入职向）"
date: 2025-12-15T00:00:00+08:00
draft: false
tags: ["git", "beginner", "workflow", "career"]
categories: ["Tools"]
description: "用比喻和实际情景，由浅入深讲清 Git：工作区/暂存区/本地仓库/远程仓库、push/pull、分支、冲突、撤销回退、日常流程。"
---

helo,这里是小白git速通宝典。我将利用比喻和实际情景，由浅入深的讲解什么是git，帮助小白速入职场，适应git工具。

# 第 0 章：Git 到底是干嘛的？

**一句话解释**：Git 是用来“保存代码历史”和“多人协作”的工具。

**比喻**：你写论文会不断保存：

- `report_v1.docx`
- `report_v2_final.docx`
- `report_v3_final_final.docx`

Git 就是把这些“版本”管理得非常专业，而且支持多人同时改。

---

# 第 1 章：必须先懂的地图——Git 的 4 个区域

Git 里最重要的不是命令，而是这 4 个区域：

1. **工作区（Working Directory）**  
   你文件夹里真实的文件，你正在改的地方。

2. **暂存区（Staging Area / Index）**  
   你准备“这一次要提交哪些文件”的清单（像购物车）。

3. **本地仓库（Local Repository）**  
   你电脑里保存的历史版本（commit 组成的历史）。

4. **远程仓库（Remote Repository）**  
   GitHub/GitLab 上的仓库，用来备份+协作。

## 一个真实例子秒懂

你有项目 `demo/`，里面有 `main.py`

- 你修改了 `main.py` → 只是在 **工作区**
- 你执行 `git add main.py` → 把它放进 **暂存区**
- 你执行 `git commit -m "xxx"` → 存到 **本地仓库**（形成一个版本点）
- 你执行 `git push` → 把版本推到 **远程仓库**

> 工作流水线：  
> **改（工作区）→ 选（暂存区）→ 存档（本地仓库）→ 上传（远程）**

---

# 第 2 章：6 个仪表盘命令

随时迷路就用它们：

## 2.1 我现在在哪？发生了什么？

```bash
git status
```

它会告诉你：改了什么、是否 add、是否能 commit、当前分支是什么。

## 2.2 我改了什么内容？

```bash
git diff
```

（看工作区相对暂存区的差异）

## 2.3 我 add 了哪些准备提交？

```bash
git diff --staged
```

## 2.4 历史长啥样？

```bash
git log --oneline --graph --decorate --all
```

## 2.5 我有哪些分支？

```bash
git branch
```

## 2.6 远程仓库是谁？

```bash
git remote -v
```

---

# 第 3 章：最小闭环—从 0 到 1 完成一次提交

我们模拟第一次写代码并提交。

## 场景：你新建一个项目，写一个脚本

## Step 1：初始化仓库

```bash
mkdir demo 
cd demo 
git init
```

## Step 2：创建文件

比如你建一个 `main.py`，写：

```python
print("hello")
```

## Step 3：看状态（一定要看）

```bash
git status
```

你会看到 `main.py` 是 untracked（没被 Git 管）

## Step 4：加入暂存区（放进购物车）

```bash
git add main.py
```

## Step 5：提交（形成一个版本点）

```bash
git commit -m "init: add main.py"
```

## Step 6：再看状态

```bash
git status
```

应该显示 clean（干净）

✅ 到这里你已经会 Git 了（至少会“本地版本管理”）

---

# 第 4 章：远程仓库是什么？push/pull 到底在干嘛？

现在我们把本地 demo 推到 GitHub/GitLab（远程）。

## 4.1 绑定远程仓库（假设远程叫 origin）

```bash
git remote add origin <你的仓库地址>
```

## 4.2 第一次推送（把 main 分支推上去）

```bash
git push -u origin main
```

`-u` 的意思是：以后你直接 `git push` 就知道推到哪里。

## 4.3 pull / fetch / push 三兄弟

- `git push`：把**本地**提交 → 发到**远程**
- `git fetch`：把**远程**更新 → 拉到**本地记录**（但不改你文件）
- `git pull`：= fetch + 合并，把远程更新真正合到你当前代码里

### 真实例子

你在公司电脑改了代码并 push 了。你回家电脑想拿到最新：

```bash
git pull
```

---

# 第 5 章：分支是什么？为什么你必须用分支？

**分支就是“在不破坏主线的情况下做新功能”**

## 场景：main 是稳定版本，你要做一个新功能 login

## Step 1：从 main 开一个新分支

```bash
git switch -c feature_login
```

## Step 2：你在 feature_login 上改代码、提交

```bash
git add .
git commit -m "feat: add login"
```

## Step 3：把这个分支推到远程

```bash
git push -u origin feature_login
```

## Step 4：最后把功能合回 main（合并）

先切回 main：

```bash
git switch main
git pull
```

再合并：

```bash
git merge feature_login
```

再推上去：

```bash
git push
```

> 你现在掌握了标准团队开发流程。

---

# 第 6 章：合并冲突是什么？

冲突的本质：**两边改了同一段内容，Git 不知道听谁的**

## 场景：你和同学都改了同一个文件同一行

你本地把 `print("hello")` 改成 `print("hi")` 并 commit  
同学把它改成 `print("hey")` 并 push  
你现在 `git pull` 时就可能冲突。

## 冲突出现后你只做三步：

### 1）查看冲突文件

```bash
git status
```

### 2）打开冲突文件你会看到：

```text
<<<<<<< HEAD
print("hi")
=======
print("hey")
>>>>>>> origin/main
```

### 3）你手动改成你想要的，比如：

```python
print("hi")
```

删掉那些 `<<<<<<< ======= >>>>>>>`，然后：

```bash
git add main.py
git commit -m "fix: resolve conflict"
```

✅ 冲突解决完成

---

# 第 7 章：撤销与回退

## 7.1 我改错了，但还没 add（最常见）

撤销工作区改动：

```bash
git restore main.py
```

## 7.2 我 add 了，但后悔了（想把它从暂存区拿出来）

```bash
git restore --staged main.py
```

## 7.3 我 commit 了，但想撤销这个 commit

生成一个“反向提交”（不会破坏历史，最安全）：

```bash
git revert <commit_id>
```

## 7.4 我想回到某个版本并丢弃后面所有改动（危险）

```bash
git reset --hard <commit_id>
```

小白慎用，可能直接丢代码。

---

# 第 8 章：一套万能日常流程

每次开始写代码：

```bash
git switch main
git pull
git switch -c feat_x
```

写完一小段就提交：

```bash
git status
git add .
git commit -m "feat: x"
```

推送：

```bash
git push -u origin feat_x
```

要合回 main：

```bash
git switch main
git pull
git merge feat_x
git push
```
