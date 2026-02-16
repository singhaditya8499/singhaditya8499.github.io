(() => {
  const container = document.getElementById("post-content");
  if (!container) return;

  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s) => {
    return s
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  const parseMarkdown = (md) => {
    md = md.replace(/^---[\s\S]*?---\n?/, "");
    const lines = md.split("\n");
    let html = "";
    let inUl = false;
    let inOl = false;
    let inCode = false;
    let code = [];

    const closeLists = () => {
      if (inUl) {
        html += "</ul>";
        inUl = false;
      }
      if (inOl) {
        html += "</ol>";
        inOl = false;
      }
    };

    for (const raw of lines) {
      const line = raw.trimEnd();

      if (line.startsWith("```")) {
        closeLists();
        if (!inCode) {
          inCode = true;
          code = [];
        } else {
          html += `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`;
          inCode = false;
          code = [];
        }
        continue;
      }

      if (inCode) {
        code.push(raw);
        continue;
      }

      if (!line.trim()) {
        closeLists();
        continue;
      }

      if (line.startsWith("### ")) {
        closeLists();
        html += `<h3>${inline(line.slice(4))}</h3>`;
        continue;
      }
      if (line.startsWith("## ")) {
        closeLists();
        html += `<h2>${inline(line.slice(3))}</h2>`;
        continue;
      }
      if (line.startsWith("# ")) {
        closeLists();
        html += `<h1>${inline(line.slice(2))}</h1>`;
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        if (!inOl) {
          closeLists();
          html += "<ol>";
          inOl = true;
        }
        html += `<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`;
        continue;
      }

      if (/^-\s+/.test(line)) {
        if (!inUl) {
          closeLists();
          html += "<ul>";
          inUl = true;
        }
        html += `<li>${inline(line.replace(/^-\s+/, ""))}</li>`;
        continue;
      }

      closeLists();
      html += `<p>${inline(line)}</p>`;
    }

    closeLists();
    return html;
  };

  const embedded = document.getElementById("md-source");
  const embeddedMd = embedded && typeof embedded.value === "string" ? embedded.value : "";
  if (embeddedMd.trim()) {
    container.innerHTML = parseMarkdown(embeddedMd);
    return;
  }

  fetch("./index.md")
    .then((res) => res.text())
    .then((md) => {
      container.innerHTML = parseMarkdown(md);
    })
    .catch(() => {
      container.innerHTML = "<p>Could not load post content.</p>";
    });
})();
