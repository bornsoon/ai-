// setup.js

if (window.hasSetupJsLoaded) {
    console.warn('setup.js already loaded');
} else {
    window.hasSetupJsLoaded = true;

    let recognitionInstance;  // 이 변수는 이 파일 내에서만 사용하도록 변수명을 변경

    let isRecording = false;
    let timeoutDuration = 10000;
    let inactivityTimer;

    function toggleRecognition() {
        if (isRecording) {
            stopRecognition(true);
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
                recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognitionInstance.lang = 'en-US';
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;

                resetInactivityTimer();

                recognitionInstance.onresult = function (event) {
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
                    console.log('Final transcript:', finalTranscript);
                    document.getElementById('user-input').value = finalTranscript || interimTranscript;
                }

                recognitionInstance.onerror = function (event) {
                    let errorMessage = '오류가 발생했습니다: ' + event.error;
                    if (event.error === 'audio-capture') {
                        errorMessage = '마이크가 감지되지 않았습니다. 설정을 확인해주세요.';
                    } else if (event.error === 'no-speech') {
                        errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                    }
                    document.getElementById('user-input').value = errorMessage;
                    console.error('Speech recognition error:', event.error);
                }

                recognitionInstance.onend = function () {
                    if (isRecording) {
                        recognitionInstance.start();
                    } else {
                        document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOn;
                        document.getElementById('mic').classList.remove('on');
                        if (document.getElementById('user-input').value.trim()) {
                            window.submitForm(); // Call submitForm from chat.js
                        }
                    }
                }

                recognitionInstance.start();
                isRecording = true;
                document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOff;
                document.getElementById('mic').classList.add('on');
            })
            .catch(function (err) {
                console.error('Microphone access error:', err);
                alert('마이크 접근이 허용되지 않았습니다. 설정을 확인해주세요.');
            });
    }

    function stopRecognition(shouldSubmit = false) {
        if (recognitionInstance) {
            recognitionInstance.stop();
            isRecording = false;
            document.getElementById('mic-img').src = document.getElementById('mic').dataset.micOn;
            document.getElementById('mic').classList.remove('on');
            clearTimeout(inactivityTimer);
            if (shouldSubmit) {
                window.submitForm(); // Call submitForm from chat.js
            }
        }
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => stopRecognition(true), timeoutDuration);
    }

    function speak(text) {
        const voices = window.speechSynthesis.getVoices();

        if (voices.length === 0) {
            console.warn('No voices available. Please ensure voices are loaded.');
            speechSynthesis.onvoiceschanged = () => speak(text);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = document.getElementById('voiceSelect').value;
        const voice = voices.find(voice => voice.name === selectedVoice) || 
                      voices.find(voice => voice.lang.startsWith('en') && (voice.name.includes('Samantha') || voice.name.toLowerCase().includes('female')));

        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn('Selected voice not found, using default voice.');
        }

        utterance.rate = document.getElementById('rate').value;
        utterance.pitch = document.getElementById('pitch').value;
        utterance.volume = document.getElementById('volume').value;

        window.speechSynthesis.speak(utterance);
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

        const defaultVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name === 'Samantha') ||
                             voices.find(voice => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female'));

        if (defaultVoice) {
            voiceSelect.value = defaultVoice.name;
        } else {
            const fallbackVoice = voices.find(voice => voice.lang.startsWith('en'));
            if (fallbackVoice) {
                voiceSelect.value = fallbackVoice.name;
            }
        }
    }

    function saveSettings() {
        const timeoutInput = document.getElementById('timeout').value;
        timeoutDuration = parseInt(timeoutInput) * 1000;
        closeSettings();
    }

    function closeSettings() {
        document.getElementById('layer_bg').style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const voiceSetButton = document.getElementById('voiceset');
        const textWindowButton = document.getElementById('text-window');
        const setupContainer = document.getElementById('setup-container');  // 수정된 부분
        const chatArea = document.getElementById('chat-area');
    
        // 'S' 버튼으로 설정창 보이기/숨기기
        voiceSetButton.addEventListener('click', function() {
            if (setupContainer.style.display === 'none' || setupContainer.style.display === '') {
                setupContainer.style.display = 'block';
            } else {
                setupContainer.style.display = 'none';
            }
        });
    
        // 'M' 버튼으로 대화창 보이기/숨기기
        textWindowButton.addEventListener('click', function() {
            if (chatArea.style.display === 'none' || chatArea.style.display === '') {
                chatArea.style.display = 'block';
            } else {
                chatArea.style.display = 'none';
            }
        });
    
        // 기타 이벤트 리스너 추가
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.onsubmit = function(e) {
                e.preventDefault();
                submitForm();
            };
        }
    
        window.submitForm = submitForm;
    });
}
