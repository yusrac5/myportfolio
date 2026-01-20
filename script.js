const textElement = document.getElementById("typing-text");

const words = [
  "Digital Creator",
  "Software Developer"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentWord = words[wordIndex];
  
  if (!isDeleting) {
    textElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  } else {
    textElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  }

  let speed = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === currentWord.length) {
    speed = 1500; 
    isDeleting = true;
  } 
  else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    speed = 500;
  }

  setTimeout(typeEffect, speed);
}

typeEffect();
