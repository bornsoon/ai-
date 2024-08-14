// chat.js

// Submit form and handle AI response
async function submitForm() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) {
        alert('텍스트를 입력해주세요.');
        return;
    }

    displayMessages(userInput, '.....AI 가 생각 중....');

    try {
        const response = await fetch('/api/aiChat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama3",
                messages: [{ role: "user", content: userInput }],
                menu: 'aitest'
            })
        });

        if (!response.ok) throw new Error('서버 오류. 다시 시도해 주세요.');

        const data = await response.json();
        console.log('Full AI response data:', data);

        const assistantMessage = data.content 
            ? data.content 
            : 'AI 응답을 처리하는 중 오류가 발생했습니다.';

        console.log('Extracted assistantMessage:', assistantMessage);

        updateAssistantMessage(assistantMessage);

        if (window.speak && document.getElementById('voiceToggle').checked) {
            window.speak(assistantMessage);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        updateAssistantMessage('AI 응답을 처리하는 중 오류가 발생했습니다.');
    }
}

// Display messages on the chat screen
function displayMessages(userInput, assistantMessage) {
    const chatting = document.getElementById('chatting');
    const chattingWindow = document.getElementById('chatting-window');

    chatting.innerHTML = '';
    const newUserMessage = document.createElement('div');
    newUserMessage.classList.add('chat-message', 'user-role');
    newUserMessage.innerHTML = `
        <div>
            <div id="role-user">나</div>    
            <pre class="content-user">${userInput}</pre>
        </div>
    `;
    chatting.appendChild(newUserMessage);
    document.getElementById('user-input').value = '';

    const newUserMessageForWindow = newUserMessage.cloneNode(true);
    chattingWindow.appendChild(newUserMessageForWindow);
    scrollToBottom(chattingWindow);

    const placeholderMessage = document.createElement('div');
    placeholderMessage.classList.add('chat-message', 'assistant-role');
    placeholderMessage.innerHTML = `
        <div>
            <div id="role-assistant">Ai</div>
            <pre class="content-assistant">${assistantMessage}</pre>
        </div>
    `;
    chatting.appendChild(placeholderMessage);
    const placeholderMessageForWindow = placeholderMessage.cloneNode(true);
    chattingWindow.appendChild(placeholderMessageForWindow);
    scrollToBottom(chattingWindow);
}

// Update the displayed AI response message
function updateAssistantMessage(assistantMessage) {
    const assistantMessageElement = document.querySelector('.content-assistant:last-child');
    if (assistantMessageElement) {
        assistantMessageElement.textContent = assistantMessage;
    } else {
        console.warn('No assistant message element found to update.');
    }

    console.log('Displayed AI response:', assistantMessage);
}

// Scroll to the bottom of the chat window
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// Attach event listeners after the DOM has loaded
document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const voiceSetButton = document.getElementById('voiceset');
    const textWindowButton = document.getElementById('text-window');
    const setupContainer = document.getElementById('setup-container');
    const chatArea = document.getElementById('chat-area');
    const listenButton = document.getElementById('listen');

    if (chatForm) {
        chatForm.onsubmit = function (e) {
            e.preventDefault();
            submitForm();
        };
    }

    if (voiceSetButton) {
        console.log("'S' 버튼이 존재합니다.");
        // 'S' 버튼으로 설정창 보이기/숨기기
        voiceSetButton.addEventListener('click', function() {
            if (setupContainer.style.display === 'none' || setupContainer.style.display === '') {
                setupContainer.style.display = 'block';
            } else {
                setupContainer.style.display = 'none';
            }
        });
    } else {
        console.warn("'S' 버튼을 찾을 수 없습니다.");
    }

    // if (textWindowButton) {
    //     console.log("'M' 버튼이 존재합니다.");
    //     // 'M' 버튼으로 대화창 보이기/숨기기
        textWindowButton.addEventListener('click', function() {
            // chatArea.style.display = (chatArea.style.display === 'none' || chatArea.style.display === '') ? 'block' : 'none';
            if (chatArea.style.display === 'none' || chatArea.style.display === '') {
                console.log("'M' 버튼 클릭 - 대화창 보이기");
                chatArea.style.display = 'block';
            } else {
                console.log("'M' 버튼 클릭 - 대화창 숨기기");
                chatArea.style.display = 'none';
            }
            console.log("현재 chatArea의 display 상태:", chatArea.style.display);
        });
    // } else {
    //     console.warn("'M' 버튼을 찾을 수 없습니다.");
    // }

    if (listenButton) {
        console.log("'L' 버튼이 존재합니다.");
        // 'L' 버튼 클릭 시 start.html 설정창 열기
        listenButton.addEventListener('click', function() {
            console.log('L 버튼 클릭됨');
            const startContainer = document.getElementById('start-container');
            if (startContainer) {
                startContainer.style.display = 'block';
            } else {
                console.warn('start-container를 찾을 수 없습니다.');
            }
        });
    } else {
        console.warn("'L' 버튼을 찾을 수 없습니다.");
    }

    window.submitForm = submitForm; // Expose submitForm to global scope
});