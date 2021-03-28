/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
$(document).ready(() => {
  M.updateTextFields();
  $('.modal').modal();
  $('#err-msg').text('');
  $('#AccountAction-modal').modal('open');
  $('.dropdown-trigger').dropdown();
  // DELETE ACCOUNT
  $('#deleteButton').on('click', (event) => {
    event.preventDefault();
    $('#err-msg').text('');
    $('#delete-account-modal').modal();
  });

  // CONFIRM DELETE
  $('#confirm-delete').on('click', (event) => {
    console.log('Clicked on Confirm Delete button');
    const deleteAccount = {
      account_id: $('#accountid').val().trim(),
      email: $('#emailinput').val().trim(),
    };
    console.log(deleteAccount);
    if (deleteAccount.account_id.length > 0 && deleteAccount.email.length > 0) {
      $.ajax(`/user/${deleteAccount.account_id}/${deleteAccount.email}`, {
        type: 'DELETE',
      }).then(
        () => {
          console.log('deleted account', deleteAccount.account_id);
          // Reload the page to get the updated list
          // window.location.replace('/signup');
          location.reload();
        },
      );
    } else {
      console.log('fill out entire form');
      $('#err-msg').empty('').text('fill out entire form');
    }
  });

  // CANCEL DELETE
  $('#cancel-delete').on('click', (event) => {
    $('#delete-account-modal').modal('close');
  });

  // UPDATE ACCOUNT
  $('#updateButton').on('click', (event) => {
    event.preventDefault();
    console.log('About to update my account...');

    // capture All changes
    const changeAccount = {
      account_id: $('#account_id').val().trim(),
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
    };
    $('#err-msg').empty('');
    console.log(changeAccount);

    if (changeAccount.phone.length > 0
      && changeAccount.email.length > 0 && changeAccount.zip.length > 0
      && changeAccount.state.length > 0 && changeAccount.city.length > 0
      && changeAccount.address1.length > 0 && changeAccount.last_name.length > 0
      && changeAccount.first_name.length > 0) {
      $.ajax({
        type: 'PUT',
        url: `/user/${changeAccount.account_id}`,
        data: changeAccount,
      }).then(
        () => {
          console.log('Updated account', changeAccount);
          // Reload the page to get the updated list
          location.reload();
        },
      );
    } else {
      console.log('**Please fill out entire form**');
      $('#update-err-msg').empty('').text('**Please fill out entire form**');
    }
  });

  // SEARCH FOR AN ACCOUNT
  $('#userSearch').submit((event) => {
    event.preventDefault();
    const emailSearched = $('#searchforUser').val().trim();
    console.log(`emailSearched ~~~~~~~ ${emailSearched}`);
    const $errMsg = $('#err-msg');

    if (emailSearched.match(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/i)) {
      try {
        $.ajax({
          type: 'get',
          url: `/searchuser/${emailSearched}`,
          error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 404 || jqXHR.status === '404') {
              $('#err-msg').empty('').text('**Email not found.. Please enter a different Email-Id**');
              $('#searchforUser').val('');
            }
          },
        })
          .then((res) => {
            // const accountId = $('#accountid');
            $('#roleinput').val(res.searchedRole);
            $('#accountid').val(res.searchedId);
            // $('#fullname').val(res.searchedUser.first_name || res.searchedUser.last_name);
            $('#firstnameinput').val(res.searchedFirst_name);
            $('#lastnameinput').val(res.searchedLast_name);
            $('#addressinput').val(res.searchedAddress1);
            $('#address2input').val(res.searchedAddress2);
            $('#cityinput').val(res.searchedCity);
            $('#stateinput').val(res.searchedState);
            // $('#statedropdown').append(`<option value="">${res.searchedUser.state}</option>`);
            $('#zipcodeinput').val(res.searchedZip);
            $('#phoneinput').val(res.searchedPhone);
            $('#emailinput').val(res.searchedEmail);
            $('#schoolinput').val(res.searchedSchool);
            console.log('res.searchedEmail: ', res.searchedEmail);
          })
          .then(() => {
            $('#searchforUser').val('');
            $('#err-msg').text('');
            M.updateTextFields();
          });
      } catch (err) {
        console.log(`Something went wrong ${err}`);
        $('#err-msg').empty('').text('**Email not found.. Please enter a different Email-Id**');
      }
    } else {
      console.log('**Please enter a valid email**');
      $('#err-msg').empty('').text('**Email not found.. Please enter a valid Email**');
    }
  });

  // Search for all School accounts
  $('#allSearch').submit((event) => {
    event.preventDefault();
    const school = $('#searchforSchool').val().trim();
    console.log(`School Searched ~~~~~~~ ${searchforSchool}`);
    const $errMsg = $('#err-msg');

    if (!searchforSchool) {
      try {
        $.ajax({
          type: 'get',
          url: `/searchuser/${searchforSchool}`,
          error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 404 || jqXHR.status === '404') {
              $('#err-msg').empty('').text('** No students found. **');
              $('#searchforUser').val('');
            }
          },
        })
          .then((res) => {
            $('#accountid').val(res.searchedId);
            $('#firstnameinput').val(res.searchedFirst_name);
            $('#lastnameinput').val(res.searchedLast_name);
            $('#emailinput').val(res.searchedEmail);
            $('#schoolinput').val(res.searchedSchool);
          })
          .then(() => {
            $('#searchforUser').val('');
            $('#err-msg').text('');
            M.updateTextFields();
          });
      } catch (err) {
        console.log(`Something went wrong ${err}`);
        $('#err-msg').empty('').text('** School not found. **');
      }
    }
  });
  // SideNav initialization
  $(() => {
    $('.sidenav').sidenav();
  });
});
