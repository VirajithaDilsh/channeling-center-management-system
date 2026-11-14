import { useCallback, useEffect, useRef, useState } from "react";

// Browser Web Speech API (free). Chrome/Edge send the audio to the browser
// vendor's servers for recognition; Firefox has no support. See the privacy
// notice in VoicePrescriptionDialog.
const SpeechRecognitionImpl =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ERROR_MESSAGES = {
  "not-allowed": "Microphone access was blocked. Allow the microphone for this site in the browser address bar, then try again.",
  "service-not-allowed": "Speech recognition is not allowed in this browser or by a browser policy.",
  "audio-capture": "No microphone was found. Connect a microphone and try again.",
  network: "Speech recognition needs an internet connection. Check your connection and try again.",
  "language-not-supported": "English speech recognition is not available in this browser.",
};

/**
 * @param {{ lang?: string, onFinalText?: (text: string) => void }} options
 *   onFinalText is called with each finalized chunk of recognized speech.
 */
export default function useSpeechRecognition({ lang = "en-US", onFinalText } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const wantListeningRef = useRef(false);
  const onFinalTextRef = useRef(onFinalText);

  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  }, [onFinalText]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return;
    setError("");

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimText = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalChunk += `${result[0].transcript} `;
        else interimText += result[0].transcript;
      }
      if (finalChunk) onFinalTextRef.current?.(finalChunk.trim());
      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      // Silence and manual aborts are normal, not failures.
      if (event.error === "no-speech" || event.error === "aborted") return;
      wantListeningRef.current = false;
      setError(ERROR_MESSAGES[event.error] || `Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      // Browsers end a session after a pause; keep going until the user stops.
      if (wantListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // fall through and finish
        }
      }
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    wantListeningRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      wantListeningRef.current = false;
      setError("Could not start the microphone. Please try again.");
    }
  }, [lang]);

  useEffect(() => () => {
    wantListeningRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  return { supported: !!SpeechRecognitionImpl, listening, interim, error, start, stop };
}
