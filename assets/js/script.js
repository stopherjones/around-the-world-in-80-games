// Detect whether we're running on GitHub Pages or locally
const BASE = window.location.pathname.includes("around-the-world-in-80-games")
  ? "/around-the-world-in-80-games"
  : "";

document.addEventListener("DOMContentLoaded", () => {
  const { pathPrefix, isSubfolder } = detectPath();
  loadSideNav(pathPrefix, isSubfolder);
});

/* ===========================
   Path Detection
=========================== */
function detectPath() {
  const isSubfolder = window.location.pathname.includes("/countries/");
  return {
    pathPrefix: isSubfolder ? "../" : "",
    isSubfolder
  };
}

/* ===========================
   Load Side Navigation
=========================== */
function loadSideNav(pathPrefix, isSubfolder) {
  // ✅ Use BASE for root-level components
  fetch(`${BASE}/components/sidenav.html`)
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);

      const sidenav = document.getElementById("sideNav");
      const toggle = document.querySelector(".sidenav-toggle");

      setupToggle(sidenav, toggle);
      setupExpandDelegation(sidenav);
      adjustLinks(sidenav, pathPrefix, isSubfolder);
      setupSearch(sidenav);
    })
    .catch(err => console.error("Failed to load side nav:", err));
}

/* ===========================
   Toggle Button
=========================== */
function setupToggle(sidenav, toggle) {
  toggle.addEventListener("click", () => {
    sidenav.classList.toggle("open");
  });
}

/* ===========================
   Expand/Collapse via Delegation
=========================== */
function setupExpandDelegation(sidenav) {
  sidenav.addEventListener("click", (e) => {
    const btn = e.target.closest(".expand-btn");
    if (!btn) return;

    const item = btn.parentElement;
    item.classList.toggle("expanded");

    btn.setAttribute(
      "aria-expanded",
      item.classList.contains("expanded")
    );
  });
}

/* ===========================
   Adjust Links for Subfolders
=========================== */
function adjustLinks(sidenav, pathPrefix, isSubfolder) {
  if (!isSubfolder) return;

  sidenav.querySelectorAll("ul > li > a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href.includes("countries/")) {
      link.setAttribute("href", pathPrefix + href);
    }
  });

  sidenav.querySelectorAll(".countries-list a").forEach(link => {
    const href = link.getAttribute("href");
    if (href.startsWith("countries/")) {
      link.setAttribute("href", href.replace("countries/", ""));
    }
  });
}

/* ===========================
   Search + Clear Button + No Results
=========================== */
function setupSearch(sidenav) {
  const searchInput = sidenav.querySelector("#countrySearch");
  const clearBtn = sidenav.querySelector("#clearSearch");
  if (!searchInput || !clearBtn) return;

  const countriesRoot = sidenav.querySelector(".countries-item");

  let noResults = sidenav.querySelector(".no-results");
  if (!noResults) {
    noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.textContent = "No matching countries found";
    noResults.style.display = "none";
    noResults.style.padding = "0.5rem 1rem";
    noResults.style.opacity = "0.8";
    sidenav.querySelector(".countries-list").prepend(noResults);
  }

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    let anyMatchOverall = false;

    clearBtn.style.display = filter ? "block" : "none";

    if (filter) {
      countriesRoot.classList.add("expanded");
    } else {
      countriesRoot.classList.remove("expanded");
    }

    const continentItems = sidenav.querySelectorAll(".continent-item");

    continentItems.forEach(continent => {
      const countryLis = continent.querySelectorAll(".continent-list li");
      let hasMatch = false;

      countryLis.forEach(li => {
        const match = li.textContent.toLowerCase().includes(filter);
        li.style.display = match ? "" : "none";
        if (match) hasMatch = true;
      });

      if (filter) {
        continent.classList.toggle("expanded", hasMatch);
        continent.style.display = hasMatch ? "" : "none";
        if (hasMatch) anyMatchOverall = true;
      } else {
        continent.classList.remove("expanded");
        continent.style.display = "";
        countryLis.forEach(li => (li.style.display = ""));
      }
    });

    noResults.style.display = filter && !anyMatchOverall ? "block" : "none";
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    searchInput.dispatchEvent(new Event("input"));
  });
}

/* ===========================
   Load tournaments
=========================== */

async function loadTournaments() {
  const res = await fetch(`${BASE}/data/tournaments.json`);
  const data = await res.json();

  const container = document.getElementById("tournaments");

  Object.values(data).forEach(t => {
    const div = document.createElement("div");
    div.className = "tournament";

    if (t.status === "completed") {
      div.innerHTML = `
        <h3>Tournament ${t.id} — Completed</h3>
        <table>
          ${t.top5
            .map(
              p => `<tr><td>${p.rank}</td><td>${p.name}</td></tr>`
            )
            .join("")}
        </table>
      `;
    } else if (t.status === "ongoing") {
      div.innerHTML = `
        <h3>Tournament ${t.id} — Ongoing</h3>
        <p>Round: ${t.round || "Unknown"}</p>
      `;
    } else {
      div.innerHTML = `
        <h3>Tournament ${t.id} — Error</h3>
        <p>${t.error}</p>
      `;
    }

    container.appendChild(div);
  });
}

loadTournaments();
