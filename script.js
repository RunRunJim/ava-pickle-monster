window.onload = () => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const chompSound = new Audio("assets/chomp.mp3");
  const thankYouSound = new Audio("assets/thankyou.mp3");

  const pickles = [];
  const monsterImg = new Image();
  const pickleImg = new Image();
  pickleImg.src = "assets/pickle.png";

  let selectedCharacter = "monster.png"; // Default character
  monsterImg.src = `assets/${selectedCharacter}`;

  let monsterX = -200;
  let monsterY = 300;
  let monsterMoving = false;

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawScene();
  });

  resizeCanvas();

  let loaded = 0;
  monsterImg.onload = onAssetsLoaded;
  pickleImg.onload = onAssetsLoaded;

  function onAssetsLoaded() {
    loaded++;
    if (loaded === 2) {
      enableGame();
      drawScene();
    }
  }

  function enableGame() {
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX - 25;
      const y = (e.clientY - rect.top) * scaleY - 25;

      console.log("Pickle placed at:", x, y);
      pickles.push({ x, y });
      drawScene();
    });

    document.getElementById("call-monster").addEventListener("click", () => {
      if (!monsterMoving && pickles.length > 0) {
        monsterMoving = true;
        moveMonster();
      }
    });
  }

  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pickles.forEach((p) => {
      const aspectRatio = pickleImg.naturalHeight / pickleImg.naturalWidth;
      const width = 50;
      const height = width * aspectRatio;
      ctx.drawImage(pickleImg, p.x, p.y, width, height);
    });

    ctx.drawImage(monsterImg, monsterX, monsterY, 150, 150);
  }

  function moveMonster() {
    if (pickles.length === 0) {
      monsterMoving = false;
      thankYouSound.play();

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
      message.style.zIndex = 5;
      message.style.textAlign = "center";
      document.getElementById("game-area").appendChild(message);

      setTimeout(() => {
        message.style.transition = "opacity 1s ease";
        message.style.opacity = 0;
        setTimeout(() => message.remove(), 1000);
      }, 3000);

      return;
    }

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
        setTimeout(moveMonster, 300);
      }
    }, 20);
  }

  // "Let's Play" → Show character selection
  document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("landing-screen").style.display = "none";
    document.getElementById("character-screen").style.display = "flex";
  });

  // Character selection → Start game
  document.querySelectorAll(".character-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedCharacter = option.getAttribute("data-character");
      monsterImg.src = `assets/${selectedCharacter}`;

      document.getElementById("character-screen").style.display = "none";
      document.getElementById("game-screen").style.display = "block";

      resizeCanvas();
      drawScene();

      const instructions = document.getElementById("instructions");
      instructions.style.opacity = 1;
      setTimeout(() => {
        instructions.style.opacity = 0;
        setTimeout(() => instructions.style.display = "none", 500);
      }, 5000);
    });
  });
};




