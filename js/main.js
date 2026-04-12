document.addEventListener('DOMContentLoaded', () => {
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    smoothWheel: true,
    smoothTouch: false,
    prevent: (node) => node.classList.contains('no-lenis'),
  });

  // Synchronize Lenis scrolling with GSAP's ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Tell GSAP to use Lenis's `raf` in its ticker loop to prevent jank
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable GSAP's lag smoothing to prevent fighting with Lenis
  gsap.ticker.lagSmoothing(0);

  AOS.init({
    once: true,
  });

  const projectsSwiper = new Swiper('.projects-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    grabCursor: true,
    navigation: {
      nextEl: '.projects-swiper-wrap .swiper-button-next',
      prevEl: '.projects-swiper-wrap .swiper-button-prev',
    },
  });

  const testimonialsSwiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 2,
    spaceBetween: 20,
    breakpoints: {
      0: { slidesPerView: 1 },
      992: { slidesPerView: 2 }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // ===== HERO ENTRANCE ANIMATION =====
  (function () {
    const hero = document.querySelector('.hero');
    if(hero) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      // Initial state
      gsap.set('.hero h1, .caption h3, .caption .btn, .hero-img', { opacity: 0 });
      gsap.set('.main-head', { y: -50, opacity: 0 });

      // 1. Initial Zoom-out masking effect 
      tl.from('.hero', {
        clipPath: 'inset(80% 80% 80% 80%)',
        duration: 2.5,
        ease: 'power2.inOut',
      })
      // 2. Build the sequence after Zoom-out finishes
      .to('.main-head', {
        y: 0,
        opacity: 1,
        duration: 1,
      }, "-=0.2")
      .fromTo('.hero h1', 
        { y: 80, clipPath: 'inset(100% 0 0 0)' },
        { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.2 },
        "-=0.5"
      )
      .fromTo('.caption h3', 
        { y: 30 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.8"
      )
      .fromTo('.caption .btn', 
        { scale: 0.8 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
        "-=0.6"
      )
      .fromTo('.hero-img', 
        { y: 40, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2 },
        "-=0.8"
      );
    }
  })();

  // ===== CLIENTS MARQUEE =====
  (function () {
    document.querySelectorAll('.clients .marquee-list').forEach(function (track, index) {
      var origChildren = Array.from(track.children);
      var origCount = origChildren.length;

      // Clone twice — 3 sets so the screen is always filled
      [0, 1].forEach(function () {
        origChildren.forEach(function (child) {
          var clone = child.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        });
      });

      var reverse = index % 2 === 1;
      var speed = 0.7;
      var setWidth = 0;
      var pos = 0;

      function animate() {
        if (!setWidth) {
          setWidth = track.scrollWidth / 3;
          if (reverse) pos = -setWidth;
        }
        pos += reverse ? speed : -speed;
        if (pos <= -setWidth) pos += setWidth;
        if (pos >= 0) pos -= setWidth;
        track.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
  })();

  // ===== MARQUEE =====
  (function () {
    const track = document.querySelector('.marquee-inner');
    if (!track) return;

    const origChildren = Array.from(track.children);
    const origCount = origChildren.length;

    [0, 1].forEach(() => {
      origChildren.forEach(child => {
        const clone = child.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });

    const setWidth = track.children[origCount].offsetLeft;
    let pos = 0;
    const speed = 1;

    function animate() {
      pos -= speed;
      if (pos <= -setWidth) pos += setWidth;
      track.style.transform = `translate3d(calc(${pos}px + 200px), 0, 0)`;
      requestAnimationFrame(animate);
    }
    animate();
  })();

  gsap.registerPlugin(ScrollTrigger);
  const cards = gsap.utils.toArray(".service-list .item");

  cards.forEach((card, index) => {
    // 1. PINNING LOGIC
    if (index !== cards.length - 1) {
      ScrollTrigger.create({
        trigger: card,
        start: "top top", 
        pin: true,
        pinSpacing: false, 
        endTrigger: ".service-list",
        end: "bottom bottom",
      });
    }

    // 2. DISAPPEARING LOGIC
    if (index < cards.length - 1) {
      gsap.to(card, {
        opacity: 0,
        scale: 0.9,
        pointerEvents: "none",
        scrollTrigger: {
          trigger: cards[index + 1],
          start: "top 80%",
          end: "top 10%",
          scrub: true,
        }
      });
    }
  });

  const scrollTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(0, { 
        duration: 2.5, 
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      });
    });

    // Toggle button visibility based on scroll position
    lenis.on('scroll', (e) => {
      const vh150 = window.innerHeight * 1.5;
      if (e.scroll > vh150) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    // ===== CUSTOM PREMIUM DROPDOWN LOGIC =====
    const dropdownToggle = document.getElementById('serviceTypeDropdown');
    if (dropdownToggle) {
      const dropdownOptions = document.querySelector('.dropdown-options');
      const hiddenInput = document.getElementById('serviceTypeValue');
      const selectedValue = dropdownToggle.querySelector('.selected-value');
      const arrow = dropdownToggle.querySelector('.dropdown-arrow');

      dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownOptions.style.opacity === '1';
        if (isOpen) {
          dropdownOptions.style.opacity = '0';
          dropdownOptions.style.pointerEvents = 'none';
          dropdownOptions.style.transform = 'translateY(-10px)';
          arrow.style.transform = 'rotate(0deg)';
        } else {
          dropdownOptions.style.opacity = '1';
          dropdownOptions.style.pointerEvents = 'auto';
          dropdownOptions.style.transform = 'translateY(0)';
          arrow.style.transform = 'rotate(180deg)';
        }
      });

      document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedValue.textContent = e.target.textContent;
          selectedValue.style.opacity = '1';
          hiddenInput.value = e.target.getAttribute('data-value');
          dropdownOptions.style.opacity = '0';
          dropdownOptions.style.pointerEvents = 'none';
          dropdownOptions.style.transform = 'translateY(-10px)';
          arrow.style.transform = 'rotate(0deg)';
        });
        option.addEventListener('mouseenter', () => option.style.background = 'rgba(255, 255, 255, 0.05)');
        option.addEventListener('mouseleave', () => option.style.background = 'transparent');
      });

      document.addEventListener('click', (e) => {
        if (!dropdownOptions.contains(e.target)) {
          dropdownOptions.style.opacity = '0';
          dropdownOptions.style.pointerEvents = 'none';
          dropdownOptions.style.transform = 'translateY(-10px)';
          arrow.style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  // ===== CONTACT SECTION GSAP ANIMATION =====
  const contactSection = document.querySelector('.contact');
  if (contactSection) {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 80%', 
        toggleActions: 'play none none none'
      }
    });

    // 1. Fade up the main container box
    contactTimeline.from('.contact-box', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })

    // 2. Fade in the background glows
    .from('.contact .glow-effect', {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut'
    }, "<")
    
    // 3. Stagger in the text elements (moving from right)
    .from(['.contact-section-head', '.contact-description', '.contact-info', '.social-links'], {
      x: 40, 
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    }, "-=0.4")
    
    // 4. Form scale in
    .from('.contact-form', {
      scale: 0.95,
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, "-=0.6"); 
  }

  // ===== SECTION HEADERS ENTRANCE ANIMATION =====
  const sectionHeads = document.querySelectorAll('.section-head');
  sectionHeads.forEach(head => {
    // If it's the contact section head, skip it since it's already animated in the contact timeline
    if (head.classList.contains('contact-section-head')) return;

    // We animate the internal span and header text sequentially
    const children = head.querySelectorAll('span, h3, h2, h4, p');
    if (children.length > 0) {
      // Set initial state
      gsap.set(children, { opacity: 0 });
      
      gsap.to(children, {
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: head,
          start: 'top 85%', // Triggers when the top of the header hits 85% down the viewport
          toggleActions: 'play none none none'
        }
      });
    } else {
      gsap.fromTo(head, {
        opacity: 0
      }, {
        opacity: 1,
        duration: 1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: head,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
  });

  // ===== SLIDERS APPEAR & DISAPPEAR ANIMATION =====
  const sliders = document.querySelectorAll('.projects-swiper-wrap, .testimonials-swiper');
  sliders.forEach(slider => {
    gsap.fromTo(slider, {
      opacity: 0,
      scale: 0.95
    }, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: slider,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse'
      }
    });

    // Stagger in the individual swiper elements
    const slides = slider.querySelectorAll('.swiper-slide');
    if (slides.length > 0) {
      gsap.fromTo(slides, {
        opacity: 0,
        x: 60
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: slider,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse'
        }
      });
    }
  });

  // ===== FEATURES (WHY-US) ENTRANCE ANIMATION =====
  const featuresSection = document.querySelector('.why-us');
  if (featuresSection) {
    const featureBlocks = featuresSection.querySelectorAll('.col-lg-3, .col-md-6');
    
    if (featureBlocks.length > 0) {
      gsap.fromTo(featureBlocks, {
        opacity: 0,
        y: 40
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2, // Stagger each block one after another
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresSection.querySelector('.row'),
          start: 'top 85%',
          toggleActions: 'play reverse play reverse'
        }
      });
    }
  }

});
