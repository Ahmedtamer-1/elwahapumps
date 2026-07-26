// Navbar scroll effect
const navbar = document.querySelector('.navbar');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll <= 50) {
    navbar.classList.remove('scrolled');
    navbar.style.transform = 'translateY(0)';
    navbar.style.top = '0';
    return;
  }
  
  navbar.classList.add('scrolled');
  navbar.style.top = '0';
  
  if (currentScroll > lastScroll && currentScroll > 200) {
    // Scrolling down
    navbar.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up
    navbar.style.transform = 'translateY(0)';
  }

  lastScroll = currentScroll;
});

mobileMenu.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});


// Intersection Observer for scroll animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      // Optional: unobserve if you only want the animation to happen once
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up, .fade-in, .slide-in-right, .slide-in-left, .zoom-in').forEach(element => {
  observer.observe(element);
});

// Parallax scrolling effect
const parallaxShapes = document.querySelectorAll('.parallax-shape');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  parallaxShapes.forEach(shape => {
    const speed = shape.getAttribute('data-speed');
    const yPos = scrollY * speed * 0.1;
    shape.style.transform = `translateY(${yPos}px)`;
  });
});

