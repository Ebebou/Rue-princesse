// Découpe le texte en span.lettre
function spanifyTextePresentation() {
  const texte = document.getElementById("texte-presentation");
  if (!texte || texte.dataset.spanified) return;
  let html = "";
  const raw = texte.innerHTML;
  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === "<") {
      // Garde les balises HTML (ex: <br>)
      let tag = "";
      while (i < raw.length && raw[i] !== ">") tag += raw[i++];
      tag += ">";
      html += tag;
    } else if (char.trim() === "") {
      html += char; // Garde les espaces
    } else {
      html += `<span class="lettre">${char}</span>`;
    }
  }
  texte.innerHTML = html;
  texte.dataset.spanified = "1";
}
spanifyTextePresentation();

// Animation lettre par lettre au scroll
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

let lastScrollY = window.scrollY;
let lastTime = Date.now();

window.addEventListener("scroll", function () {
  const texte = document.getElementById("texte-presentation");
  if (!texte) return;
  const lettres = texte.querySelectorAll(".lettre");
  if (!lettres.length) return;

  // Calcule la vitesse de scroll (pixels/ms)
  let now = Date.now();
  let deltaY = Math.abs(window.scrollY - lastScrollY);
  let deltaT = now - lastTime;
  let vitesse = Math.max(0.2, Math.min(2, deltaY / Math.max(1, deltaT))); // clamp entre 0.2 et 2

  lastScrollY = window.scrollY;
  lastTime = now;

  if (isElementInViewport(texte)) {
    lettres.forEach((lettre, i) => {
      setTimeout(() => {
        lettre.classList.add("visible");
      }, i * (60 / vitesse)); // Plus on scrolle vite, plus c'est rapide
    });
  } else {
    lettres.forEach((lettre) => lettre.classList.remove("visible"));
  }
});

