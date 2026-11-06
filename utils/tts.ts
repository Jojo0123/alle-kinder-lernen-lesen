export const speak = (text: string) => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE'; // German
  utterance.rate = 0.9; // Slightly slower for kids
  utterance.pitch = 1.1; // Slightly higher pitch often sounds friendlier

  // Try to find a German voice
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(v => v.lang.includes('de'));
  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  window.speechSynthesis.speak(utterance);
};