document.addEventListener('DOMContentLoaded', () => {

  // 1. Menú Hamburguesa para Móvil
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // 2. Animación de Scroll Reveal (Fade-in)
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // 3. Envío del Formulario a WhatsApp
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const interes = document.getElementById('interes').value;
      const mensaje = document.getElementById('mensaje').value;

      const textoWhatsApp = `Hola Control Gravedad 🪐,%0AMi nombre es *${encodeURIComponent(nombre)}*.%0AMe interesa el programa: *${encodeURIComponent(interes)}*.%0A%0AMensaje: ${encodeURIComponent(mensaje)}`;
      
      // Reemplaza por tu número de teléfono real con clave de país
      const numeroWhatsApp = "5210000000000"; 
      
      window.open(`https://wa.me/${numeroWhatsApp}?text=${textoWhatsApp}`, '_blank');
    });
  }

});