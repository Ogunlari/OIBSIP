const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navToggle.checked = false;
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.checked = false;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            navToggle.checked = false;
        }
    });
}
