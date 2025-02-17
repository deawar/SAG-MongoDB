document.addEventListener('DOMContentLoaded', async () => {
  // Cache DOM elements
  const searchInput = document.getElementById('school-input');
  const autoComplete = document.querySelector('.autocomplete');
  const registerBtn = document.getElementById('registerBtn');
  const errMsg = document.getElementById('err-msg');
  const footerErrMsg = document.getElementById('Footer-err-msg');

  // Prevent default form submission
  const form = document.querySelector('form.signup');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Prevented default form submission');
    });
  }

  // Initialize Materialize components
  $('.modal').modal();

  // Helper function to show/hide loading state
  const toggleLoading = (isLoading) => {
    const button = $('#registerBtn');
    if (isLoading) {
      button.prop('disabled', true).text('Processing...');
    } else {
      button.prop('disabled', false).text('Sign Up');
    }
  };

  // Password validation with user feedback
  function matchPassword(pw1, pw2) {
    console.log('Comparing passwords');
    if (pw1 !== pw2) {
      $('#PwMatch-modal').modal('open');
      return false;
    }
    return true;
  }

  // Get selected role from radio buttons
  function getRadioValue() {
    const ele = document.getElementsByName('roles');
    for (const radio of ele) {
      if (radio.checked) {
        return radio.value;
      }
    }
    return null;
  }

  // Form validation
  function validateForm(formData) {
    const errors = [];

    // Required field validation
    const requiredFields = {
      first_name: 'First Name',
      last_name: 'Last Name',
      address1: 'Address',
      city: 'City',
      state: 'State',
      zip: 'ZIP Code',
      school: 'School',
      email: 'Email',
      phone: 'Phone Number',
      password: 'Password',
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        errors.push(`${label} is required`);
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation
    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }

    // ZIP validation
    if (formData.zip && !/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(formData.zip)) {
      errors.push('Please enter a valid ZIP code');
    }

    if (errors.length > 0) {
      errMsg.textContent = errors.join('\n');
      return false;
    }

    return true;
  }

  // Handle different response scenarios
  function handleSignupResponse(data) {
    // Clear any existing messages
    errMsg.textContent = '';
    footerErrMsg.textContent = '';

    if (data.success) {
      // Scenario 1: Success with email verification needed
      if (data.redirect === '/send') {
        $('#Form-modal .modal-title').text('Verification Required');
        $('#Form-modal .modal-content').removeClass('error').addClass('success');
        $('#modal-msg').html(`
          <p>${data.message}</p>
          <p>Please check your email to complete registration.</p>
        `);
        $('#Form-modal').modal('open');

        setTimeout(() => {
          window.location.href = '/send';
        }, 3000);
      }
      // Scenario 2: Success with immediate login
      else if (data.redirect === '/dashboard') {
        $('#Form-modal .modal-title').text('Success!');
        $('#Form-modal .modal-content').removeClass('error').addClass('success');
        $('#modal-msg').html(`
          <p>${data.message}</p>
          <p>Redirecting to dashboard...</p>
        `);
        $('#Form-modal').modal('open');

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    }
    // Scenario 3: Error response
    else {
      $('#Form-modal .modal-title').text('Registration Error');
      $('#Form-modal .modal-content').removeClass('success').addClass('error');
      $('#modal-msg').text(data.message || 'An error occurred during registration');
      $('#Form-modal').modal('open');
      footerErrMsg.textContent = 'Please try again or contact support';
    }
  }

  // Handle form submission
  registerBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('1. Starting signup process');

    toggleLoading(true);

    try {
      console.log('2. Clearing previous messages');
      errMsg.textContent = '';
      footerErrMsg.textContent = '';

      // Gather form data
      const newAccount = {
        first_name: $('#firstname-input').val().trim(),
        last_name: $('#lastname-input').val().trim(),
        address1: $('#address-input').val().trim(),
        address2: $('#address2-input').val().trim(),
        city: $('#city-input').val().trim(),
        state: $('#state-input').val().trim(),
        zip: $('#zipcode-input').val().trim(),
        school: $('#school-input').val().trim(),
        email: $('#email-input').val().trim(),
        phone: $('#phone-input').val().trim(),
        password: $('#password-input').val().trim(),
        passwordck: $('#confirm-password-input').val().trim(),
        role: getRadioValue(),
      };

      console.log('3. Form data gathered:', { ...newAccount, password: '[REDACTED]' });

      // Validate form data
      console.log('4. Validating form data');
      if (!validateForm(newAccount)) {
        console.log('5. Form validation failed');
        toggleLoading(false);
        return;
      }

      console.log('6. Checking password match');
      if (!matchPassword(newAccount.password, newAccount.passwordck)) {
        console.log('7. Password match failed');
        toggleLoading(false);
        return;
      }

      console.log('8. Sending signup request');
      // Explicitly set method to POST and Content-Type to application/json
      const response = await fetch('/api/signup', {
        method: 'POST', // Explicitly specify POST
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(newAccount),
        credentials: 'same-origin',
      });

      console.log('9. Response status:', response.status);
      console.log('10. Response headers:', Object.fromEntries([...response.headers]));

      if (!response.ok) {
        const text = await response.text();
        console.log('11. Error response body:', text);
        throw new Error(text || 'Registration failed');
      }

      const data = await response.json();
      console.log('12. Response data:', data);

      handleSignupResponse(data);
    } catch (error) {
      console.error('13. Error during signup:', error);

      $('#Form-modal .modal-title').text('Error');
      $('#Form-modal .modal-content').removeClass('success').addClass('error');
      $('#modal-msg').text(error.message || 'Could not connect to registration service');
      $('#Form-modal').modal('open');

      footerErrMsg.textContent = 'Please try again or contact support';
    } finally {
      console.log('14. Cleaning up');
      toggleLoading(false);
    }
  });

  // Clear error message when inputs change
  $('input').on('input', () => {
    errMsg.textContent = '';
    footerErrMsg.textContent = '';
  });

  // Initialize school autocomplete
  const initializeSchoolAutocomplete = async () => {
    try {
      const response = await fetch('./schools.json');
      const schools = await response.json();

      const schoolData = schools.reduce((acc, school) => {
        acc[school.SchoolName] = null;
        return acc;
      }, {});

      M.Autocomplete.init(autoComplete, {
        data: schoolData,
        minLength: 1,
        onAutocomplete: (selectedSchool) => {
          console.log('Selected school:', selectedSchool);
          searchInput.value = selectedSchool;
        },
      });
    } catch (error) {
      console.error('Error loading school data:', error);
      errMsg.textContent = 'Error loading school data. Please try refreshing the page.';
    }
  };

  // Initialize school autocomplete when page loads
  await initializeSchoolAutocomplete();
});
