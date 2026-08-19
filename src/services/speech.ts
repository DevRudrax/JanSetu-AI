import { Language } from '../types';

const LANG_CODE_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

// Check if Speech Recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// Check if Speech Synthesis is supported
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export class SpeechAssistant {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public startListening(
    language: Language = 'en',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.recognition.lang = LANG_CODE_MAP[language] || 'en-IN';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      onError('Microphone access failed.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public static speak(text: string, language: Language = 'en', onComplete?: () => void) {
    if (!isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODE_MAP[language] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best matching Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const langCode = LANG_CODE_MAP[language] || 'en-IN';
    const matchingVoice = voices.find(v => v.lang.replace('_', '-').startsWith(langCode.slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onComplete) {
      utterance.onend = onComplete;
      utterance.onerror = onComplete;
    }

    window.speechSynthesis.speak(utterance);
  }

  public static stopSpeaking() {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public static isSpeaking(): boolean {
    return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
  }
}
