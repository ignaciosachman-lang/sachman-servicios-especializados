// Captura de leads del diagnóstico gratuito.
// TODO (integración Odoo CRM): reemplazar el envío por mailto con un POST al
// formulario "web-to-lead" de Odoo (CRM > Configuración > Formularios web) o a un
// webhook que cree el lead directamente vía XML-RPC/JSON-RPC. Mientras tanto, cada
// envío llega por correo con todos los campos de calificación.
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("lead-form");
  if (!form) return;

  const errorText = document.getElementById("lead-error");
  const resultBox = document.getElementById("lead-result");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("l-name").value.trim();
    const company = document.getElementById("l-company").value.trim();
    const email = document.getElementById("l-email").value.trim();
    const phone = document.getElementById("l-phone").value.trim();
    const pain = document.getElementById("l-pain").value;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !company || !phone || !pain || !emailOk) {
      errorText.style.display = "block";
      return;
    }
    errorText.style.display = "none";

    const bodyLines = [
      "Solicitud de diagnóstico operativo gratuito",
      "",
      "Nombre: " + name,
      "Empresa: " + company,
      "Correo: " + email,
      "Teléfono / WhatsApp: " + phone,
      "Mayor dolor operativo: " + pain
    ];
    const body = bodyLines.join("\n");

    const mailtoUrl =
      "mailto:ignacio.sachman@livcampus.com?subject=" +
      encodeURIComponent("Diagnóstico operativo gratuito - " + company) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailtoUrl;

    resultBox.classList.remove("hidden");
    resultBox.textContent = "Se abrió tu cliente de correo con la solicitud lista para enviar. Si no se abrió, escríbenos directo a ignacio.sachman@livcampus.com.";
  });
});
