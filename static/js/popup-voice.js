// popup-voice.js
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

    // 기본 음성을 en-US 여성 음성으로 설정
    const defaultVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('female'));
    if (defaultVoice) {
        voiceSelect.value = defaultVoice.name;
    } else {
        // en-US 여성 음성이 없을 경우, en-US 음성으로 설정
        const defaultUSVoice = voices.find(voice => voice.lang === 'en-US');
        if (defaultUSVoice) {
            voiceSelect.value = defaultUSVoice.name;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if ('speechSynthesis' in window) {
        // 음성 목록이 변경될 때마다 populateVoiceList 호출
        speechSynthesis.onvoiceschanged = () => {
            populateVoiceList();
        };

        // 음성 목록 초기 로드
        populateVoiceList();

        const rate = document.getElementById('rate');
        const rateValue = document.getElementById('rateValue');
        rate.oninput = () => rateValue.textContent = rate.value;
        rate.value = 0.9; // 기본값 설정
        rateValue.textContent = 0.9;

        const pitch = document.getElementById('pitch');
        const pitchValue = document.getElementById('pitchValue');
        pitch.oninput = () => pitchValue.textContent = pitch.value;
        pitch.value = 1.1; // 기본값 설정
        pitchValue.textContent = 1.1;

        const volume = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
        volume.oninput = () => volumeValue.textContent = volume.value;
        volume.value = 0.9; // 기본값 설정
        volumeValue.textContent = 0.9;
    } else {
        console.log('Web Speech API가 지원되지 않습니다.');
    }
});

var check = document.querySelector("input[type='checkbox']");
check.addEventListener('click', function() {
    var state = this.checked ? 'ON' : 'OFF';
    var p = document.querySelectorAll('p');
    p[0].style.display = state === 'OFF' ? 'block' : 'none';
    p[1].style.display = state === 'ON' ? 'block' : 'none';
});

// 테스트 출력 버튼 추가
document.getElementById('test-voice').addEventListener('click', function() {
    const text = document.getElementById('user-text').value;
    speak(text);
});
