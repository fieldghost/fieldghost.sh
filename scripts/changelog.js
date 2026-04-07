(function () {
  "use strict";

  var COMMITS_API =
    "https://api.github.com/repos/fieldghost/fieldghost.sh/commits?per_page=1";

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return iso;
    }
  }

  async function main() {
    var root = document.getElementById("changelog-root");
    if (!root) return;

    root.innerHTML = "";
    root.appendChild(el("p", "changelog-status", "Loading latest commit…"));

    try {
      var res = await fetch(COMMITS_API, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) {
        throw new Error("GitHub returned " + res.status);
      }
      var data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        throw new Error("No commits in response");
      }

      var c = data[0];
      var message = (c.commit && c.commit.message) || "";
      var subject = message.split("\n")[0].trim() || "(no message)";
      var when =
        (c.commit && c.commit.committer && c.commit.committer.date) ||
        (c.commit && c.commit.author && c.commit.author.date) ||
        "";
      var htmlUrl = c.html_url || "";
      var sha = (c.sha && c.sha.slice(0, 7)) || "";

      root.innerHTML = "";

      var title = el("h2", "changelog-heading", "Changelog");
      root.appendChild(title);

      var summary = el("p", "changelog-subject", subject);
      root.appendChild(summary);

      var meta = el("p", "changelog-meta", "");
      var parts = [];
      if (when) parts.push(formatDate(when));
      if (sha) parts.push(sha);
      meta.textContent = parts.join(" · ");
      root.appendChild(meta);

      if (htmlUrl) {
        var link = el("a", "theme-switch changelog-link", "View commit on GitHub");
        link.href = htmlUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.textDecoration = "none";
        link.style.display = "inline-block";
        link.style.marginTop = "0.75rem";
        root.appendChild(link);
      }
    } catch (err) {
      root.innerHTML = "";
      root.appendChild(el("h2", "changelog-heading", "Changelog"));
      root.appendChild(
        el(
          "p",
          "changelog-error",
          "Could not load the latest commit. " + String(err.message || err)
        )
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
