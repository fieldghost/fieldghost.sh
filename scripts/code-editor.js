(function () {
  var STORAGE_KEY = "fieldghost.codeEditor";
  var STORAGE_VERSION = 1;
  var PREVIEW_DEBOUNCE_MS = 320;
  var SAVE_DEBOUNCE_MS = 400;

  var TEMPLATES = {
    html:
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Preview</title>\n  <style>\n    body { font-family: system-ui, sans-serif; margin: 1rem; }\n  </style>\n</head>\n<body>\n  <h1>Hello</h1>\n  <p>Edit this document; the preview updates as you type.</p>\n</body>\n</html>\n',
    css:
      "body {\n  font-family: system-ui, sans-serif;\n  margin: 1rem;\n  background: #fafafa;\n  color: #3a403d;\n}\n\nh1 {\n  color: #7d9d89;\n}\n\n.css-preview-sample {\n  padding: 0.5rem 1rem;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  display: inline-block;\n}\n",
    javascript:
      'document.body.innerHTML =\n  \'<p style="font-family:system-ui,sans-serif">Hello from JavaScript</p>\';\n',
    plain_text: "Plain text preview\n\nSwitch language or reset a template to try HTML, CSS, or JavaScript.\n",
  };

  var MODE_ORDER = ["html", "css", "javascript", "plain_text"];

  var MODE_REGISTRY = {
    html: {
      label: "HTML",
      aceMode: "ace/mode/html",
      preview: "iframe",
    },
    css: {
      label: "CSS",
      aceMode: "ace/mode/css",
      preview: "iframe",
    },
    javascript: {
      label: "JavaScript",
      aceMode: "ace/mode/javascript",
      preview: "iframe",
    },
    plain_text: {
      label: "Plain text",
      aceMode: "ace/mode/plain_text",
      preview: "iframe",
    },
  };

  var ACE_BASE = "/assets/vendor/ace";
  var THEME_LIGHT = "ace/theme/chrome";
  var THEME_DARK = "ace/theme/twilight";

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scrubInlineClosing(content, tagName) {
    var re = new RegExp("</" + tagName, "gi");
    return String(content).replace(re, "<\\/" + tagName);
  }

  function buildPreviewSrcdoc(modeId, content) {
    var reg = MODE_REGISTRY[modeId];
    if (!reg || reg.preview !== "iframe") {
      return (
        "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body><p>No preview.</p></body></html>"
      );
    }

    if (modeId === "html") {
      return content;
    }

    if (modeId === "css") {
      var safeCss = scrubInlineClosing(content, "style");
      return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>CSS preview</title><style>" +
        safeCss +
        "</style></head><body><p class=\"css-preview-hint\">CSS preview</p><div class=\"css-preview-sample\">Sample</div></body></html>"
      );
    }

    if (modeId === "javascript") {
      var safeJs = scrubInlineClosing(content, "script");
      return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>JS preview</title></head><body><script>\n" +
        safeJs +
        "\n</script></body></html>"
      );
    }

    if (modeId === "plain_text") {
      return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Text preview</title><style>body{font-family:monospace,ui-monospace,sans-serif;margin:1rem;white-space:pre-wrap;word-break:break-word;}</style></head><body>" +
        escapeHtml(content) +
        "</body></html>"
      );
    }

    return content;
  }

  function debounce(fn, waitMs) {
    var timeoutId = null;
    return function () {
      var ctx = this;
      var args = arguments;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(function () {
        timeoutId = null;
        fn.apply(ctx, args);
      }, waitMs);
    };
  }

  function isTerminalSiteTheme() {
    return document.documentElement.classList.contains("terminal-mode");
  }

  function applyAceTheme(editor) {
    if (!editor) {
      return;
    }
    editor.setTheme(isTerminalSiteTheme() ? THEME_DARK : THEME_LIGHT);
  }

  function loadStoredState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") {
        return null;
      }
      if (data.storageVersion !== STORAGE_VERSION) {
        return null;
      }
      if (typeof data.content !== "string") {
        return null;
      }
      if (!MODE_REGISTRY[data.mode]) {
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveState(modeId, content) {
    try {
      var payload = JSON.stringify({
        storageVersion: STORAGE_VERSION,
        mode: modeId,
        content: content,
      });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      /* ignore quota / private mode */
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var editorHost = document.getElementById("ace-editor");
    var previewFrame = document.getElementById("code-editor-preview");
    var modeSelect = document.getElementById("code-editor-mode");
    var resetBtn = document.getElementById("code-editor-reset");
    var clearBtn = document.getElementById("code-editor-clear");

    if (!editorHost || !previewFrame || !modeSelect || typeof window.ace === "undefined") {
      return;
    }

    ace.config.set("basePath", ACE_BASE);

    var editor = ace.edit("ace-editor");
    editor.setOptions({
      fontSize: 14,
      showPrintMargin: false,
      tabSize: 2,
      useSoftTabs: true,
      wrap: true,
    });
    applyAceTheme(editor);

    var i;
    for (i = 0; i < MODE_ORDER.length; i++) {
      var id = MODE_ORDER[i];
      var opt = document.createElement("option");
      opt.value = id;
      opt.textContent = MODE_REGISTRY[id].label;
      modeSelect.appendChild(opt);
    }

    var stored = loadStoredState();
    var currentMode = stored ? stored.mode : "html";
    var initialContent = stored
      ? stored.content
      : TEMPLATES[currentMode] || TEMPLATES.html;

    modeSelect.value = currentMode;
    editor.session.setMode(MODE_REGISTRY[currentMode].aceMode);
    editor.setValue(initialContent, -1);

    function updatePreview() {
      var html = buildPreviewSrcdoc(currentMode, editor.getValue());
      previewFrame.srcdoc = html;
    }

    var schedulePreview = debounce(updatePreview, PREVIEW_DEBOUNCE_MS);
    var scheduleSave = debounce(function () {
      saveState(currentMode, editor.getValue());
    }, SAVE_DEBOUNCE_MS);

    function onEditorChange() {
      schedulePreview();
      scheduleSave();
    }

    editor.session.on("change", onEditorChange);

    modeSelect.addEventListener("change", function () {
      var next = modeSelect.value;
      if (!MODE_REGISTRY[next]) {
        return;
      }
      currentMode = next;
      editor.session.setMode(MODE_REGISTRY[next].aceMode);
      saveState(currentMode, editor.getValue());
      updatePreview();
    });

    resetBtn.addEventListener("click", function () {
      var tpl = TEMPLATES[currentMode];
      if (tpl === undefined) {
        tpl = "";
      }
      editor.setValue(tpl, -1);
      saveState(currentMode, editor.getValue());
      updatePreview();
    });

    clearBtn.addEventListener("click", function () {
      editor.setValue("", -1);
      saveState(currentMode, editor.getValue());
      updatePreview();
    });

    if (typeof MutationObserver !== "undefined") {
      var mo = new MutationObserver(function () {
        applyAceTheme(editor);
      });
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    updatePreview();
  });
})();
