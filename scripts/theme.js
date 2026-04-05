var savedTheme = localStorage.getItem("theme");
var htmlElement = document.documentElement;

if (savedTheme === "terminal") {
  htmlElement.classList.add("terminal-mode");
} else if (savedTheme === "ghost") {
  htmlElement.classList.add("ghost-mode");
} else {
  htmlElement.classList.add("normal-mode");
}

document.addEventListener("DOMContentLoaded", function () {
  var toggleBtn = document.getElementById("theme-toggle");

  if (!toggleBtn) {
    return;
  }

  if (savedTheme === "terminal") {
    toggleBtn.textContent = "Return to Normal";
  } else {
    toggleBtn.textContent = "Initialize Terminal";
  }

  toggleBtn.addEventListener("click", function () {
    htmlElement.classList.toggle("terminal-mode");

    if (htmlElement.classList.contains("terminal-mode")) {
      localStorage.setItem("theme", "terminal");
      toggleBtn.textContent = "Return to Normal";
    } else {
      localStorage.setItem("theme", "normal");
      toggleBtn.textContent = "Initialize Terminal";
    }
  });
});
