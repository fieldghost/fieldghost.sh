Here is the complete Markdown documentation for your repository. You can copy this entire block and paste it directly into a `README.md` file in the root of your `fieldghost.sh` project. 

```markdown
# fieldghost.sh

This repository contains the source code and CI/CD deployment pipeline for my self-hosted personal website. 

Built completely from scratch, this project strips away bloated frameworks and static site generators in favor of raw HTML, CSS, and vanilla JavaScript. It is designed to act as both my personal site and a hands-on environment for practicing Git workflows, secure server networking, and continuous deployment.

---

## 🏗️ Architecture & Tech Stack

The site is hosted on a personal bare-metal server ("brain" - Lenovo m910q) running Ubuntu Server. Traffic and deployments are handled through a secure, tunnel-based architecture.

* **Frontend:** Raw HTML5, CSS3, Vanilla JS
* **Web Server:** Nginx 
* **Edge Routing & SSL:** Cloudflare Tunnels (`cloudflared`)
* **Secure Access:** Tailscale (Zero Trust Mesh VPN)
* **CI/CD:** GitHub Actions + `rsync` over SSH

---

## 📂 Directory Structure (Clean URLs)

The site utilizes a "Clean URL" routing strategy. Instead of pointing directly to `.html` files (e.g., `fieldghost.sh/about.html`), subpages are organized into directories containing an `index.html` file. Nginx is configured to serve the directory root, resulting in clean, professional URLs (e.g., `fieldghost.sh/about`).

```text
fieldghost.sh/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions CI/CD configuration
├── assets/                  # Global static assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   └── images/
├── about/                   # [https://fieldghost.sh/about](https://fieldghost.sh/about)
│   └── index.html
└── index.html               # [https://fieldghost.sh](https://fieldghost.sh) (Homepage)
```

---

## 🚀 The CI/CD Pipeline

The deployment process is entirely automated. I do not need to open public SSH ports (port 22) to the internet, nor do I need to manually copy files to the server.

1. **Trigger:** A push or merged Pull Request to the `main` branch triggers the GitHub Action.
2. **Tailscale Connection:** GitHub spins up an ephemeral runner (`ubuntu-latest`) and authenticates to my Tailnet using an OAuth Client ID/Secret assigned to a specific `tag:ci` ACL.
3. **SSH & Rsync:** The runner uses a stored private SSH key to securely connect to the VPS (`brain`) over the Tailscale mesh network. It then uses `rsync` to synchronize the repository files directly into the `/var/www/fieldghost.sh` Nginx root directory.
4. **Cleanup:** `rsync --delete` ensures that files deleted from the repository are also purged from the live web server, keeping the environment perfectly synced.

---

## 💻 Local Development Workflow

Development occurs on my Arch Linux desktop ("monolith") using Vim. The standard procedure for updating the site is:

1. **Create a branch:** `git checkout -b feature/new-content`
2. **Make changes:** Edit HTML/CSS locally.
3. **Commit:** `git add .` -> `git commit -m "Describe updates"`
4. **Push:** `git push origin feature/new-content`
5. **Pull Request:** Open a PR on GitHub to merge into `main`.
6. **Merge & Deploy:** Merging the PR automatically triggers the GitHub Action, making the changes live within seconds.

---

*Note: This is a private repository designed for personal use and infrastructure practice.*
```
