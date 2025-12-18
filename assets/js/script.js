document.addEventListener("DOMContentLoaded", () => {
  // Determine relative path for fetching sidenav
  let pathPrefix = '';
  let isSubfolder = false;

  if (window.location.pathname.includes('/countries/')) {
    pathPrefix = '../';
    isSubfolder = true;
  }

  fetch(pathPrefix + 'components/sidenav.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);

      const sidenav = document.getElementById('sideNav');
      const toggle = document.querySelector('.sidenav-toggle');

      // Side nav toggle
      toggle.addEventListener('click', () => {
        sidenav.classList.toggle('open');
      });

      // Expand/collapse countries list
      const expandBtns = sidenav.querySelectorAll('.expand-btn');
      expandBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.parentElement.classList.toggle('expanded');
        });
      });

      if (isSubfolder) {
        // Adjust all root-level links (Home, Map)
        const rootLinks = sidenav.querySelectorAll('ul > li > a');
        rootLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (!href.includes('countries/')) {
            link.setAttribute('href', '../' + href);
          }
        });

        // Adjust country links inside the countries list
        const countryLinks = sidenav.querySelectorAll('.countries-list a');
        countryLinks.forEach(link => {
          const href = link.getAttribute('href'); // e.g., "countries/uk.html"
          // Remove "countries/" for links inside countries folder
          if (href.startsWith('countries/')) {
            link.setAttribute('href', href.replace('countries/', ''));
          }
        });
      }
    })
    .catch(err => console.error('Failed to load side nav:', err));
});
