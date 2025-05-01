document.addEventListener('DOMContentLoaded', () => {
  // Getting references to our form and inputs
  const loginForm = document.querySelector('form.login');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');

  // Validate Email is reasonable format
  function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Style any required selects (keeping original selector)
  const requiredSelects = document.querySelectorAll('select[required]');
  requiredSelects.forEach(select => {
    select.style.display = 'inline';
    select.style.height = '0';
    select.style.padding = '0';
    select.style.width = '0';
  });

  // When the form is submitted, we validate there's an email and password entered
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const userData = {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };

      if (emailIsValid(userData.email)) {
        try {
          fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })
            .then(response => response.json())
            .then(res => {
              console.log(res.school);
              if (res.email !== undefined) {
                window.location.replace('/dashboard');
              } else if (res.active === false) {
                window.location.replace('/verify');
              } else {
                document.getElementById('err-msg').textContent = '** INVALID Username and/or Password! **';
                console.log(`Invalid Username and password ~~~~~~${res.info}`);
              }
            });
        } catch (err) {
          console.log(`Invalid Username and password ~~~~~~${err}`);
        }
      } else {
        console.log('** Please enter a valid username and password! **');
        document.getElementById('err-msg').textContent = '** Please enter a valid username and password **';
      }
    });
  }
});
