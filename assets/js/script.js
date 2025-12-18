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
  fetch(pathPrefix + "components/sidenav.html")
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
