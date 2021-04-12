/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
let ajaxLoading;
if (!ajaxLoading) {
  ajaxLoading = false;
}
$(document).ready(() => {
  $('.sidenav').sidenav();
  M.updateTextFields();
  $('.modal').modal();
  $('#err-msg').text('');
  $('#AccountAction-modal').modal('open');
  // $('.dropdown-trigger').dropdown(); <--------------------don't forget me!!
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

  // UPDATE MY ACCOUNT
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

  // Update another user account from Email Search
  $('#updateUserButton').on('click', (event) => {
    event.preventDefault();
    console.log('About to update another users account...');

    // capture All changes
    const changeAccount = {
      account_id: $('#searchedAccountid').val().trim(),
      first_name: $('#searchedFirstnameinput').val().trim(),
      last_name: $('#searchedLastnameinput').val().trim(),
      address1: $('#searchedAddressinput').val().trim(),
      address2: $('#searchedAddress2input').val().trim(),
      city: $('#searchedCityinput').val().trim(),
      state: $('#searchedStateinput').val().trim(),
      zip: $('#searchedZipcodeinput').val().trim(),
      school: $('#searchedSchoolinput').val().trim(),
      email: $('#searchedEmailinput').val().trim(),
      phone: $('#searchedPhoneinput').val().trim(),
      role: $('#searchedRoleinput').val().trim(),
    };
    $('#err-msg').empty('');
    console.log(changeAccount);

    if (changeAccount.phone.length > 0
      && changeAccount.email.length > 0 && changeAccount.zip.length > 0
      && changeAccount.state.length > 0 && changeAccount.city.length > 0
      && changeAccount.address1.length > 0 && changeAccount.last_name.length > 0
      && changeAccount.first_name.length > 0 && changeAccount.role.length > 0) {
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
          url: `/searchuser/:email${emailSearched}`,
          error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 404 || jqXHR.status === '404') {
              $('#err-msg').empty('').text('**Email not found.. Please enter a different Email-Id**');
              $('#searchforUser').val('');
            }
          },
        })
          .then((res) => {
            // const accountId = $('#accountid');
            $('#searchedRoleinput').val(res.searchedRole);
            $('#searchedAccountid').val(res.searchedId);
            $('#searchedFirstnameinput').val(res.searchedFirst_name);
            $('#searchedLastnameinput').val(res.searchedLast_name);
            $('#searchedAddressinput').val(res.searchedAddress1);
            $('#searchedAddress2input').val(res.searchedAddress2);
            $('#searchedCityinput').val(res.searchedCity);
            $('#searchedStateinput').val(res.searchedState);
            $('#searchedZipcodeinput').val(res.searchedZip);
            $('#searchedPhoneinput').val(res.searchedPhone);
            $('#searchedEmailinput').val(res.searchedEmail);
            $('#searchedSchoolinput').val(res.searchedSchool);
            console.log('res.searchedEmailinput: ', res.searchedEmail);
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
  $('.listAllStudents').one('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!ajaxLoading) {
      ajaxLoading = true;
      const school = $('#Schoolinput').val().trim();
      // let users = [];
      console.log(`School Searched ~~~~~~~ ${school}`);
      const $errMsg = $('#err-msg');
      if (school) {
        try {
          $.ajax({
            type: 'get',
            url: `/listusers/${school}`,
            data: school,
            error(jqXHR, textStatus, errorThrown) {
              if (jqXHR.status === 404 || jqXHR.status === '404') {
                $('#err-msg').empty('').text('** Users not found.. **');
              }
            },
            success(res) {
              const users = res;
              console.log('Line 203 $$$$$$$$$$$$$$$$$$$$$$$ users: ', users);
              // add jquery for creating a table of students here
              const $table = $('<table/>');
              // Caption for table
              $table.append(`<caption>List of users from ${school}</caption>`)
                // Head for table
                .append('<thead>').children('thead')
                // Column Headings
                .append('<tr/>')
                .children('tr')
                .append('<th>Select</th><th>First Name</th><th>Last Name</th><th>Registered</th><th>Phone Number</th><th>Role</th><th>Email</th>');
              // Body of table
              const $tbody = $table.append('<tbody />').children('tbody');
              for (let i = 0; i < users.length; i++) { // # of Rows  = res.length
                const $row = $('<tr />').data('id', `${res[i]._id}`);
                $row.append(`<td><input type="checkbox" id="${users[i]._id}"/><label for="${users[i]._id}"></label></td>`)
                  .append(`<td>${users[i].first_name}</td>`)
                  .append(`<td>${users[i].last_name}</td>`)
                  .append(`<td>${users[i].active}</td>`)
                  .append(`<td>${users[i].phone}</td>`)
                  .append(`<td>${users[i].role}</td>`)
                  .append(`<td>${users[i].email}</td>`);
                $row.appendTo($tbody);
                $table.appendTo('#userTable');
              }
            },
            function() {
              ajaxLoading = false;
            },
          });
        } catch (err) {
          console.log(`Something went wrong ${err}`);
          $('#err-msg').empty('').text('** School not found. **');
        }
        // Find and remove selected table rows
        $('.delete-row').click(() => {
          $('table tbody').find('input[name="record"]').each(function () {
            if ($(this).is(':checked')) {
              $(this).parents('tr').remove();
            }
          });
        });
      }
    }
    event.stopPropagation();
  });
});