function decryptTextEffect(
  element,
  {
    speed = 50,
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

document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".bar-mobile");
  const menu = document.getElementById("menu-mobile");
  const bg = document.getElementById("menu-mobile-bg");
  const closeBtn = document.getElementById("close-menu-mobile");

  if (burger && menu && bg && closeBtn) {
    burger.addEventListener("click", function () {
      menu.classList.toggle("open");
      bg.classList.toggle("open");
    });

    closeBtn.addEventListener("click", function () {
      menu.classList.remove("open");
      bg.classList.remove("open");
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        bg.classList.remove("open");
      });
    });

    bg.addEventListener("click", function () {
      menu.classList.remove("open");
      bg.classList.remove("open");
    });
  }

  // Système de panier
  let panier = [];

  function ajouterAuPanier(nom, prix) {
    const produit = panier.find((p) => p.nom === nom);
    if (produit) {
      produit.quantite += 1;
    } else {
      panier.push({ nom: nom, prix: prix, quantite: 1 });
    }
    mettreAJourAffichagePanier();
  }

  function supprimerDuPanier(index) {
    panier.splice(index, 1);
    mettreAJourAffichagePanier();
  }

  function mettreAJourCompteurPanier() {
    const panierCount = document.getElementById("panier-count");
    if (panierCount) {
      const totalQuantite = panier.reduce(
        (sum, produit) => sum + produit.quantite,
        0
      );
      panierCount.textContent = totalQuantite;
      if (totalQuantite > 0) {
        panierCount.style.display = "flex";
      } else {
        panierCount.style.display = "none";
      }
    }
  }

  function mettreAJourAffichagePanier() {
    const panierContent = document.getElementById("panier-content");
    const panierTotal = document.getElementById("panier-total");

    if (!panierContent || !panierTotal) return;

    if (panier.length === 0) {
      panierContent.innerHTML = "";
      panierTotal.textContent = "";
      mettreAJourCompteurPanier();
      return;
    }

    let html = "";
    let total = 0;

    panier.forEach((produit, index) => {
      const sousTotal = produit.prix * produit.quantite;
      total += sousTotal;
      html += `<div class="panier-item">
        <p>${produit.nom} x${produit.quantite} - ${formatPrix(
        sousTotal
      )} Fcfa</p>
        <svg class="icon-supprimer" data-index="${index}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>`;
    });

    panierContent.innerHTML = html;
    panierTotal.textContent = `Total: ${formatPrix(total)} Fcfa`;

    // Mettre à jour le compteur
    mettreAJourCompteurPanier();

    // Ajouter les écouteurs d'événements aux icônes de suppression
    panierContent.querySelectorAll(".icon-supprimer").forEach((icon) => {
      icon.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        supprimerDuPanier(index);
      });
    });
  }

  function formatPrix(prix) {
    return prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function envoyerCommandeWhatsApp() {
    if (panier.length === 0) {
      alert("Votre panier est vide !");
      return;
    }

    let message = "🛒 *Commande Rue Princesse*\n\n";
    message += "*Détails de la commande :*\n\n";

    let total = 0;
    panier.forEach((produit) => {
      const sousTotal = produit.prix * produit.quantite;
      total += sousTotal;
      message += `• ${produit.nom} x${produit.quantite}\n`;
      message += `  Prix unitaire: ${formatPrix(produit.prix)} Fcfa\n`;
      message += `  Sous-total: ${formatPrix(sousTotal)} Fcfa\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `*Total: ${formatPrix(total)} Fcfa*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `Merci pour votre commande ! 😊`;

    // Pour les liens WhatsApp Business personnalisés (wa.me/message/ID),
    // le paramètre text n'est pas toujours supporté
    // Solution : copier le message dans le presse-papiers et ouvrir le chat

    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Copier le message dans le presse-papiers
      navigator.clipboard
        .writeText(message)
        .then(() => {
          // Ouvrir WhatsApp Business
          const whatsappUrl = "https://wa.me/message/BL2FYTSICTJNP1";
          window.location.href = whatsappUrl;

          // Afficher un message informatif après un court délai
          setTimeout(() => {
            alert(
              "Votre message a été copié ! Collez-le dans WhatsApp (Ctrl+V ou Cmd+V) pour envoyer votre commande."
            );
          }, 1000);
        })
        .catch(() => {
          // Si la copie échoue, ouvrir quand même WhatsApp
          const whatsappUrl = "https://wa.me/message/BL2FYTSICTJNP1";
          window.location.href = whatsappUrl;
        });
    } else {
      // Fallback si le presse-papiers n'est pas disponible
      const whatsappUrl = "https://wa.me/message/BL2FYTSICTJNP1";
      window.location.href = whatsappUrl;

      // Afficher le message dans une alerte pour que l'utilisateur puisse le copier manuellement
      setTimeout(() => {
        alert(
          "Voici votre commande à copier et coller dans WhatsApp :\n\n" +
            message
        );
      }, 1000);
    }
  }

  // Ajouter des écouteurs d'événements sur tous les boutons "Acheter"
  document.querySelectorAll("[data-produit][data-prix]").forEach((button) => {
    button.addEventListener("click", function () {
      const nom = this.getAttribute("data-produit");
      const prix = parseInt(this.getAttribute("data-prix"));
      ajouterAuPanier(nom, prix);
    });
  });

  // Gestion du menu de commande (icône shop)
  const iconeShop = document.querySelector(".icone-shop");
  const menuCommande = document.getElementById("menu-commande");
  const boutonCommande = document.getElementById("bouton-commande");

  if (iconeShop && menuCommande) {
    iconeShop.addEventListener("click", function () {
      menuCommande.classList.toggle("open");
    });
  }

  // Gestion du bouton "Confirmer" pour envoyer sur WhatsApp
  if (boutonCommande) {
    boutonCommande.addEventListener("click", function () {
      envoyerCommandeWhatsApp();
    });
  }

  // Initialiser l'affichage du panier
  mettreAJourAffichagePanier();
  mettreAJourCompteurPanier();

  const videoSection = document.querySelector(".section-nouveaute");
  const video = videoSection.querySelector(".video-bg");

  // Utilisation de l'Intersection Observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0; // Optionnel : remet la vidéo au début quand on quitte la section
        }
      });
    },
    { threshold: 0.2 }
  ); // 0.5 = la moitié de la section doit être visible

  observer.observe(videoSection);

  const nouveautes = document.getElementById("decrypted-nouveautes");
  if (nouveautes) {
    decryptTextEffect(nouveautes, {
      speed: 40, // Vitesse de scrambling
      maxIterations: 12, // Nombre d'itérations avant de révéler
      trigger: "hover", // 'hover' ou 'view'
    });
  }

  // Animation pour les lignes de texte défilant (infinie, automatique)
  const scrollTexts = [
    { id: "scroll-velocity-text-1", direction: -1, speed: 1.2 },
    { id: "scroll-velocity-text-2", direction: 1, speed: 0.9 },
    { id: "scroll-velocity-text-3", direction: -1, speed: 0.7 },
  ];

  let positions = [0, 0, 0];

  function animateScrollTexts() {
    scrollTexts.forEach((textConfig, index) => {
      const text = document.getElementById(textConfig.id);
      if (text) {
        // Largeur du texte (une moitié, car on a dupliqué)
        const textWidth = text.scrollWidth / 2;
        positions[index] += textConfig.speed * textConfig.direction;

        // Boucle infinie
        if (positions[index] <= -textWidth) positions[index] += textWidth;
        if (positions[index] >= 0) positions[index] -= textWidth;

        text.style.transform = `translateX(${positions[index]}px)`;
      }
    });

    requestAnimationFrame(animateScrollTexts);
  }
  animateScrollTexts();
});

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("nav");
  const section = document.getElementById("section-speciale");
  const logoImg = document.getElementById("logo-img");

  function checkNavHighlight() {
    if (!nav || !section) return;
    const navRect = nav.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    // Si la nav est verticalement dans la section
    const isOverlapping =
      navRect.bottom > sectionRect.top && navRect.top < sectionRect.bottom;
    if (isOverlapping) {
      nav.classList.add("nav-highlight");
      // Changer l'image du logo pour la version blanche
      if (logoImg) {
        logoImg.src = "ressource/Rue Princesse. (Transparant blanc).png";
      }
    } else {
      nav.classList.remove("nav-highlight");
      // Remettre l'image du logo normale
      if (logoImg) {
        logoImg.src = "ressource/Rue Princesse. (Transparant).png";
      }
    }
    requestAnimationFrame(checkNavHighlight);
  }
  checkNavHighlight();

  function updateSVGColor(isActive) {
    const svg1 = document.getElementById("svg-1");
    if (svg1) {
      if (isActive) {
        svg1.classList.add("svg-highlight");
      } else {
        svg1.classList.remove("svg-highlight");
      }
    }
  }
});

