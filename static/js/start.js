document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-first');
    
    startButton.addEventListener('click', function() {
        const situation = document.getElementById('situation-input').value;
        
        // 설정값을 localStorage에 저장
        localStorage.setItem('situation', situation);
        
        // 창 닫기
        window.close();
    });
});
