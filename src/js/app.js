// Constantes pour les états de respiration
const STATES = {
  INHALE: "inhale",
  EXHALE: "exhale",
  PAUSED: "paused",
};

class BreathingApp {
  constructor() {
    this.state = STATES.PAUSED;
    this.duration = 3; // minutes
    this.breathRatio = "5/5"; // secondes
    this.animation = "size";
    this.soundEnabled = false;
    this.isRunning = false;

    // Éléments DOM
    this.form = document.querySelector(".config__form");
    this.segment = document.querySelector(".segment");
    this.inhaleSound = document.getElementById("inhaleSound");
    this.exhaleSound = document.getElementById("exhaleSound");

    // Vérification audio
    if (this.inhaleSound && this.exhaleSound) {
      this.inhaleSound.load();
      this.exhaleSound.load();
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isRunning) {
        this.stopExercise();
      }
    });

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Synchroniser l'input range avec le champ numérique
    const durationRange = this.form.querySelector('[name="duration"]');
    const durationNumber = this.form.querySelector('[name="duration-number"]');

    durationRange.addEventListener("input", (e) => {
      durationNumber.value = e.target.value;
      this.duration = parseInt(e.target.value);
    });

    durationNumber.addEventListener("input", (e) => {
      durationRange.value = e.target.value;
      this.duration = parseInt(e.target.value);
    });

    // Gérer le changement de ratio de respiration
    this.form
      .querySelector('[name="breath-ratio"]')
      .addEventListener("change", (e) => {
        this.breathRatio = e.target.value;
      });

    // Gérer le changement d'animation
    this.form.querySelectorAll('[name="animation"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.animation = e.target.value;
      });
    });

    // Gérer l'activation/désactivation du son
    this.form.querySelector('[name="son"]').addEventListener("change", (e) => {
      this.soundEnabled = e.target.checked;
      console.log((this.soundEnabled = e.target.checked));
    });

    // Démarrer l'exercice
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.startExercise();
    });
  }

  updateAnimation() {
    const circle = this.segment.querySelector(".exercice-disc");
    circle.classList.remove("exercice-disc-position");

    if (this.animation === "position") {
      circle.classList.add("exercice-disc-position");
    }
  }

  startExercise() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.form.style.display = "none";
    this.state = STATES.INHALE;

    // Créer la section d'exercice
    this.segment.innerHTML = `
      <div class="exercice">
        <h2 class="exercice-title">Respirez...</h2>
        <div class="exercice-disc"></div>
      </div>
    `;

    const circle = this.segment.querySelector(".exercice-disc");
    this.updateAnimation();

    // Calculer les durées
    const [inhaleTime, exhaleTime] = this.breathRatio.split("/").map(Number);
    const totalDuration = this.duration * 60 * 1000; // convertir en millisecondes

    requestAnimationFrame(() => {
      this.animate(circle, inhaleTime, exhaleTime);
    });

    // Arrêter après la durée spécifiée
    setTimeout(() => {
      this.stopExercise();
    }, totalDuration);
  }

  animate(circle, inhaleTime, exhaleTime) {
    if (!this.isRunning) {
      // Arrêter les sons si l'exercice n'est plus en cours
      if (this.soundEnabled) {
        if (this.inhaleSound) {
          this.inhaleSound.pause();
          this.inhaleSound.currentTime = 0;
        }
        if (this.exhaleSound) {
          this.exhaleSound.pause();
          this.exhaleSound.currentTime = 0;
        }
      }
      return;
    }

    const animate = () => {
      if (!this.isRunning) {
        return;
      }

      if (this.state === STATES.INHALE) {
        if (this.soundEnabled && this.inhaleSound) {
          this.inhaleSound.pause();
          this.inhaleSound.currentTime = 0;
          this.inhaleSound.play().catch((e) => console.log("Erreur audio:", e));
        }

        circle.classList.remove("exercice-disc--out");
        circle.classList.add("exercice-disc--in");

        const title = this.segment.querySelector(".exercice-title");
        title.textContent = "Inspirez...";

        this.state = STATES.EXHALE;
        setTimeout(animate, inhaleTime * 1000);
      } else {
        if (this.soundEnabled && this.exhaleSound) {
          this.exhaleSound.pause();
          this.exhaleSound.currentTime = 0;
          this.exhaleSound.play().catch((e) => console.log("Erreur audio:", e));
        }
        circle.classList.remove("exercice-disc--in");
        circle.classList.add("exercice-disc--out");

        const title = this.segment.querySelector(".exercice-title");
        title.textContent = "Expirez...";

        this.state = STATES.INHALE;
        setTimeout(animate, exhaleTime * 1000);
      }
    };

    this.state = STATES.INHALE;
    animate();
  }

  stopExercise() {
    this.isRunning = false;
    this.state = STATES.PAUSED;

    // Arrêter les sons
    if (this.inhaleSound) {
      this.inhaleSound.pause();
      this.inhaleSound.currentTime = 0;
    }
    if (this.exhaleSound) {
      this.exhaleSound.pause();
      this.exhaleSound.currentTime = 0;
    }
    this.segment.innerHTML = "";
    this.form.style.display = "block";
  }
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", () => {
  new BreathingApp();
});
