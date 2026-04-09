/* ================================================================
   ELARA VOSS — ARTIST PORTFOLIO
   script.js
   ================================================================
   Table of Contents:
   01. Sticky Nav — scrolled class + logo visibility
   02. Active Nav Link — highlight current section
   03. Mobile Menu — hamburger toggle
   04. Gallery Lightbox — open / close / prev / next
   05. Scroll Reveal — fade-in gallery items & sections
   06. Keyboard Accessibility — Escape / arrow keys for lightbox
================================================================ */


/* ── Helpers ────────────────────────────────────────────────── */

/**
 * Shorthand for document.querySelector.
 * @param {string} selector
 * @returns {Element|null}
 */
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];


/* ══════════════════════════════════════════════════════════════
   01. STICKY NAV — add .scrolled class when page scrolls
══════════════════════════════════════════════════════════════ */

const siteNav = $('#site-nav');

/**
 * Toggles the .scrolled class on the nav, which makes the
 * artist-name logo visible (see CSS: .site-nav.scrolled .nav-logo).
 */
function handleNavScroll() {
  if (window.scrollY > 80) {
    siteNav.classList.add('scrolled');
  } else {
    siteNav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load


/* ══════════════════════════════════════════════════════════════
   02. ACTIVE NAV LINK — highlight link of visible section
══════════════════════════════════════════════════════════════ */

const navLinks = $$('.nav-link');
const sections = $$('section[id]');

/**
 * Uses IntersectionObserver to detect which section is in
 * view and marks the matching nav link as .active.
 */
const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.dataset.section === id
          );
        });
      }
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px', // trigger when section is roughly centred
    threshold: 0
  }
);

sections.forEach(section => sectionObserver.observe(section));


/* ══════════════════════════════════════════════════════════════
   03. MOBILE MENU — toggle hamburger / nav links
══════════════════════════════════════════════════════════════ */

const navToggle = $('#nav-toggle');
const navLinksList = $('.nav-links');

/**
 * Toggle the mobile menu open/closed.
 * Adds .open to both the button (for the × animation)
 * and the link list (to expand it via max-height in CSS).
 */
function toggleMobileMenu() {
  const isOpen = navToggle.classList.toggle('open');
  navLinksList.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
}

navToggle.addEventListener('click', toggleMobileMenu);

// Close mobile menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinksList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ══════════════════════════════════════════════════════════════
   04. GALLERY LIGHTBOX
   — click image → open popup with large preview
   — prev / next arrows to browse all gallery items
   — click backdrop or × to close
══════════════════════════════════════════════════════════════ */

const lightbox         = $('#lightbox');
const lightboxImg      = $('#lightbox-img');
const lightboxCaption  = $('#lightbox-caption');
const lightboxClose    = $('#lightbox-close');
const lightboxBackdrop = $('#lightbox-backdrop');
const lbPrev           = $('#lb-prev');
const lbNext           = $('#lb-next');

const galleryItems = $$('.gallery-item');

// Store data for all gallery images so we can prev/next
const galleryData = galleryItems.map(item => ({
  src:     item.querySelector('img').src,
  alt:     item.querySelector('img').alt,
  title:   item.querySelector('.gallery-title')?.textContent || '',
  medium:  item.querySelector('.gallery-medium')?.textContent || ''
}));

// Index of the currently open image
let currentIndex = 0;

/**
 * Opens the lightbox and displays the image at `index`.
 * @param {number} index - Index of the gallery item to show.
 */
function openLightbox(index) {
  currentIndex = index;
  const data = galleryData[index];

  lightboxImg.src = data.src;
  lightboxImg.alt = data.alt;
  lightboxCaption.textContent = `${data.title}  ·  ${data.medium}`;

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
  lightboxClose.focus();
}

/**
 * Closes the lightbox and restores scroll.
 */
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';

  // Clear src after animation to avoid flash on next open
  setTimeout(() => {
    lightboxImg.src = '';
  }, 350);
}

/**
 * Navigates to the previous image (wraps around).
 */
function prevImage() {
  const newIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  openLightbox(newIndex);
}

/**
 * Navigates to the next image (wraps around).
 */
function nextImage() {
  const newIndex = (currentIndex + 1) % galleryData.length;
  openLightbox(newIndex);
}

// Attach click events to each gallery item
galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

// Close button
lightboxClose.addEventListener('click', closeLightbox);

// Click backdrop to close
lightboxBackdrop.addEventListener('click', closeLightbox);

// Prev / Next arrows
lbPrev.addEventListener('click', prevImage);
lbNext.addEventListener('click', nextImage);


/* ══════════════════════════════════════════════════════════════
   05. SCROLL REVEAL — fade gallery items & other sections in
══════════════════════════════════════════════════════════════ */

/**
 * IntersectionObserver that adds .visible when an element
 * enters the viewport, triggering the CSS transition.
 */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once only
      }
    });
  },
  {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  }
);

// Observe all gallery items
galleryItems.forEach(item => revealObserver.observe(item));

// Observe any generic .reveal elements (about section, etc.)
$$('.reveal').forEach(el => revealObserver.observe(el));


/* ══════════════════════════════════════════════════════════════
   06. KEYBOARD ACCESSIBILITY
   — Escape: close lightbox
   — ArrowLeft / ArrowRight: prev / next image
══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;

  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      prevImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
});


/* ══════════════════════════════════════════════════════════════
   07. THEME TOGGLE — Light / Dark mode
══════════════════════════════════════════════════════════════ */

const themeToggle = $('#theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });
}


/* ══════════════════════════════════════════════════════════════
   INIT — run any setup tasks once the DOM is fully loaded
══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Add .reveal class to about section children for scroll animation
  $$('.about-image-wrap, .about-text').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Add .reveal to section headers inside gallery & about
  $$('.section-header').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});
