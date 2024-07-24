document.addEventListener('DOMContentLoaded', function () {
    let recognition;
    let isRecording = false;
    let timeoutDuration = 10000; // 기본 시간 10초
    let inactivityTimer;

    const chatForm = document.getElementById('chat-form');

    chatForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 기본 폼 제출 방지
        submitForm();
    });

    function submitForm() {
        const userInput = document.getElementById('user-input');
        if (userInput.value.trim() !== '') {
            // chatForm.submit(); // 폼 제출 대신 직접 submit 이벤트 핸들러 호출
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            chatForm.dispatchEvent(submitEvent);
        }
    }

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

    window.toggleRecognition = toggleRecognition;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.saveSettings = saveSettings;
});
