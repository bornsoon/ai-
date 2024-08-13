// menu-toggle.js
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-toggle').addEventListener('click', function() {
        const navi = document.querySelector('#navi');
        const login = document.querySelector('#login');

        navi.classList.toggle('active');
        if (navi.classList.contains('active')) {
            login.style.top = `${navi.offsetHeight + 90}px`; // Set #login position below #navi
        } else {
            login.style.top = '90px';
        }

        login.classList.toggle('active');
    });
});