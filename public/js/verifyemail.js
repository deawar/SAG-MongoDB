document.addEventListener('DOMContentLoaded', () => {
  const resendButton = document.getElementById('resendEmail');
  const verifyButton = document.getElementById('verifyTokenBtn');
  const tokenInput = document.getElementById('verificationToken');
  const secretToken = document.getElementById('secretToken');
  const verifyForm = document.getElementById('verify-form');

  // Initialize Materialize components
  $('.modal').modal();

  if (resendButton) {
    resendButton.addEventListener('click', async () => {
      try {
        resendButton.disabled = true;
        resendButton.textContent = 'Sending...';

        const response = await fetch('/api/resend-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to resend verification email');
        }

        M.toast({ html: 'Verification email resent! Please check your inbox.', classes: 'green' });
      } catch (error) {
        console.error('Error resending email:', error);
        M.toast({ html: 'Error resending email. Please try again.', classes: 'red' });
      } finally {
        resendButton.disabled = false;
        resendButton.textContent = 'Resend Email';
      }
    });
  }

  if (verifyButton && tokenInput) {
    verifyButton.addEventListener('click', async () => {
      try {
        const token = tokenInput.value.trim();
        if (!token) {
          M.toast({ html: 'Please enter your verification token', classes: 'red' });
          return;
        }

        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';

        const response = await fetch('/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ secretToken: token }),
        });

        const data = await response.json();

        if (response.ok) {
          M.toast({ html: 'Email verified successfully!', classes: 'green' });
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          throw new Error(data.message || 'Invalid verification token');
        }

        M.toast({ html: 'Email verified successfully!', classes: 'green' });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        console.error('Error verifying token:', error);
        M.toast({ html: error.message || 'Error verifying token', classes: 'red' });
      } finally {
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify Token';
      }
    });
  }
});
