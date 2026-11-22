// Highlight the current section link in the nav
const links = document.querySelectorAll('.nav nav a');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--paper)' : '';
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('#about, #work, #contact').forEach(s => io.observe(s));
