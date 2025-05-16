window.onload = () => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const chompSound = new Audio("assets/chomp.mp3");
  const thankYouSound = new Audio("assets/thankyou.mp3");
  const avaThankYouSound = new Audio("assets/ava-thankyou.mp3");
  const placePickleSound = new Audio("assets/pickleplace.mp3");

  const pickles = [];
  const monsterImg = new Image();
  const pickleImg = new Image();
  const characterImg = new Image();
  pickleImg.src = "assets/pickle.png";
  monsterImg.src = "assets/monster.png"; // Pickle monster is always the same

  let selectedCharacter = ""; // Will be set when character is chosen
  let characterX = 100; // Starting position for the character
  let characterY = 300;
  let monsterX = -200; // Starting position off-screen for the monster
  let monsterY = 300;
  let monsterMoving = false;
  let characterMoving = false;
  let pickleCount = 0;
  let pickleEatenCount = 0; // Counter for eaten pickles
  let thankYouPlayed = false; // Flag to track if the thank you sound has played
  let bounceInterval; // For character bouncing animation

  // Create the counter element
  const counterElement = document.createElement("div");
  counterElement.style.position = "absolute";
  counterElement.style.top = "20px";
  counterElement.style.right = "20px";
  counterElement.style.background = "rgba(255, 255, 255, 0.85)";
  counterElement.style.padding = "10px 16px";
  counterElement.style.borderRadius = "12px";
  counterElement.style.fontSize = "2rem";
  counterElement.style.fontWeight = "bold";
  counterElement.style.color = "#333";
  counterElement.style.zIndex = 3;
  counterElement.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
  counterElement.textContent = "Pickles: 0";

  // Add CSS for animations
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes sparkleAnim {
      0% { transform: scale(0.2) rotate(0deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
      100% { transform: scale(1) rotate(360deg); opacity: 0; }
    }
    @keyframes fall {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(100vh) rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);

  // Get reference to the call monster button
  const callMonsterButton = document.getElementById("call-monster");
  // Initially disable the button
  callMonsterButton.disabled = true;
  callMonsterButton.style.opacity = "0.5";
  callMonsterButton.style.cursor = "not-allowed";

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawScene();
  });

  resizeCanvas();

  // Update assets loading to include the character image
  let loaded = 0;
  monsterImg.onload = onAssetsLoaded;
  pickleImg.onload = onAssetsLoaded;
  characterImg.onload = onAssetsLoaded;

  function onAssetsLoaded() {
    loaded++;
    if (loaded === 3) { // Now waiting for 3 images to load
      enableGame();
      drawScene();
    }
  }

  // ENHANCEMENT 1: Visual Feedback - Sparkle Effect
  function createSparkle(x, y) {
    const sparkle = document.createElement("div");
    sparkle.style.position = "absolute";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = "50px";
    sparkle.style.height = "50px";
    sparkle.style.backgroundColor = "#FFD700";
    sparkle.style.borderRadius = "50%";
    sparkle.style.zIndex = "4";
    sparkle.style.pointerEvents = "none";
    sparkle.style.boxShadow = "0 0 10px 5px rgba(255, 215, 0, 0.7)";
    sparkle.style.animation = "sparkleAnim 0.7s forwards";
    document.getElementById("game-area").appendChild(sparkle);

    // Remove after animation
    setTimeout(() => {
      try {
        document.getElementById("game-area").removeChild(sparkle);
      } catch (e) {
        // Element might have been removed already
      }
    }, 700);
  }

  // ENHANCEMENT 3: Confetti Effect
  function createConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      confetti.style.width = "15px";
      confetti.style.height = "15px";
      confetti.style.backgroundColor = getRandomColor();
      confetti.style.borderRadius = "50%";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = "-20px";
      confetti.style.opacity = "0.8";
      confetti.style.zIndex = "4";
      confetti.style.pointerEvents = "none";

      // Random initial positions and speeds
      const speed = 2 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const speedX = Math.cos(angle) * 2;

      // Animation
      confetti.style.animation = `fall ${speed}s linear forwards`;
      document.getElementById("game-area").appendChild(confetti);

      // Remove after animation
      setTimeout(() => {
        try {
          document.getElementById("game-area").removeChild(confetti);
        } catch (e) {
          // Element might have been removed already
        }
      }, speed * 1000);
    }
  }

  function getRandomColor() {
    const colors = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ENHANCEMENT 2: Character Bounce Animation
  function startCharacterBounce() {
    if (bounceInterval) clearInterval(bounceInterval);

    let direction = 1;
    let offset = 0;

    bounceInterval = setInterval(() => {
      offset += (0.2 * direction);
      if (offset > 5 || offset < 0) direction *= -1;

      // Only apply bounce if character isn't moving
      if (!characterMoving && !monsterMoving && selectedCharacter) {
        const baseY = 300; // Original character Y position
        characterY = baseY + offset;
        drawScene();
      }
    }, 50);
  }

  function stopCharacterBounce() {
    if (bounceInterval) {
      clearInterval(bounceInterval);
      bounceInterval = null;
    }
  }

  function enableGame() {
    canvas.addEventListener("click", (e) => {
      // Only allow placing pickles if not at the max and character not currently moving
      if (pickleCount < 10 && !characterMoving && !monsterMoving) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX - 25;
        const y = (e.clientY - rect.top) * scaleY - 25;

        // Store target location to move character there
        const targetX = x;
        const targetY = y;

        // Enable call button as soon as first pickle is about to be placed
        if (pickleCount === 0) {
          callMonsterButton.disabled = false;
          callMonsterButton.style.opacity = "1";
          callMonsterButton.style.cursor = "pointer";
        }

        // Temporarily stop bouncing while moving
        stopCharacterBounce();

        // Move character to place the pickle
        characterMoving = true;
        moveCharacterToPlacePickle(targetX, targetY);

        pickleCount++;
      }
    });

    callMonsterButton.addEventListener("click", () => {
      if (!monsterMoving && pickles.length > 0) {
        // Stop bouncing when character moves off screen
        stopCharacterBounce();

        // First move character off screen
        characterMoving = true;
        moveCharacterOffScreen(() => {
          // Then bring in the monster
          monsterMoving = true;

          // Reset the eaten pickles counter
          pickleEatenCount = 0;
          updateCounter();

          // Reset the thank you sound flag
          thankYouPlayed = false;

          // Add counter to game area if not already added
          if (!document.getElementById("game-area").contains(counterElement)) {
            document.getElementById("game-area").appendChild(counterElement);
          }

          // Play the thank you sound once when monster starts eating
          thankYouSound.currentTime = 0;
          thankYouSound.play();

          moveMonster();
        });
      }
    });
  }

  function updateCounter() {
    counterElement.textContent = `Pickles: ${pickleEatenCount}`;
  }

  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pickles
    pickles.forEach((p) => {
      const aspectRatio = pickleImg.naturalHeight / pickleImg.naturalWidth;
      const width = 50;
      const height = width * aspectRatio;
      ctx.drawImage(pickleImg, p.x, p.y, width, height);
    });

    // Draw character (if game has started)
    if (selectedCharacter) {
      ctx.drawImage(characterImg, characterX, characterY, 120, 120);
    }

    // Draw monster
    ctx.drawImage(monsterImg, monsterX, monsterY, 150, 150);
  }

  // New function to move character to place a pickle
  function moveCharacterToPlacePickle(targetX, targetY) {
    const steps = 40;
    const dx = (targetX - characterX) / steps;
    const dy = (targetY - characterY) / steps;
    let count = 0;

    const interval = setInterval(() => {
      characterX += dx;
      characterY += dy;
      drawScene();
      count++;
      if (count >= steps) {
        clearInterval(interval);
        // Place pickle at the character's location
        pickles.push({ x: targetX, y: targetY });

        // Play the pickle placement sound
        placePickleSound.currentTime = 0;
        placePickleSound.play();

        // Create visual sparkle effect at pickle location
        createSparkle(targetX + 25, targetY + 25);

        drawScene();
        characterMoving = false;

        // Resume bouncing after placing pickle
        startCharacterBounce();
      }
    }, 20);
  }

  // New function to move character off screen before monster appears
  function moveCharacterOffScreen(callback) {
    const targetX = -200; // Off the left side of the screen
    const steps = 30;
    const dx = (targetX - characterX) / steps;
    let count = 0;

    const interval = setInterval(() => {
      characterX += dx;
      drawScene();
      count++;
      if (count >= steps) {
        clearInterval(interval);
        characterMoving = false;
        callback(); // Call the callback function (bring in the monster)
      }
    }, 20);
  }

  function moveMonster() {
    if (pickles.length === 0) {
      monsterMoving = false;

      // Create confetti effect when all pickles are eaten
      createConfetti();

      // Show "Thank you!" message
      const message = document.createElement("div");
      message.textContent = "Thank you!";
      message.style.position = "absolute";
      message.style.top = "40%";
      message.style.left = "50%";
      message.style.transform = "translate(-50%, -50%)";
      message.style.background = "rgba(255, 255, 255, 0.9)";
      message.style.padding = "20px 30px";
      message.style.borderRadius = "16px";
      message.style.fontSize = "2rem";
      message.style.color = "#333";
      message.style.zIndex = "5";
      message.style.textAlign = "center";
      document.getElementById("game-area").appendChild(message);

      // Fade out after 3 seconds
      setTimeout(() => {
        message.style.transition = "opacity 1s ease";
        message.style.opacity = 0;
        setTimeout(() => {
          message.remove();

          // Reset for next round
          pickleCount = 0;

          // Move monster off screen
          const offScreenInterval = setInterval(() => {
            monsterX -= 10;
            drawScene();
            if (monsterX <= -200) {
              clearInterval(offScreenInterval);

              // Bring character back on screen
              characterX = -200;
              const returnInterval = setInterval(() => {
                characterX += 10;
                drawScene();
                if (characterX >= 100) {
                  clearInterval(returnInterval);

                  // Always play Ava's thank you sound when character returns
                  avaThankYouSound.currentTime = 0;
                  avaThankYouSound.play();

                  // Disable monster button again
                  callMonsterButton.disabled = true;
                  callMonsterButton.style.opacity = "0.5";
                  callMonsterButton.style.cursor = "not-allowed";

                  // Hide the counter
                  if (document.getElementById("game-area").contains(counterElement)) {
                    document.getElementById("game-area").removeChild(counterElement);
                  }

                  // Start character bouncing again
                  startCharacterBounce();
                }
              }, 20);
            }
          }, 20);
        }, 1000);
      }, 3000);

      return;
    }

    // Move monster to each pickle
    const target = pickles.shift();
    const steps = 50;
    const dx = (target.x - monsterX) / steps;
    const dy = (target.y - monsterY) / steps;
    let count = 0;

    const interval = setInterval(() => {
      monsterX += dx;
      monsterY += dy;
      drawScene();
      count++;
      if (count >= steps) {
        clearInterval(interval);
        chompSound.currentTime = 0;
        chompSound.play();

        // Increment the eaten pickle counter and update display
        pickleEatenCount++;
        updateCounter();

        setTimeout(moveMonster, 300);
      }
    }, 20);
  }

  // "Let's Play" → Show character selection
  document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("landing-screen").style.display = "none";

    // Modify the character screen content
    document.querySelector("#character-content h2").textContent = "Choose your Character";

    // Remove the pickle monster option if needed
    const characterOptions = document.getElementById("character-options");
    const pickleMonsterOption = characterOptions.querySelector('[data-character="monster.png"]');
    if (pickleMonsterOption) {
      characterOptions.removeChild(pickleMonsterOption);
    }

    document.getElementById("character-screen").style.display = "flex";
  });

  // Character selection → Start game
  document.querySelectorAll(".character-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedCharacter = option.getAttribute("data-character");
      characterImg.src = `assets/${selectedCharacter}`;

      document.getElementById("character-screen").style.display = "none";
      document.getElementById("game-screen").style.display = "block";

      // Update instructions
      const instructions = document.getElementById("instructions");
      instructions.textContent = "Tap the screen to place pickles for the Pickle Monster. You can place up to 10 pickles.";
      instructions.style.opacity = 1;

      setTimeout(() => {
        instructions.style.opacity = 0;
        setTimeout(() => instructions.style.display = "none", 500);
      }, 5000);

      resizeCanvas();
      drawScene();

      // Start character bouncing animation
      startCharacterBounce();
    });
  });
}



