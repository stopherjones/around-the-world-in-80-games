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
    if (e.target.classList.contains("expand-btn")) {
      const item = e.target.parentElement;
      item.classList.toggle("expanded");

      e.target.setAttribute(
        "aria-expanded",
        item.classList.contains("expanded")
      );
    }
  });
}

/* ===========================
   Adjust Links for Subfolders
=========================== */
function adjustLinks(sidenav, pathPrefix, isSubfolder) {
  if (!isSubfolder) return;

  // Adjust root-level links
  sidenav.querySelectorAll("ul > li > a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href.includes("countries/")) {
      link.setAttribute("href", pathPrefix + href);
    }
  });

  // Adjust country links
  sidenav.querySelectorAll(".countries-list a").forEach(link => {
    const href = link.getAttribute("href");
    if (href.startsWith("countries/")) {
      link.setAttribute("href", href.replace("countries/", ""));
    }
  });
}

/* ===========================
   Country Search (Fixed)
=========================== */
function setupSearch(sidenav) {
  const searchInput = sidenav.querySelector("#countrySearch");
  if (!searchInput) return;

  const countriesRoot = sidenav.querySelector(".countries-item");

  // Create a "no results" message (hidden by default)
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

  searchInput.addEventListener("input", (e) => {
    const filter = e.target.value.toLowerCase();
    let anyMatchOverall = false;

    // Expand top-level Countries section when searching
    if (filter) {
      countriesRoot.classList.add("expanded");
    } else {
      countriesRoot.classList.remove("expanded");
    }

    const continentItems = sidenav.querySelectorAll(".continent-item");

    continentItems.forEach(continent => {
      const countriesItem = continent.querySelector(".countries-item");
      const countryLis = continent.querySelectorAll(".continent-list li");

      let hasMatch = false;

      countryLis.forEach(li => {
        const match = li.textContent.toLowerCase().includes(filter);
        li.style.display = match ? "" : "none";
        if (match) hasMatch = true;
      });

      if (filter) {
        // Expand continent only if it has matches
        continent.classList.toggle("expanded", hasMatch);

        // Hide continent entirely if no matches
        continent.style.display = hasMatch ? "" : "none";

        // Expand nested countries list if present
        if (countriesItem) {
          countriesItem.classList.toggle("expanded", hasMatch);
        }

        if (hasMatch) anyMatchOverall = true;

      } else {
        // Reset everything when search is cleared
        continent.classList.remove("expanded");
        continent.style.display = "";
        if (countriesItem) countriesItem.classList.remove("expanded");
        countryLis.forEach(li => (li.style.display = ""));
      }
    });

    // Show/hide "no results" message
    if (filter && !anyMatchOverall) {
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";
    }
  });
}
