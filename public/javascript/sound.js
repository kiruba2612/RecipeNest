let isSpeaking = false;

function readRecipe() {
  if (isSpeaking) {
    speechSynthesis.cancel(); // Stop previous speech
    isSpeaking = false;
    return;
  }

  let recipeName = document.querySelector(".card-title").innerText;
  let cuisine = document.querySelector(".text-muted").innerText;
  let ingredients = document.getElementById("ingredients").innerText;
  let steps = document.getElementById("steps").innerText;

  let textToRead = `Hello! Here is your recipe. ${recipeName}. ${cuisine}. Ingredients: ${ingredients}. Steps: ${steps}. Enjoy your cooking!`;

  let speech = new SpeechSynthesisUtterance(textToRead);
  speech.rate = 1; // Normal speed
  speech.pitch = 1.2; // Slightly higher pitch for a feminine tone
  speech.volume = 1; // Full volume
  speech.lang = "en-US"; // English Voice

  // Choose a polite lady's voice
  let voices = speechSynthesis.getVoices();
  let selectedVoice = voices.find(
    (voice) =>
      voice.name.includes("Google UK Female") || voice.name.includes("Female")
  );

  if (selectedVoice) {
    speech.voice = selectedVoice;
  }

  isSpeaking = true;
  speechSynthesis.speak(speech);

  speech.onend = function () {
    isSpeaking = false; // Reset after speaking ends
  };
}
