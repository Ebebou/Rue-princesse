export function decryptTextEffect(
  element,
  {
    speed = 30,
    maxIterations = 10,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
    trigger = "hover", // 'hover' ou 'view'
  } = {}
) {
  let originalText = element.textContent;
  let interval = null;
  let iteration = 0;
  let running = false;

  function randomChar() {
    return characters[Math.floor(Math.random() * characters.length)];
  }

  function scrambleText(revealCount = 0) {
    let scrambled = "";
    for (let i = 0; i < originalText.length; i++) {
      if (originalText[i] === " " || i < revealCount) {
        scrambled += originalText[i];
      } else {
        scrambled += randomChar();
      }
    }
    element.textContent = scrambled;
  }

  function startEffect() {
    if (running) return;
    running = true;
    iteration = 0;
    let revealCount = 0;
    interval = setInterval(() => {
      if (iteration < maxIterations) {
        scrambleText(revealCount);
        iteration++;
      } else if (revealCount < originalText.length) {
        revealCount++;
        scrambleText(revealCount);
      } else {
        element.textContent = originalText;
        clearInterval(interval);
        running = false;
      }
    }, speed);
  }

  function resetEffect() {
    clearInterval(interval);
    element.textContent = originalText;
    running = false;
  }

  if (trigger === "hover") {
    element.addEventListener("mouseenter", startEffect);
    element.addEventListener("mouseleave", resetEffect);
  } else if (trigger === "view") {
    // Intersection Observer pour déclencher à l'apparition
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startEffect();
            obs.unobserve(element);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(element);
  }
}
