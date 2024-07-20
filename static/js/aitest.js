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

        // 'chatting-window'에 동일한 사용자 메시지를 추가하여 누적
        const newUserMessageForWindow = newUserMessage.cloneNode(true);
        chattingWindow.appendChild(newUserMessageForWindow);

        // 사전입력 프롬프트 문자
        const preText = 'Based on the speaking evaluation of Pre-A1 Starters, give 10 points based on the use of vocabulary and words used, as well as a brief evaluation based on the use of @vocabulary and the use of @words. Please keep your entire reply within 200 characters.';
        userInput = preText + userInput; // Modify the userInput with prepended text


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
                const newAssistantMessage = document.createElement('div');
                newAssistantMessage.classList.add('chat-message', 'assistant-role');
                newAssistantMessage.innerHTML = `
                    <div id="role-assistant">Ai</div>
                    <div id="content-assistant">${assistantMessage.content}</div>
                `;
                chatting.appendChild(newAssistantMessage);

                // 'chatting-window'에 AI 응답을 추가하여 누적
                const newAssistantMessageForWindow = newAssistantMessage.cloneNode(true);
                chattingWindow.appendChild(newAssistantMessageForWindow);

                if (voiceToggle.checked) {
                    speak(assistantMessage.content);
                }
            } else {
                throw new Error('Unexpected response format');
            }
            document.getElementById('user-input').value = ''; // 사용자 입력 필드 초기화
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Fetch error: ' + error.message);
        }
    };
});
