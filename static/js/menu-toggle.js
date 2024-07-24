// menu-toggle.js
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-toggle').addEventListener('click', function() {
        document.querySelector('#navi').classList.toggle('active');
        document.querySelector('#login').classList.toggle('active');
    });
});
