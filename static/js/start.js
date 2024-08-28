document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-first');

    // 시작 버튼 클릭 이벤트
    startButton.addEventListener('click', async function() {
        const situationSelect = document.getElementById('situation-select').value;
        const situationInput = document.getElementById('situation-input').value;
        const difficulty = document.getElementById('difficulty-select').value;

        // 상황 설정과 입력 중 하나만 선택하도록 처리
        const situation = situationInput + situationSelect;

        // 설정 값으로 첫 질문 생성
        const userInput = `${situation} 상황에서 난이도는 ${difficulty}로 설정되었습니다. 영어로 질문해줘.`;

        // 콘솔에 userInput 출력 (디버깅 용도)
        console.log('Submitting initial question to AI:', userInput);

        try {
            // 서버에 데이터 전송
            const response = await fetch('/api/aiChat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3",
                    messages: [{ role: "user", content: userInput }],
                    menu: 'chat'
                })
            });

            if (!response.ok) throw new Error('서버 오류. 다시 시도해 주세요.');

            const data = await response.json();
            console.log('Full AI response data:', data);

            // 서버 전송이 성공적으로 완료되면 창 닫기
            parent.document.getElementById('start-container').style.display = 'none';

        } catch (error) {
            console.error('Fetch error:', error);
            alert('서버에 데이터를 전송하는 중 오류가 발생했습니다.');
        }
    });
});
