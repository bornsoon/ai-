// aitest.js

document.addEventListener('DOMContentLoaded', function() {
    const voiceToggle = document.getElementById('voiceToggle');
    const chatting = document.getElementById('chatting');
    const chattingWindow = document.getElementById('chatting-window');
    const inputBox = document.getElementById('input-box');
    const chatArea = document.getElementById('chat-area');
    const textWindowButton = document.getElementById('text-window');
    const voiceSetButton = document.getElementById('voiceset');
    const popup = document.getElementById('popup');
    const layerBg = document.getElementById('layer_bg');

    // 문자채팅창 노출여부 선택기능
    textWindowButton.addEventListener('click', function() {
        chatArea.style.display = (chatArea.style.display === 'none' || chatArea.style.display === '') ? 'block' : 'none';
    });

    // 음성출력 설정 노출
    voiceSetButton.addEventListener('click', function() {
        layerBg.style.display = 'block';
    });

    document.getElementById('layerPopupClose').addEventListener('click', function() {
        layerBg.style.display = 'none';
    });

    // 스크롤 하단으로 이동 함수
    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    // 음성처리 기능
    document.getElementById('chat-form').onsubmit = async function(e) {
        e.preventDefault();

        // 유저 질문 처리
        let userInput = document.getElementById('user-input').value.trim();
        if (!userInput) {
            alert('Please enter some text before submitting.');
            return;
        }

        // 초기화 후 최근 사용자 메시지를 'chatting'에 추가
        chatting.innerHTML = '';
        const newUserMessage = document.createElement('div');
        newUserMessage.classList.add('chat-message', 'user-role');
        newUserMessage.innerHTML = `
            <div id="content-user">${userInput}</div>
            <div id="role-user">나</div>
        `;
        chatting.appendChild(newUserMessage);
        document.getElementById('user-input').value = ''; // 사용자 입력 필드 초기화

        // 'chatting-window'에 동일한 사용자 메시지를 추가하여 누적
        const newUserMessageForWindow = newUserMessage.cloneNode(true);
        chattingWindow.appendChild(newUserMessageForWindow);
        scrollToBottom(chattingWindow);

        // 사전입력 프롬프트 문자
        const preCharacter = '*You are a middle school teacher. Evaluate it based on Pre-A1 Starters’ speaking evaluation.*';
        const preDetail = '*Please answer in a dry sentence of less than 300 characters. The format is a simple 100-character evaluation + 10 points, @vocabulary: score @words: score at the end of the letter. *';
        userInput = preCharacter + preDetail + userInput; // Modify the userInput with prepended text
        console.log(userInput);

        // AI 응답 자리 임시메시지 추가
        const placeholderMessage = document.createElement('div');
        placeholderMessage.classList.add('chat-message', 'assistant-role');
        placeholderMessage.innerHTML = `
            <div id="role-assistant">Ai</div>
            <div id="content-assistant">.....AI 가 평가 중....</div>
        `;

        chatting.appendChild(placeholderMessage); // `chatting` 요소에도 임시 메시지를 추가
        const placeholderMessageForWindow = placeholderMessage.cloneNode(true);
        chattingWindow.appendChild(placeholderMessageForWindow); // `chatting-window` 요소에도 임시 메시지를 추가
        scrollToBottom(chattingWindow); // 채팅창 스크롤을 하단으로 이동

        // AI 응답 처리
        try {
            const response = await fetch('/api/aiChat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({model: "llama3", messages: [{role: "user", content: userInput}]})
            });

            if (!response.ok) throw new Error('서버 오류. 다시 시도해 주세요.');

            const data = await response.json();
            const assistantMessage = data.messages.find(msg => msg.role === 'assistant');

            if (assistantMessage && assistantMessage.content) {
                placeholderMessage.querySelector('#content-assistant').textContent = assistantMessage.content;
                placeholderMessageForWindow.querySelector('#content-assistant').textContent = assistantMessage.content;

                if (voiceToggle && voiceToggle.checked) {
                    speak(assistantMessage.content);
                }
            } else {
                throw new Error('Unexpected response format');
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Fetch error: ' + error.message);
        }
    };
});
