document.addEventListener('DOMContentLoaded', () => {
  const aboutModal = document.getElementById('about-modal');
  const contactModal = document.getElementById('contact-modal');
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');

  // Initialize MaterializeCSS modals
  if (aboutModal) {
    M.Modal.init(aboutModal);
  } else {
    console.warn('Modal with ID "about-modal" not found.');
  }

  if (contactModal) {
    M.Modal.init(contactModal);
  } else {
    console.warn('Modal with ID "contact-modal" not found.');
  }

  // Initialize MaterializeCSS dropdowns
  dropdownTriggers.forEach((trigger) => {
    M.Dropdown.init(trigger);
  });
});
