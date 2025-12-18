document.addEventListener("DOMContentLoaded", () => {
  // Load side nav
  fetch('/components/sidenav.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);

      const sidenav = document.getElementById('sideNav');
      const toggle = document.querySelector('.sidenav-toggle');

      // Open/close side nav
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
    })
    .catch(err => console.error('Failed to load side nav:', err));
});
