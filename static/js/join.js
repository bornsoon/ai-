// app/auth/static/js/join.js

document.getElementById('join-form').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    const password1 = document.getElementById('password1').value;
    
    if (password !== password1) {
        alert('비밀번호가 일치하지 않습니다.');
        event.preventDefault();
    }
});

// Adding AJAX check for UserID uniqueness
document.getElementById('check-id-button').addEventListener('click', function() {
    const userid = document.getElementById('userid').value; // Ensure you have correct ID for user input
    if (!userid) {
        alert('ID를 입력하세요.');
        return;
    }

    fetch(`/check-userid?userid=${encodeURIComponent(userid)}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                alert('이미 사용 중인 아이디입니다.');
            } else {
                alert('사용 가능한 아이디입니다.');
            }
        })
        .catch(error => console.error('Error:', error));
});

