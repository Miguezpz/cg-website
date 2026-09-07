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

});