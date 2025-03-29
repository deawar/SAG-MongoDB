document.addEventListener('DOMContentLoaded', () => {
  // Safely initialize components, checking if elements exist first
  const initializeComponents = () => {
    // Only initialize if M is available
    if (!window.M) return;
    
    // Initialize modals if they exist
    if (document.querySelector('.modal')) {
      M.Modal.init(document.querySelectorAll('.modal'));
    }
    
    // Initialize any other components you need, but avoid M.AutoInit()
  };
  
  // Run initialization with a small delay to ensure DOM is ready
  setTimeout(initializeComponents, 100);

  const verifyForm = document.getElementById('verify-form');
  const tokenInput = document.getElementById('secretToken');
  const verifyButton = document.getElementById('verifyTokenBtn');
  const inputDisplay = document.getElementById('inputValue');

  // Only proceed if these elements exist (prevents errors on pages where they don't)
  if (verifyForm && tokenInput && verifyButton) {
    // Function to update the display of entered token
    function displayInputValue() {
      const inputValue = tokenInput.value.trim();
      if (inputDisplay) {
        inputDisplay.textContent = inputValue;
      }
      // Enable/disable verify button based on input
      verifyButton.disabled = !inputValue;
      return inputValue;
    }

    // Function to check if input is filled
    function isInputFilled() {
      return tokenInput.value.trim().length > 0;
    }

    // Add input event listener to token input
    tokenInput.addEventListener('input', displayInputValue);

    // Handle form submission
    verifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = tokenInput.value.trim();

      if (!token) {
        if (window.M) {
          M.toast({ html: 'Please enter your verification token', classes: 'red' });
        }
        return;
      }

      try {
        verifyButton.disabled = true;
        let loadingToast;
        
        if (window.M) {
          loadingToast = M.toast({ html: 'Verifying token...', classes: 'blue' });
        }

        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ secretToken: token }),
        });

        const data = await response.json();
        
        if (loadingToast && loadingToast.dismiss) {
          loadingToast.dismiss();
        }

        if (data.success) {
          if (window.M) {
            M.toast({ html: 'Email verified successfully!', classes: 'green' });
          }
          
          // Open success modal if it exists
          const modal = document.getElementById('verified-token-modal');
          if (modal && window.M) {
            const instance = M.Modal.getInstance(modal);
            if (instance) {
              instance.open();
            } else {
              // Initialize the modal if it wasn't done already
              const newInstance = M.Modal.init(modal);
              newInstance.open();
            }
          }

          // Store verification status
          localStorage.setItem('verified', 'true');

          // Redirect after modal close or button click
          const confirmButton = document.getElementById('confirm-token');
          if (confirmButton) {
            confirmButton.addEventListener('click', () => {
              window.location.href = '/login';
            });
          }
        } else {
          if (window.M) {
            M.toast({ html: data.message || 'Verification failed. Please try again.', classes: 'red' });
          }
          verifyButton.disabled = false;
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (window.M) {
          M.toast({ html: 'An error occurred. Please try again.', classes: 'red' });
        }
        verifyButton.disabled = false;
      }
    });
  }

  // Function to close modal
  window.closeModal = function () {
    const modal = document.getElementById('verified-token-modal');
    if (modal && window.M) {
      const instance = M.Modal.getInstance(modal);
      if (instance) {
        instance.close();
      }
    }
  };
});
