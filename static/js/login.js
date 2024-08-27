// app/auth/static/js/login.js

document.getElementById('login-form').addEventListener('submit', function(event) {
    const userid = document.getElementById('userid').value;
    const password = document.getElementById('password').value;
    
    if (!userid || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        event.preventDefault();
    }
});
