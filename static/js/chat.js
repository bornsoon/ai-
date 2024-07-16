document.getElementById('chat-form').onsubmit = async function(e) {
    e.preventDefault();
    const userInput = document.getElementById('user-input').value.trim();
    const streamCheckbox = document.getElementById('stream-checkbox');

    if (!userInput) {
        alert('입력내용을 먼저 입력해 주세요.');
        return;
    }

    const stream = streamCheckbox.checked; // 스트리밍 모드 여부 확인
    const chatting = document.getElementById('chatting');
    const chattingWindow = document.getElementById('chatting-window');
    const loadingIndicator = document.getElementById('loading');

    // Clear the #chatting div for the new message
    chatting.innerHTML = '';

    // 사용자 입력과 임시 메시지 추가
    const newUserMessage = document.createElement('div');
    newUserMessage.classList.add('chat-message');
    newUserMessage.innerHTML = `<pre class="chat-content">user: ${userInput}</pre>`;
    
    const newAssistantMessage = document.createElement('div');
    newAssistantMessage.classList.add('chat-message');
    newAssistantMessage.innerHTML = `<pre class="chat-content">assistant: <div class="loading"><span></span></div></pre>`;

    // Display the new user message in the #chatting div
    chatting.appendChild(newUserMessage);
    chatting.appendChild(newAssistantMessage);

    // Append the new user message to the #chatting-window div
    const userMessageClone = newUserMessage.cloneNode(true);
    chattingWindow.prepend(userMessageClone);

    try {
        const response = await fetch('/api/aiChat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({model: "llama3", messages: [{role: "user", content: userInput}], stream: stream})
        });

        if (!response.ok) {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(`Fetch error: ${errorData.error || 'Unknown Error'}`);
            } else {
                throw new Error('서버오류. 다시 시도해 주세요.');
            }
        }

        const data = await response.json();
        console.log('api_response:', data); // API 응답 디버깅 정보 출력

        // AI 응답으로 임시 메시지 교체
        const assistantMessage = data.messages.find(msg => msg.role === 'assistant');
        if (assistantMessage && assistantMessage.content) {
            newAssistantMessage.innerHTML = `<pre class="chat-content">assistant: ${assistantMessage.content}</pre>`;
        } else {
            throw new Error('Unexpected response format');
        }

        // Append the new assistant message to the #chatting-window div
        const assistantMessageClone = newAssistantMessage.cloneNode(true);
        chattingWindow.prepend(assistantMessageClone);

        // 사용자 입력 필드 초기화
        document.getElementById('user-input').value = '';
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Fetch error: ' + error.message);

        // 오류 발생 시 임시 메시지 제거
        chatting.removeChild(newAssistantMessage);
    }
};

document.getElementById('menu-toggle').addEventListener('click', function() {
    const naviUl = document.querySelector('#navi ul');
    const loginUl = document.querySelector('#login ul');
    
    naviUl.classList.toggle('active');
    loginUl.classList.toggle('active');
});

