import speech_recognition as sr
import pyttsx3
import os

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    engine = pyttsx3.init()

    try:
        with sr.AudioFile(file_path) as source:
            audio = recognizer.record(source)
        text = recognizer.recognize_google(audio)
        audio_output_path = os.path.splitext(file_path)[0] + '_output.mp3'
        engine.save_to_file(text, audio_output_path)
        engine.runAndWait()
        return {"text": text, "audio_path": audio_output_path}
    except sr.UnknownValueError:
        return {"error": "Google Speech Recognition could not understand audio"}
    except sr.RequestError as e:
        return {"error": f"Could not request results from Google Speech Recognition service; {e}"}
