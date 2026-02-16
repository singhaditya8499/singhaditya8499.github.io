(() => {
  const menuBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const themeBtn = document.getElementById("theme-toggle");
  const year = document.getElementById("year");
  const root = document.documentElement;

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Ignore storage errors in restrictive browser modes.
      }
    },
  };

  const applyTheme = (theme) => {
    const dark = theme === "dark";
    if (dark) {
      root.setAttribute("data-theme", "dark");
      document.body.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      document.body.classList.remove("dark");
    }
    if (themeBtn) {
      themeBtn.textContent = dark ? "Light" : "Dark";
    }
  };

  const savedTheme = storage.get("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      storage.set("theme", next);
    });
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }
})();