// audio fond

const audio = document.getElementById("musique-fond");
const btn = document.getElementById("btn-audio");
const iconPath = document.getElementById("icon-path");

const ICONS = {
  // ▶ Play — cercle + triangle
  play: "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93ZM360-320l280-160-280-160v320Zm120-160Z",
  // ⏸ Pause — cercle + deux barres
  pause:
    "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93ZM360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-480Z",
  // 🔄 Restart — flèche circulaire
  restart:
    "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-60-160v-60q-50-14-85-52t-35-88q0-59 40.5-99.5T440-660v-60l120 100-120 100v-62q-34 0-57 23t-23 57q0 28 16.5 48.5T420-232v-28h-60v-60Zm180-210-120-100v62q34 0 57-23t23-57q0-28-16.5-48.5T480-718v28h60v60q-50 14-85 52t-35 88q0 59 40.5 99.5T520-350v60Z",
};

function setIcon(name) {
  iconPath.setAttribute("d", ICONS[name]);
}

// — Autoplay au chargement —
document.addEventListener("DOMContentLoaded", () => {
  setIcon("play"); // icône par défaut
  audio
    .play()
    .then(() => setIcon("pause"))
    .catch(() => {
      // Navigateur bloque l'autoplay → attend premier clic
      document.addEventListener(
        "pointerup",
        () => {
          audio.play().then(() => setIcon("pause"));
        },
        { once: true }
      );
    });
});

// — Gestion appui court / long —
let pressTimer = null;
let longPressed = false;

function startPress() {
  longPressed = false;
  pressTimer = setTimeout(() => {
    longPressed = true;
    setIcon("restart");
    audio.currentTime = 0;
    audio.play().then(() => {
      setTimeout(() => setIcon("pause"), 800); // repasse sur pause après feedback
    });
  }, 600);
}

