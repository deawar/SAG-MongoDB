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
      acc[school.SchoolName] = null; // Materialize format: school name as key, null as value
      return acc;
    }, {});
  }

  // Initialize school autocomplete functionality
  // This loads school data once when the page loads rather than on every keystroke
  async function initializeSchoolAutocomplete() {
    try {
      const response = await fetch('./schools.json');
      const schools = await response.json();
      const schoolData = formatSchoolData(schools);

      // Initialize Materialize autocomplete with the formatted school data
      M.Autocomplete.init(autoComplete, {
        data: schoolData,
        minLength: 1,
        onAutocomplete: (selectedSchool) => {
          console.log('Selected school:', selectedSchool);
        },
      });
    } catch (error) {
      console.error('Error loading school data:', error);
    }
  }

  // Password comparison function
  // Returns true if passwords match, false and shows modal if they don't
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
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].checked) {
        return ele[i].value;
      }
    }
  }

  // Handle form submission
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

      // Validate passwords match
      if (!matchPassword(newAccount.password, newAccount.passwordck)) {
          $('#err-msg').empty('').text('**Passwords do NOT Match!!**');
          return;
      }

      // Validate all required fields are filled
      const requiredFields = [
          'password', 'phone', 'email', 'zip', 'state',
          'city', 'address1', 'last_name', 'first_name'
      ];
      
      const allFieldsFilled = requiredFields.every(field => 
          newAccount[field] && newAccount[field].length > 0
      );

      if (allFieldsFilled) {
          try {
              // Submit form data to server
              const response = await fetch('/api/signup', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(newAccount)
              });

              if (response.ok) {
                  $('#Form-modal').modal('open');
                  window.location.replace('/login');
              } else {
                  throw new Error('Signup failed');
              }
          } catch (error) {
              console.error('Error during signup:', error);
              $('#err-msg').empty().text('**An error occurred during signup**');
          }
      } else {
          console.log('**Please fill out entire form**');
          $('#Form-modal').modal('open');
          $('#err-msg').empty().text('**Please fill out entire form**');
          $('#Footer-err-msg').empty().text('**Please fill out entire form**');
      }
  });

  // Initialize school autocomplete when page loads
  await initializeSchoolAutocomplete();
});
