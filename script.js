const menuBtn = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const themeBtn = document.getElementById("theme-toggle");
const year = document.getElementById("year");
const root = document.documentElement;

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  root.setAttribute("data-theme", "dark");
}

if (themeBtn) {
  const setLabel = () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.textContent = isDark ? "Light" : "Dark";
  };

  setLabel();

  themeBtn.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
    setLabel();
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}
