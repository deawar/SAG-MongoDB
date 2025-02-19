document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  M.AutoInit();

  const verifyForm = document.getElementById('verify-form');
  const tokenInput = document.getElementById('secretToken');
  const verifyButton = document.getElementById('verifyTokenBtn');
  const inputDisplay = document.getElementById('inputValue');

  // Function to update the display of entered token
  function displayInputValue() {
    const inputValue = tokenInput.value.trim();
    inputDisplay.textContent = inputValue;
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
      M.toast({ html: 'Please enter your verification token', classes: 'red' });
      return;
    }

    try {
      verifyButton.disabled = true;
      const loadingToast = M.toast({ html: 'Verifying token...', classes: 'blue' });

      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secretToken: token }),
      });

      const data = await response.json();
      loadingToast.dismiss();

      if (data.success) {
        M.toast({ html: 'Email verified successfully!', classes: 'green' });
        // Open success modal
        const modal = document.getElementById('verified-token-modal');
        const instance = M.Modal.getInstance(modal);
        instance.open();

        // Store verification status
        localStorage.setItem('verified', 'true');

        // Redirect after modal close or button click
        document.getElementById('confirm-token').addEventListener('click', () => {
          window.location.href = '/login';
        });
      } else {
        M.toast({ html: data.message || 'Verification failed. Please try again.', classes: 'red' });
        verifyButton.disabled = false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      M.toast({ html: 'An error occurred. Please try again.', classes: 'red' });
      verifyButton.disabled = false;
    }
  });

  // Function to close modal
  window.closeModal = function () {
    const modal = document.getElementById('verified-token-modal');
    const instance = M.Modal.getInstance(modal);
    instance.close();
  };
});