function endPress() {
  clearTimeout(pressTimer);
  if (!longPressed) {
    // Clic court → toggle play / pause
    if (audio.paused) {
      audio.play().then(() => setIcon("pause"));
    } else {
      audio.pause();
      setIcon("play");
    }
  }
  longPressed = false;
}

function cancelPress() {
  clearTimeout(pressTimer);
  longPressed = false;
}

btn.addEventListener("mousedown", startPress);
btn.addEventListener("mouseup", endPress);
btn.addEventListener("mouseleave", cancelPress);

btn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    startPress();
  },
  { passive: false }
);
btn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    endPress();
  },
  { passive: false }
);
btn.addEventListener("touchcancel", cancelPress);

// Gestion de l'overlay "En savoir plus"
document.addEventListener("DOMContentLoaded", function () {
  const btnEnSavoirPlus = document.getElementById("btn-en-savoir-plus-1");
  const overlay = document.getElementById("overlay-en-savoir-plus");
  const closeOverlay = document.getElementById("close-overlay");

  if (btnEnSavoirPlus && overlay) {
    // Ouvrir l'overlay au clic sur le bouton
    btnEnSavoirPlus.addEventListener("click", function () {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden"; // Empêcher le scroll du body
    });

    // Fermer l'overlay au clic sur le SVG goback
    if (closeOverlay) {
      closeOverlay.addEventListener("click", function (e) {
        e.stopPropagation();
        overlay.classList.remove("open");
        document.body.style.overflow = ""; // Rétablir le scroll
      });
    }

    // Fermer l'overlay en cliquant sur le fond (overlay lui-même)
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.classList.remove("open");
        document.body.style.overflow = ""; // Rétablir le scroll
      }
    });
  }

  // Gestion de l'overlay "En savoir plus" pour AirPods 4
  const btnEnSavoirPlus2 = document.getElementById("btn-en-savoir-plus-2");
  const overlayAirpods4 = document.getElementById("overlay-airpods-4");
  const closeOverlayAirpods4 = document.getElementById(
    "close-overlay-airpods-4"
  );

  if (btnEnSavoirPlus2 && overlayAirpods4) {
    // Ouvrir l'overlay au clic sur le bouton
    btnEnSavoirPlus2.addEventListener("click", function () {
      overlayAirpods4.classList.add("open");
      document.body.style.overflow = "hidden"; // Empêcher le scroll du body
    });

    // Fermer l'overlay au clic sur le SVG goback
    if (closeOverlayAirpods4) {
      closeOverlayAirpods4.addEventListener("click", function (e) {
        e.stopPropagation();
        overlayAirpods4.classList.remove("open");
        document.body.style.overflow = ""; // Rétablir le scroll
      });
    }

    // Fermer l'overlay en cliquant sur le fond (overlay lui-même)
    overlayAirpods4.addEventListener("click", function (e) {
      if (e.target === overlayAirpods4) {
        overlayAirpods4.classList.remove("open");
        document.body.style.overflow = ""; // Rétablir le scroll
      }
    });
  }

  //Gestion de l'overlay "En savoir plus" pour AirPods 4
  const buttonnou = document.getElementById("button-nou");
  const overlayairpodspro = document.getElementById("overlay-airpods-pro");
  const closeoverlayairpodspro = document.getElementById(
    "close-overlay-airpods-pro"
  );

  if (buttonnou && overlayairpodspro) {
    //Ouvrir l'overlay au clic sur le bouton
    buttonnou.addEventListener("click", function () {
      overlayairpodspro.classList.add("open");
      document.body.style.overflow = "hidden"; // Empêcher le scroll du body
    });

    // Fermer l'overlay au clic sur le SVG goback
    if (closeoverlayairpodspro) {
      closeoverlayairpodspro.addEventListener("click",
        function (e) {
          e.stopPropagation();
          overlayairpodspro.classList.remove("open");
          document.body.style.overflow = ""; //retablir le scrooll
        });
    }

    // Fermer l'overlay en cliquant sur le fond (overlay lui-même)
    overlayairpodspro.addEventListener("click", function (e) {
      if (e.target === overlayairpodspro) {
        overlayairpodspro.classList.remove("open");
        document.body.style.overflow = ""; // Rétablir le scroll
      }
    });
  }
});
