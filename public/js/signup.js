// Main document ready function that initializes all functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Cache DOM elements we'll use frequently
  const searchInput = document.getElementById('school-input');
  const autoComplete = document.querySelector('.autocomplete');
  const registerBtn = document.getElementById('registerBtn');

  // Initialize Materialize components
  $('.modal').modal();

  // Function to format school data for Materialize autocomplete
  // Takes raw school data and transforms it into the format Materialize expects
  function formatSchoolData(schools) {
    return schools.reduce((acc, school) => {
      // In Materialize's autocomplete, the key is displayed and the value can be null
      acc[school.SchoolName] = null;
      return acc;
    }, {});
  }

  // Initialize school autocomplete functionality
  // This loads school data once when the page loads rather than on every keystroke
  async function initializeSchoolAutocomplete() {
    try {
      // Fetch the schools data from your JSON file
      const response = await fetch('./schools.json');
      const schools = await response.json();
      const schoolData = formatSchoolData(schools);

      // Initialize Materialize autocomplete with the formatted school data
      const autocompleteInstance = M.Autocomplete.init(autoComplete, {
        data: schoolData,
        minLength: 1,
        onAutocomplete: (selectedSchool) => {
          console.log('Selected school:', selectedSchool);
          // Store the selected school value in the input
          searchInput.value = selectedSchool;
        },
      });

      return autocompleteInstance;
    } catch (error) {
      console.error('Error loading school data:', error);
      return null;
    }
  }

  // Password comparison function checks if passwords match
  function matchPassword(pw1, pw2) {
    console.log('Comparing passwords');
    if (pw1 !== pw2) {
      $('#PwMatch-modal').modal('open');
      return false;
    }
    return true;
  }

  // Function to get selected radio button value for user role
  function getRadioValue() {
    const ele = document.getElementsByName('roles');
    for (const radio of ele) {
        if (radio.checked) {
            return radio.value;
        }
    }
  }

  // Form validation function that works alongside autocomplete
  function validateForm(formData) {
    const errors = [];

    // Check required fields
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

    // Only perform format validation if the field has a value
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }

    if (formData.zip && !/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(formData.zip)) {
      errors.push('Please enter a valid ZIP code');
    }

    // Display errors if any exist
    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      $('#err-msg').empty().text(errorMessage);
      return false;
    }

    return true;
  }

  // Handle form submission when the register button is clicked
  registerBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('Processing signup submission');

    // Create new account object from form data
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

    // Validate form and passwords
    if (!validateForm(newAccount)) {
      console.log('Form validation failed');
      return;
    }

    if (!matchPassword(newAccount.password, newAccount.passwordck)) {
      console.log('Password match failed');
      return;
    }

    // If validation passes, submit the form using jQuery ajax
  //   $.ajax({
  //     type: 'post',
  //     url: '/api/signup',
  //     data: newAccount,
  //   })
  //     .then((data) => {
  //       console.log('Signup successful:', data);
  //       $('#Form-modal').modal('open');
  //       window.location.replace('/login');
  //     })
  //     .catch((error) => {
  //       console.error('Error during signup:', error);
  //       $('#err-msg').empty().text('**An error occurred during signup**');
  //       $('#Footer-err-msg').empty().text('Please try again or contact support if the problem persists');
  //     });
  // });
    try {
      const response = await $.ajax({
          type: 'POST',
          url: '/api/signup',
          data: newAccount,
          dataType: 'json'
      });

      if (response.success) {
          if (response.redirect) {
              window.location.href = response.redirect;
          }
      } else {
          $('#err-msg').empty().text(response.message || 'Signup failed');
      }
  } catch (error) {
      console.error('Error during signup:', error);
      $('#err-msg').empty().text('An error occurred during signup');
  }
});
  // Initialize school autocomplete when page loads
  await initializeSchoolAutocomplete();
});
