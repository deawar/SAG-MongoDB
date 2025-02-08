// Main document ready function that initializes all functionality
document.addEventListener('DOMContentLoaded', async () => {
  // First, we'll set up our DOM element references
  const searchInput = document.getElementById('school-input');
  const autoComplete = document.querySelector('.autocomplete');
  const registerBtn = document.getElementById('registerBtn');

  // Add this new form handler to prevent default submissions
  const form = document.querySelector('form.signup');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Prevented default form submission');
    });
  }

  // Initialize Materialize components - needed for modals and other UI elements
  $('.modal').modal();

  // This function formats school data to work with Materialize's autocomplete
  function formatSchoolData(schools) {
    return schools.reduce((acc, school) => {
      acc[school.SchoolName] = null; // Materialize expects this format
      return acc;
    }, {});
  }

  // Initialize school autocomplete with error handling
  async function initializeSchoolAutocomplete() {
    try {
      const response = await fetch('./schools.json');
      const schools = await response.json();
      const schoolData = formatSchoolData(schools);

      // Initialize Materialize autocomplete with the formatted data
      const autocompleteInstance = M.Autocomplete.init(autoComplete, {
        data: schoolData,
        minLength: 1,
        onAutocomplete: (selectedSchool) => {
          console.log('Selected school:', selectedSchool);
          searchInput.value = selectedSchool;
        },
      });

      return autocompleteInstance;
    } catch (error) {
      console.error('Error loading school data:', error);
      return null;
    }
  }

  // Validates password matching with user feedback
  function matchPassword(pw1, pw2) {
    console.log('Comparing passwords');
    if (pw1 !== pw2) {
      $('#PwMatch-modal').modal('open');
      return false;
    }
    return true;
  }

  // Gets the selected role from radio buttons
  function getRadioValue() {
    const ele = document.getElementsByName('roles');
    for (const radio of ele) {
      if (radio.checked) {
        return radio.value;
      }
    }
  }

  // Comprehensive form validation with detailed error messages
  function validateForm(formData) {
    const errors = [];

    // Check all required fields
    if (!formData.first_name) errors.push('First Name is required');
    if (!formData.last_name) errors.push('Last Name is required');
    if (!formData.address1) errors.push('Address is required');
    if (!formData.city) errors.push('City is required');
    if (!formData.state) errors.push('State is required');
    if (!formData.zip) errors.push('ZIP Code is required');
    if (!formData.school) errors.push('School is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.phone) errors.push('Phone Number is required');
    if (!formData.password) errors.push('Password is required');

    // Validate format of provided fields
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }

    if (formData.zip && !/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(formData.zip)) {
      errors.push('Please enter a valid ZIP code');
    }

    // Display any validation errors
    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      $('#err-msg').empty().text(errorMessage);
      return false;
    }

    return true;
  }

  // Handle form submission with improved error handling and user feedback
  registerBtn.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Starting signup process');

    // Disable the button to prevent double-clicks
    $('#registerBtn').prop('disabled', true);

    try {
      // Clear any existing messages
      $('#err-msg').empty();
      $('#Footer-err-msg').empty();

      // Gather form data - this part stays mostly the same but is grouped clearly
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

      // Validate before sending
      if (!validateForm(newAccount) || !matchPassword(newAccount.password, newAccount.passwordck)) {
        $('#registerBtn').prop('disabled', false);
        return;
      }

      // Send the request with improved configuration
      const response = await $.ajax({
        type: 'POST',
        url: '/api/signup',
        data: newAccount,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
      });

      console.log('Server response:', response);

      if (response.success) {
        // Show success message in modal
        if (response.message) {
          $('#Form-modal').modal('open');
          $('#err-msg').text(response.message);
        }

        // Wait before redirecting to ensure modal is seen
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Use replace for cleaner navigation
        window.location.replace(response.redirect);
        return;
      }
      throw new Error(response.message || 'Signup failed');
    } catch (error) {
      console.error('Error during signup:', error);
      $('#err-msg').text(error.message || 'An error occurred during signup');
      $('#Footer-err-msg').text('Please try again or contact support');
    } finally {
      // Always re-enable the button unless we've redirected
      if (document.body) { // Check if we're still on the page
        $('#registerBtn').prop('disabled', false);
      }
    }
  });

  // Initialize school autocomplete when page loads
  await initializeSchoolAutocomplete();
});
