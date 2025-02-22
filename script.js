document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------
    // 1. Canvas Background Animation
    // ------------------------------
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let width, height;
      const POINTS_COUNT = 150;
      const MAX_DISTANCE = 220;
      const VELOCITY_SCALE = 0.0005;
      const BOUNCE_FACTOR = 0.06;
      const REPULSION_RADIUS = 60;
      const REPULSION_FORCE = 0.009;
      let mx = -9999, my = -9999;
      const points = [];
    
      function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
    
      // Initialize random points
      for (let i = 0; i < POINTS_COUNT; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * VELOCITY_SCALE,
          vy: (Math.random() - 0.5) * VELOCITY_SCALE
        });
      }
    
      // Update mouse/touch coordinates
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
      });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          mx = e.touches[0].clientX;
          my = e.touches[0].clientY;
        }
      });
      window.addEventListener('touchend', () => {
        mx = -9999;
        my = -9999;
      });
    
      function animate() {
        ctx.clearRect(0, 0, width, height);
    
        // Update points and apply repulsion
        for (let i = 0; i < POINTS_COUNT; i++) {
          const p = points[i];
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPULSION_RADIUS) {
            const force = (REPULSION_RADIUS - dist) * REPULSION_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.x += p.vx;
          p.y += p.vy;
    
          if (p.x < 0) {
            p.x = 0;
            p.vx *= -BOUNCE_FACTOR;
          } else if (p.x > width) {
            p.x = width;
            p.vx *= -BOUNCE_FACTOR;
          }
          if (p.y < 0) {
            p.y = 0;
            p.vy *= -BOUNCE_FACTOR;
          } else if (p.y > height) {
            p.y = height;
            p.vy *= -BOUNCE_FACTOR;
          }
        }
    
        // Draw lines between points that are close
        for (let i = 0; i < POINTS_COUNT; i++) {
          for (let j = i + 1; j < POINTS_COUNT; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DISTANCE) {
              const alpha = 1 - dist / MAX_DISTANCE;
              ctx.strokeStyle = `rgba(235,11,77,0.8)`;
              ctx.beginPath();
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
              ctx.stroke();
            }
          }
        }
    
        requestAnimationFrame(animate);
      }
      animate();
    }
    
    // ------------------------------
    // 2. Typewriter Effect
    // ------------------------------
    const typewriterText = '[Your Name Here]';
    const typewriterEl = document.getElementById('typewriter');
    let typeIndex = 0;
    
    function typeWriter() {
      if (!typewriterEl) return;
      if (typeIndex < typewriterText.length) {
        typewriterEl.textContent += typewriterText.charAt(typeIndex++);
        setTimeout(typeWriter, 120);
      }
    }
    typeWriter();
    
    // ------------------------------
    // 3. Mobile Menu Toggle
    // ------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('active');
        }
      });
    }
    
    // ------------------------------
    // 4. Scroll to Top Button Functionality
    // ------------------------------
    function topScroll() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const scrollUpButton = document.getElementById("scroll-up");
    if (scrollUpButton) {
      scrollUpButton.addEventListener("click", topScroll);
      window.addEventListener("scroll", function () {
        if (window.scrollY > 200) {
          scrollUpButton.style.display = "block";
        } else {
          scrollUpButton.style.display = "none";
        }
      });
    }
    
    // ------------------------------
    // 5. Image Slider with Smooth Transition
    // ------------------------------
    let currentIndex = 0;
    const items = document.querySelectorAll(".slider .list .item");
    const totalItems = items.length;
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");
    const sliderContainer = document.querySelector(".slider .list");
    if (sliderContainer && totalItems > 0) {
      sliderContainer.style.display = "flex";
      sliderContainer.style.overflow = "hidden";
      sliderContainer.style.position = "relative";
      sliderContainer.style.width = "100%";
      sliderContainer.style.height = "500px"; // Adjust as needed
    
      items.forEach(item => {
        item.style.width = "100%";
        item.style.flexShrink = "0";
        item.style.position = "absolute";
        item.style.top = "0";
        item.style.left = "100%";
        item.style.transition = "left 0.8s ease-in-out";
        item.style.height = "100%";
      });
    
      function showSlide(index, direction) {
        items.forEach((item, i) => {
          if (i === index) {
            item.style.left = "0";
            item.style.opacity = "1";
            item.style.visibility = "visible";
          } else {
            item.style.left = direction === "right" ? "100%" : "-100%";
            item.style.opacity = "0";
            item.style.visibility = "hidden";
          }
        });
        console.log(`Showing slide ${index + 1} of ${totalItems}`);
      }
    
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          let previousIndex = currentIndex;
          currentIndex = (currentIndex + 1) % totalItems;
          items[previousIndex].style.left = "-100%";
          showSlide(currentIndex, "right");
        });
      }
    
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          let previousIndex = currentIndex;
          currentIndex = (currentIndex - 1 + totalItems) % totalItems;
          items[previousIndex].style.left = "100%";
          showSlide(currentIndex, "left");
        });
      }
    
      showSlide(currentIndex, "right");
    }
    
    // ------------------------------
    // 6. FAQ Dropdown Functionality
    // ------------------------------
    const faqItems = document.querySelectorAll(".faq");
    faqItems.forEach((item) => {
      item.addEventListener("click", function () {
        this.classList.toggle("active");
        const content = this.querySelector(".answer");
        if (this.classList.contains("active")) {
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          content.style.maxHeight = "0";
        }
      });
    });
  });
  