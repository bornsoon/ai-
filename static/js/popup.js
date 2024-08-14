document.addEventListener('DOMContentLoaded', function () {
    let recognition;
    let isRecording = false;
    let timeoutDuration = 10000; // 기본 시간 10초
    let inactivityTimer;

    const chatForm = document.getElementById('chat-form');
    const chatting = document.getElementById('chatting'); // 채팅 영역
    const chattingWindow = document.getElementById('chatting-window'); // 채팅 기록 영역

    // 스크롤 하단으로 이동 함수
    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    // 음성 인식 시작/중지
    function toggleRecognition() {
        if (isRecording) {
            stopRecognition(true); // 전송을 위해 true를 인자로 전달
        } else {
            startRecognition();
        }
    }

    function startRecognition() {
        if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.lang = 'en-US';
                recognition.continuous = true;
                recognition.interimResults = true;

                resetInactivityTimer();

                recognition.onresult = function (event) {
                    resetInactivityTimer();
                    let interimTranscript = '';
                    let finalTranscript = '';
                    for (let i = 0; i < event.results.length; i++) {
                        let transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }
                    console.log('중간 내용:', interimTranscript); // 디버깅 로그
                    console.log('최종 내용:', finalTranscript); // 디버깅 로그
                    document.getElementById('user-input').value = finalTranscript || interimTranscript;
                }

                recognition.onerror = function (event) {
                    console.error('음성 인식 오류:', event.error);
                    let errorMessage = '오류가 발생했습니다: ' + event.error;
                    if (event.error === 'audio-capture') {
                        errorMessage = '마이크를 확인해주세요.';
                    } else if (event.error === 'no-speech') {
                        errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                    }
                    document.getElementById('user-input').value = errorMessage;
                }

                recognition.onend = function () {
                    if (isRecording) {
                        console.log('음성 인식이 자동 종료되어 재시작합니다.');
                        recognition.start();
                    } else {
                        console.log('음성 인식이 종료되었습니다.');
                        document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOn;
                        document.getElementById('mic').classList.remove('on'); // on 클래스 제거
                        submitForm(); // 폼 전송
                    }
                }

                recognition.start();
                isRecording = true;
                document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOff;
                document.getElementById('mic').classList.add('on'); // on 클래스 추가
            })
            .catch(function (err) {
                console.error('마이크 액세스 오류:', err);
                document.getElementById('user-input').value = '마이크 액세스 오류: ' + err.message;
            });
    }

    function stopRecognition(shouldSubmit = false) {
        if (recognition) {
            recognition.stop();
            isRecording = false;
            document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOn;
            document.getElementById('mic').classList.remove('on'); // on 클래스 제거
            clearTimeout(inactivityTimer);
            if (shouldSubmit) {
                submitForm(); // 폼 전송
            }
        }
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => stopRecognition(true), timeoutDuration); // 10초 후 전송
    }

    chatForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 기본 폼 제출 방지
        submitForm();
    });

    function submitForm() {
        const userInput = document.getElementById('user-input').value.trim();
        if (userInput !== '') {
            // 폼 제출 대신, 필요한 로직만 수행하고 종료
            processUserInput(userInput);
            document.getElementById('user-input').value = ''; // 입력 필드 초기화
        }
    }

    async function processAiResponse(userInput) {
        const placeholderMessage = document.createElement('div');
        placeholderMessage.classList.add('chat-message', 'assistant-role');
        placeholderMessage.innerHTML = `
            <div>
                <div id="role-assistant">Ai</div>
                <pre class="content-assistant">.....AI 가 생각 중....</pre>
            </div>
        `;
        chatting.appendChild(placeholderMessage);
        chattingWindow.appendChild(placeholderMessage.cloneNode(true));
        scrollToBottom(chattingWindow);
    
        try {
            const response = await fetch('/api/aiChat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model: "llama3",
                    messages: [{role: "user", content: userInput}],
                    menu: 'aitest'  // aitest 메뉴 정보를 포함하여 전송
                })
            });
    
            if (!response.ok) throw new Error('서버 오류. 다시 시도해 주세요.');
    
            const data = await response.json();
            const combinedMessage = data.content;
    
            placeholderMessage.querySelector('.content-assistant').textContent = combinedMessage;
            chattingWindow.querySelector('.content-assistant').textContent = combinedMessage;
    
            if (voiceToggle && voiceToggle.checked) {
                speak(combinedMessage);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Fetch error: ' + error.message);
        }
    }
    
    function processUserInput(userInput) {
        // 사용자 입력을 처리하는 로직을 구현합니다.
        const newUserMessage = document.createElement('div');
        newUserMessage.classList.add('chat-message', 'user-role');
        newUserMessage.innerHTML = `
            <div>
                <div id="role-user">나</div>
                <pre class="content-user">${userInput}</pre>
            </div>
        `;
        chatting.appendChild(newUserMessage);
        chattingWindow.appendChild(newUserMessage.cloneNode(true));
        scrollToBottom(chattingWindow);
    
        // AI 응답 처리 로직을 호출
        processAiResponse(userInput);
    }

    window.toggleRecognition = toggleRecognition;  // 전역에서 접근 가능하도록 설정
    window.stopRecognition = stopRecognition;  // 전역에서 접근 가능하도록 설정

    // 음성 출력 설정 스크립트
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = () => {
            populateVoiceList();
        };

        populateVoiceList();

        const rate = document.getElementById('rate');
        const rateValue = document.getElementById('rateValue');
        rate.oninput = () => rateValue.textContent = rate.value;

        const pitch = document.getElementById('pitch');
        const pitchValue = document.getElementById('pitchValue');
        pitch.oninput = () => pitchValue.textContent = pitch.value;

        const volume = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volume.oninput = () => volumeValue.textContent = volume.value;

        const testVoiceButton = document.getElementById('test-voice');
        testVoiceButton.addEventListener('click', () => {
            const text = document.getElementById('user-text').value;
            speak(text);
        });

        const voiceToggle = document.getElementById('voiceToggle');
        voiceToggle.addEventListener('change', () => {
            const state = voiceToggle.checked ? 'ON' : 'OFF';
            document.querySelectorAll('p').forEach((p, index) => {
                p.style.display = (index === 0 && state === 'OFF') || (index === 1 && state === 'ON') ? 'block' : 'none';
            });
        });
    } else {
        console.log('Web Speech API가 지원되지 않습니다.');
    }

    function populateVoiceList() {
        const voiceSelect = document.getElementById('voiceSelect');
        const voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = voice.name;
            voiceSelect.appendChild(option);
        });

        const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const defaultVoice = isAppleDevice
            ? voices.find(voice => voice.lang === 'en-US' && voice.name === 'Samantha')
            : voices.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('female'));

        if (defaultVoice) {
            voiceSelect.value = defaultVoice.name;
        } else {
            const defaultUSVoice = voices.find(voice => voice.lang === 'en-US');
            if (defaultUSVoice) {
                voiceSelect.value = defaultUSVoice.name;
            }
        }
    }

    function speak(text) {
        const speech = new SpeechSynthesisUtterance(text);
        const selectedVoice = document.getElementById('voiceSelect').value;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(voice => voice.name === selectedVoice);

        if (voice) speech.voice = voice;
        speech.rate = document.getElementById('rate').value || 0.9;
        speech.pitch = document.getElementById('pitch').value || 1.1;
        speech.volume = document.getElementById('volume').value || 0.9;

        window.speechSynthesis.speak(speech);
    }

    document.getElementById('layerPopupClose').addEventListener('click', function () {
        document.getElementById('layer_bg').style.display = 'none';
    });

    // 음성 입력 설정 스크립트
    function openSettings() {
        document.getElementById('settingsPopup').style.display = 'block';
    }

    function closeSettings() {
        document.getElementById('settingsPopup').style.display = 'none';
    }

    function saveSettings() {
        const timeoutInput = document.getElementById('timeout').value;
        timeoutDuration = parseInt(timeoutInput) * 1000;
        closeSettings();
    }

    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.saveSettings = saveSettings;
});
