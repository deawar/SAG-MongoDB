document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('school-input');

  function getQuery() {
    const query = document.getElementById('school-input').value;
    console.log(query);

    if (query === '') {
      console.log('Search again');
    } else {
      const url = `autocomplete/?q=${query}`;
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          // const imgfld = { img: null };
          const ReceivedData = JSON.parse(this.responseText);
          console.log('ReceivedData: ', ReceivedData);
          const arrayToObject = (array, keyField) => array.reduce((obj, item) => {
            obj[item[keyField]] = item;
            obj[item[keyField]] = null; // Returns only school name with null for image.
            console.log('the obj to return: ', obj);
            return obj;
          }, {});
          const schoolObj = arrayToObject(ReceivedData, 'school');
          console.log('=====================================');
          console.log('SignUp.js --> ReceivedData -->schoolObj: ', schoolObj);
          console.log('=====================================');
          const autoInput = document.querySelectorAll('.autocomplete'); // For autocomplete input field
          // const autoInput = document.querySelectorAll('.dropdown-trigger');
          console.log('AutoInputData: ', autoInput);
          // M.Dropdown.init(autoInput, {
          //   autoTrigger: true,
          //   hover: true,
          //   data: schoolObj,
          // });
          M.Autocomplete.init(autoInput, { // For Autocomplete input field
            data: schoolObj,
            minLength: 1,
          });
        }
      };
      xhr.open('GET', url, true);
      xhr.send(query);
    }
  }
  searchInput.addEventListener('input', getQuery);
});

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
      })
      // .then()
        .then((data) => {
          console.log('status post ajax call to /api/signup :', data);
          $('#Form-modal').modal('open');
          window.location.replace('/login');
        });
    } else {
      console.log('**Please fill out entire form**');
      $('#Form-modal').modal('open');
      $('#err-msg').empty('').text('**Please fill out entire form**');
      $('#Footer-err-msg').empty('').text('**Please fill out entire form**');
    }
  });
});
