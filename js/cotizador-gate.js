// Candado simple del lado del cliente -- NO es seguridad real (el PIN es visible en el código
// fuente para cualquiera que lo busque). Es solo una barrera casual para que esta herramienta
// interna de precios no quede a la vista de cualquier visitante que llegue a la URL por accidente.
// Para cambiar el PIN, edita el valor de PIN abajo.
document.addEventListener("DOMContentLoaded", function () {
  const PIN = "8401"; // últimos 4 dígitos del WhatsApp de Grupo Sachman, fácil de recordar para el equipo
  const STORAGE_KEY = "sachman_cotizador_unlocked";
  const gateEl = document.getElementById("gate-lock");
  const contentEl = document.getElementById("gate-content");
  const formEl = document.getElementById("gate-form");
  const pinEl = document.getElementById("gate-pin");
  const errorEl = document.getElementById("gate-error");

  function unlock() {
    gateEl.classList.add("hidden");
    contentEl.classList.remove("hidden");
  }

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    unlock();
  } else {
    pinEl.focus();
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    if (pinEl.value.trim() === PIN) {
      localStorage.setItem(STORAGE_KEY, "1");
      errorEl.style.display = "none";
      unlock();
    } else {
      errorEl.style.display = "block";
      pinEl.value = "";
      pinEl.focus();
    }
  });
});
