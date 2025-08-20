<script>
/**
 * Error-free, robust script for portfolio interactions + Web3Forms
 * Replace ACCESS_KEY with your Web3Forms key before publishing.
 */

/* Mobile menu toggle (safe if navLinks doesn't exist) */
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  navLinks.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navLinksElem = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const anchors = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const header = document.querySelector('header');
  const headerHeight = header ? header.offsetHeight : 70;

  // Close mobile menu when clicking a nav link (safe if none exist)
  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksElem) navLinksElem.classList.remove('active');
    });
  });

  // Smooth scrolling for anchor links
  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      // If href is just "#" -> scroll to top
      if (href === '#' || href === '') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.replaceState(null, '', '#');
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });

      // update URL fragment without affecting history stack
      history.replaceState(null, '', href);
    });
  });

  // Active navigation highlighting (uses requestAnimationFrame for smoothness)
  function updateActiveNav() {
    if (!sections.length || !navLinkEls.length) return;
    const scrollPosition = window.scrollY + headerHeight + 10;
    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) link.classList.add('active');
    });
  }

  // Throttle scroll updates using rAF
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  // run once on load
  updateActiveNav();

  // Animate progress bars when in view
  const progressBars = document.querySelectorAll('.progress-fill');
  if (progressBars.length) {
    // initialize widths to 0 (unless already styled)
    progressBars.forEach(bar => {
      if (!bar.style.width) bar.style.width = '0%';
      // allow optional per-bar transition override
      if (!bar.style.transition) bar.style.transition = 'width 1.2s ease-out';
    });

    const pbObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const width = parseFloat(el.dataset.width) || 0;
        // When entering view, animate to data-width
        if (entry.isIntersecting) {
          el.style.width = width + '%';
        } else {
          // If bar has data-reset="true" it will reset when out of view
          if (el.dataset.reset === 'true') el.style.width = '0%';
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => pbObserver.observe(bar));
  }

  // Fade-in animation for sections (add .fade-in in CSS and .visible to show)
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('visible');
      } else {
        // optional reset if data-reset="true"
        if (el.dataset.reset === 'true') el.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    if (!section.classList.contains('fade-in')) section.classList.add('fade-in');
    fadeObserver.observe(section);
  });

  // --- Form submission (Web3Forms) ---
  const form = document.getElementById('form');
  const resultEl = document.getElementById('formResult'); // optional element to show messages
  const ACCESS_KEY = 'YOUR_ACCESS_KEY'; // <-- replace with your real Web3Forms key

  function showResult(msg, isError = false) {
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.textContent = msg;
      resultEl.classList.toggle('error', !!isError);
      setTimeout(() => { resultEl.style.display = 'none'; }, 3500);
    } else {
      // fallback to alert if no visible result container
      if (isError) alert(msg); else alert(msg);
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData);

      // simple client validation (adjust required fields as needed)
      if (!payload.name || !payload.email || !payload.message) {
        showResult('Please fill in all required fields.', true);
        return;
      }

      if (ACCESS_KEY === 'YOUR_ACCESS_KEY') {
        showResult('Please replace ACCESS_KEY with your Web3Forms key in the script.', true);
        return;
      }

      payload.access_key = ACCESS_KEY;
      showResult('Please wait...');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(async (res) => {
        let json = {};
        try { json = await res.json(); } catch (err) { /* ignore JSON parse error */ }
        if (res.ok) {
          showResult(`✅ Thank you, ${payload.name || 'visitor'}! Your message was sent.`);
        } else {
          showResult(`❌ ${json.message || 'Submission failed.'}`, true);
        }
      })
      .catch((err) => {
        console.error(err);
        showResult('⚠️ Something went wrong. Please try again later.', true);
      })
      .finally(() => form.reset());
    });
  }
});
</script>
