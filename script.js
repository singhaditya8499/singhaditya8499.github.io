const root = document.documentElement;
const storedTheme = localStorage.getItem("theme");

if (storedTheme === "dark") {
  root.setAttribute("data-theme", "dark");
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";

  if (isDark) {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
