(function () {
  "use strict";

  function activate(panelId) {
    document.querySelectorAll("[data-code-tab]").forEach(function (btn) {
      const on = btn.getAttribute("data-code-tab") === panelId;
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.classList.toggle("code-tab--active", on);
    });
    document.querySelectorAll("[data-code-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-code-panel") !== panelId;
    });
  }

  function init() {
    const tabs = document.querySelectorAll("[data-code-tab]");
    if (!tabs.length) return;

    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-code-tab");
        activate(id);
        if (history.replaceState) {
          history.replaceState(null, "", "#" + id);
        } else {
          window.location.hash = id;
        }
      });
    });

    var hash = (window.location.hash || "").replace(/^#/, "");
    if (hash && document.querySelector('[data-code-panel="' + hash + '"]')) {
      activate(hash);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
