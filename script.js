window.onload = () => {
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const chompSound = new Audio("assets/chomp.mp3");
    const thankYouSound = new Audio("assets/thankyou.mp3");

    const pickles = [];
    const monsterImg = new Image();
    const pickleImg = new Image();
    monsterImg.src = "assets/monster.png";
    pickleImg.src = "assets/pickle.png";

    let monsterX = -200;
    let monsterY = 300;
    let monsterMoving = false;

    // Ensure canvas size matches display size
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        drawScene();
    });

    resizeCanvas();

    // Setup input after both images are loaded
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
            pickles.push({x, y});
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

    // Play thank you sound
    thankYouSound.play();

    // Optional: Show a "Thank You!" message on screen
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

    // Fade out after 3 seconds
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

      // 🍽️ Play chomp sound when reaching a pickle
      chompSound.currentTime = 0;
      chompSound.play();

      setTimeout(moveMonster, 300);
    }
  }, 20);
}


    // Landing screen logic
document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("landing-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  // 🔧 Force canvas to resize once visible
  resizeCanvas();
  drawScene();

  // Show instructions
  const instructions = document.getElementById("instructions");
  instructions.style.opacity = 1;

  setTimeout(() => {
    instructions.style.opacity = 0;
    setTimeout(() => instructions.style.display = "none", 500);
  }, 5000);
});


}



