document.addEventListener("DOMContentLoaded", () => {
  // Determine relative path for fetching sidenav
  const pathPrefix = window.location.pathname.includes('/countries/') ? '../' : '';

  fetch(pathPrefix + 'components/sidenav.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);

      const sidenav = document.getElementById('sideNav');
      const toggle = document.querySelector('.sidenav-toggle');

      toggle.addEventListener('click', () => {
        sidenav.classList.toggle('open');
      });

      const expandBtns = sidenav.querySelectorAll('.expand-btn');
      expandBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.parentElement.classList.toggle('expanded');
        });
      });
    })
    .catch(err => console.error('Failed to load side nav:', err));
});
