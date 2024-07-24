document.addEventListener('DOMContentLoaded', () => {
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
});

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
