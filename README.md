# fieldghost.sh

This repository contains the source code and CI/CD deployment pipeline for my self-hosted personal website and learning hub.

Built completely from scratch, this project strips away bloated frameworks and static site generators in favor of raw HTML, CSS, and vanilla JavaScript. It is designed to act as both a place to share knowledge and a hands-on environment for practicing Git workflows, secure server networking, and continuous deployment.

---

## 🏗️ Architecture & Tech Stack

The site is hosted on a personal bare-metal server ("brain" - Lenovo m910q) running Ubuntu Server. Traffic and deployments are handled through a secure, tunnel-based architecture.

* **Frontend:** Raw HTML5, CSS3, Vanilla JS (ES5)
* **Web Server:** Nginx
* **Edge Routing & SSL:** Cloudflare Tunnels (`cloudflared`)
* **Secure Access:** Tailscale (Zero Trust Mesh VPN)
* **CI/CD:** GitHub Actions + `rsync` over SSH

---

## 📂 Directory Structure (Clean URLs)

The site utilizes a "Clean URL" routing strategy. Instead of pointing directly to `.html` files (e.g., `fieldghost.sh/about.html`), subpages are organized into directories containing an `index.html` file. Nginx is configured to serve the directory root, resulting in clean, professional URLs.

```text
fieldghost.sh/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions CI/CD configuration
├── assets/                  # Global static assets
│   ├── css/
│   │   └── style.css        # CSS Variables for Terminal/Normal themes
│   └── images/
├── blog/                    # Dynamic blog system via Vanilla JS
│   ├── entries/
│   │   ├── manifest.json
│   │   └── *.txt
│   └── index.html
├── scripts/                 # Global JavaScript
│   ├── blog.js
│   └── theme.js
├── about/                   # [https://fieldghost.sh/about](https://fieldghost.sh/about)
├── charity/                 # [https://fieldghost.sh/charity](https://fieldghost.sh/charity)
├── code/                    # [https://fieldghost.sh/code](https://fieldghost.sh/code)
├── media/                   # [https://fieldghost.sh/media](https://fieldghost.sh/media)
├── settings/                # [https://fieldghost.sh/settings](https://fieldghost.sh/settings)
└── index.html               # [https://fieldghost.sh](https://fieldghost.sh) (Homepage)
```

---

## 🚀 The CI/CD Pipeline

The deployment process is entirely automated. I do not need to open public SSH ports (port 22) to the internet, nor do I need to manually copy files to the server.

1. **Trigger:** A merged Pull Request to the `main` branch triggers the GitHub Action.
2. **Tailscale Connection:** GitHub spins up an ephemeral runner (`ubuntu-latest`) and authenticates to my Tailnet using an OAuth Client ID/Secret assigned to a specific `tag:ci` ACL.
3. **SSH & Rsync:** The runner uses a stored private SSH key to securely connect to the VPS (`brain`) over the Tailscale mesh network. It then uses `rsync` to synchronize the repository files directly into the `/var/www/fieldghost.sh` Nginx root directory.
4. **Cleanup:** `rsync --delete` ensures that files deleted from the repository are also purged from the live web server, keeping the environment perfectly synced.

---

## 🤝 Contributing & Local Development

This project is fully open-source. Contributions, bug fixes, and feature suggestions are highly encouraged. Because this is a static site without a backend, getting a local environment running is incredibly simple.

**To run the site locally:**
1. **Fork & Clone:** Fork the repository and clone it to your local machine.
2. **Start a Local Server:** Navigate to the root directory in your terminal and run a simple HTTP server. (e.g., using Python3):
   ```bash
   python -m http.server 8000
   ```
3. **Preview:** Open your browser and navigate to `http://localhost:8000`. Be sure to do a hard refresh or disable your cache when making CSS/JS changes.

**To submit a change:**
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat: your description"`
3. Push to your fork: `git push origin feature/your-feature-name`
4. Open a **Pull Request** against the `main` branch of this repository.

*Note: All Pull Requests are subject to manual code review before being merged into the live CI/CD pipeline.*
