$(document).ready(() => {
  $('.modal').modal();
  // Code here handles what happens when a user submits a new account.

  console.log('Signup.js loaded');

  // Password conpare code
  function matchPassword(pw1, pw2) {
    console.log('1st PW: ', pw1);
    console.log('2nd PW: ', pw2);
    if (pw1 !== pw2) {
      console.log('open modal here');
      $('#PwMatch-modal').modal('open');
      return false;
    }
    return true;
  }

  function getRadioValue() {
    let role;
    const ele = document.getElementsByName('roles');
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].checked) {
        role = ele[i].value;
        break;
      }
    }
    return role;
  }

  // ADD    ****************
  $('#registerBtn').on('click', (event) => {
    event.preventDefault();

    console.log('Clicked on Signup button.');
    // make a newAccount obj
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
      // role: $('#role').val().trim(),
    };
    if (!matchPassword(newAccount.password, newAccount.passwordck)) {
      $('#err-msg').empty('').text('**Passwords do NOT Match!!**');
    }
    if (newAccount.password.length > 0 && newAccount.phone.length > 0
        && newAccount.email.length > 0 && newAccount.zip.length > 0 && newAccount.state.length > 0
        && newAccount.city.length > 0 && newAccount.address1.length > 0
        && newAccount.last_name.length > 0 && newAccount.first_name.length > 0) {
      $.ajax({
        type: 'post',
        url: '/api/signup',
        data: newAccount,
      }).then((data) => {
        console.log(data);
        window.location.replace('/dashboard');
      });
    } else {
      console.log('**Please fill out entire form**');
      $('#Form-modal').modal('open');
      $('#err-msg').empty('').text('**Please fill out entire form**');
      $('#Footer-err-msg').empty('').text('**Please fill out entire form**');
    }
  });
});
