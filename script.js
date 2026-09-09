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

  // 2. Barra de Progreso de Lectura Superior & Navbar Reducido al Scroll
  const scrollProgress = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // 3. Animación de Scroll Reveal (Fade-in)
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

  // 4. Contador interactivo para la sección de Stats
  const statsSection = document.querySelector('.stats-bar');
  const statNumbers = document.querySelectorAll('.stat-item h3');
  let animated = false;

  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        statNumbers.forEach(stat => {
          const target = parseFloat(stat.innerText.replace(/,/g, ''));
          const suffix = stat.innerText.replace(/[0-9.,]/g, '');
          let current = 0;
          const increment = target / 40;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.innerText = Math.floor(target).toLocaleString() + suffix;
              clearInterval(timer);
            } else {
              stat.innerText = Math.floor(current).toLocaleString() + suffix;
            }
          }, 30);
        });
        animated = true;
      }
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
  }

  // --- TRACKER DE GOOGLE ANALYTICS ---

  // 5. Rastrear clics en los botones de WhatsApp
  const whatsappButtons = document.querySelectorAll('.btn-whatsapp, .whatsapp-float');
  
  whatsappButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'click_whatsapp', {
          'event_category': 'Contacto',
          'event_label': 'Boton WhatsApp'
        });
      }
    });
  });

  // 6. Acordeón de Preguntas Frecuentes
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cierra los demás para mantener la lista ordenada
      faqItems.forEach(other => {
        other.classList.remove('open');
        const otherQuestion = other.querySelector('.faq-question');
        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 7. Envío del formulario de contacto vía AJAX (sin recargar la página)
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && submitBtn && formFeedback) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot: si el campo oculto viene lleno, es un bot; se ignora silenciosamente
      const honeypot = contactForm.querySelector('[name="_honey"]');
      if (honeypot && honeypot.value) {
        return;
      }

      submitBtn.classList.add('is-loading');
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });

        if (response.ok) {
          formFeedback.textContent = '¡Gracias! Tu mensaje fue enviado. Te responderemos muy pronto.';
          formFeedback.classList.add('success');
          contactForm.reset();

          if (typeof gtag === 'function') {
            gtag('event', 'envio_formulario', {
              'event_category': 'Contacto',
              'event_label': 'Formulario Correo'
            });
          }
        } else {
          throw new Error('Respuesta no válida del servidor');
        }
      } catch (err) {
        formFeedback.textContent = 'Hubo un problema al enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.';
        formFeedback.classList.add('error');
      } finally {
        submitBtn.classList.remove('is-loading');
      }
    });
  }

  // 8. Slider interactivo de Antes y Después
  const baSliders = document.querySelectorAll('[data-ba-slider]');

  baSliders.forEach(slider => {
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('[data-ba-handle]');
    const range = slider.querySelector('[data-ba-range]');
    if (!before || !handle || !range) return;

    let dragging = false;

    const setPosition = (percent) => {
      percent = Math.max(0, Math.min(100, percent));
      before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = `${percent}%`;
      range.value = percent;
    };

    const positionFromClientX = (clientX) => {
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    // El arrastre solo se activa al presionar el botón central (el handle),
    // así el resto de la imagen queda libre para hacer scroll normal en móvil.
    handle.addEventListener('pointerdown', (e) => {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPosition(positionFromClientX(e.clientX));
    });

    const stopDragging = (e) => {
      dragging = false;
      if (e && e.pointerId !== undefined && handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
        handle.releasePointerCapture(e.pointerId);
      }
    };
    handle.addEventListener('pointerup', stopDragging);
    handle.addEventListener('pointercancel', stopDragging);

    // Soporte de teclado: el input range sigue siendo enfocable con Tab
    range.addEventListener('input', (e) => setPosition(Number(e.target.value)));

    setPosition(Number(range.value) || 50);
  });

});