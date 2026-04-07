(function () {
  "use strict";

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const DICT_URL = "/data/learn-dictionary.json";

  function firstLetter(title) {
    const ch = (title && title.trim()[0]) || "";
    const u = ch.toUpperCase();
    return u >= "A" && u <= "Z" ? u : "#";
  }

  function groupByLetter(entries) {
    const map = {};
    for (const L of LETTERS) map[L] = [];
    map["#"] = [];
    for (const e of entries) {
      const L = firstLetter(e.title);
      (map[L] || map["#"]).push(e);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    }
    return map;
  }

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function thumbLetter(letter) {
    const d = el("div", "learn-thumb", letter);
    d.setAttribute("aria-hidden", "true");
    return d;
  }

  function renderResourceCard(item) {
    const a = el("a", "media-card");
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(thumbLetter((item.title && item.title[0]) || "·"));
    const h = el("h3", null, item.title);
    const p = el("p", null, item.description || "");
    a.appendChild(h);
    a.appendChild(p);
    return a;
  }

  async function main() {
    const root = document.getElementById("learn-root");
    if (!root) return;

    const subjectTabs = document.getElementById("learn-subject-tabs");
    const letterNav = document.getElementById("learn-letter-nav");
    const entryColumn = document.getElementById("learn-entry-list");
    const detailPanel = document.getElementById("learn-detail");

    let data;
    try {
      const res = await fetch(DICT_URL);
      if (!res.ok) throw new Error(res.statusText);
      data = await res.json();
    } catch (err) {
      detailPanel.innerHTML = "";
      detailPanel.appendChild(
        el("p", "learn-error", "Could not load the learning dictionary. " + String(err))
      );
      return;
    }

    const subjects = data.subjects || {};
    const subjectIds = Object.keys(subjects).sort((a, b) =>
      (subjects[a].label || "").localeCompare(subjects[b].label || "", undefined, { sensitivity: "base" })
    );

    let activeSubject = subjectIds[0];
    let activeLetter = null;
    let activeEntry = null;

    function firstAvailableLetter(subjectId) {
      const grouped = groupByLetter(subjects[subjectId].entries || []);
      const letter = LETTERS.find((L) => grouped[L] && grouped[L].length) || null;
      if (!letter && grouped["#"] && grouped["#"].length) return "#";
      return letter;
    }

    function renderSubjects() {
      subjectTabs.innerHTML = "";
      for (const id of subjectIds) {
        const btn = el("button", "learn-tab", subjects[id].label || id);
        btn.type = "button";
        btn.dataset.subject = id;
        if (id === activeSubject) btn.classList.add("learn-tab--active");
        btn.addEventListener("click", () => {
          activeSubject = id;
          activeEntry = null;
          activeLetter = firstAvailableLetter(id);
          renderSubjects();
          renderLetters();
          renderEntryList();
          renderDetail();
        });
        subjectTabs.appendChild(btn);
      }
    }

    function lettersForSubject() {
      const entries = subjects[activeSubject].entries || [];
      const grouped = groupByLetter(entries);
      return { grouped, entries };
    }

    function renderLetters() {
      const { grouped } = lettersForSubject();
      letterNav.innerHTML = "";
      const strip = el("div", "learn-letter-strip");
      for (const L of LETTERS) {
        const has = grouped[L] && grouped[L].length > 0;
        const b = el("button", "learn-letter" + (has ? "" : " learn-letter--empty"));
        b.type = "button";
        b.textContent = L;
        b.disabled = !has;
        if (activeLetter === L) b.classList.add("learn-letter--active");
        if (has) {
          b.addEventListener("click", () => {
            activeLetter = L;
            activeEntry = null;
            renderLetters();
            renderEntryList();
            renderDetail();
          });
        }
        strip.appendChild(b);
      }
      const other = grouped["#"] && grouped["#"].length > 0;
      if (other) {
        const b = el("button", "learn-letter");
        b.type = "button";
        b.textContent = "#";
        if (activeLetter === "#") b.classList.add("learn-letter--active");
        b.addEventListener("click", () => {
          activeLetter = "#";
          activeEntry = null;
          renderLetters();
          renderEntryList();
          renderDetail();
        });
        strip.appendChild(b);
      }
      letterNav.appendChild(strip);
    }

    function renderEntryList() {
      entryColumn.innerHTML = "";
      const { grouped } = lettersForSubject();
      if (!activeLetter) {
        entryColumn.appendChild(
          el("p", "learn-hint", "Pick a letter to see topics in this subject.")
        );
        return;
      }
      const list = grouped[activeLetter] || [];
      if (!list.length) {
        entryColumn.appendChild(el("p", "learn-hint", "No entries for this letter yet."));
        return;
      }
      const ul = el("ul", "learn-entry-ul");
      for (const e of list) {
        const li = el("li", "learn-entry-li");
        const btn = el("button", "learn-entry-name");
        btn.type = "button";
        btn.textContent = e.title;
        if (activeEntry === e) btn.classList.add("learn-entry-name--active");
        btn.addEventListener("click", () => {
          activeEntry = e;
          renderEntryList();
          renderDetail();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      }
      entryColumn.appendChild(ul);
    }

    function renderDetail() {
      detailPanel.innerHTML = "";
      if (!activeEntry) {
        detailPanel.appendChild(
          el("p", "learn-hint", "Select a topic to see free learning resources.")
        );
        return;
      }
      const title = el("h2", "learn-detail-title", activeEntry.title);
      const blurb = el("p", "learn-detail-blurb", activeEntry.blurb || "");
      detailPanel.appendChild(title);
      detailPanel.appendChild(blurb);

      const sub = el("h3", "learn-detail-sub", "Free learning");
      detailPanel.appendChild(sub);

      const resources = activeEntry.freeLearning || [];
      if (!resources.length) {
        detailPanel.appendChild(
          el("p", "learn-hint", "No resources listed yet — add some in data/learn-dictionary.json.")
        );
        return;
      }
      const grid = el("div", "media-grid learn-resource-grid");
      for (const r of resources) grid.appendChild(renderResourceCard(r));
      detailPanel.appendChild(grid);
    }

    activeLetter = firstAvailableLetter(activeSubject);

    renderSubjects();
    renderLetters();
    renderEntryList();
    renderDetail();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
