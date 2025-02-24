// public/js/members.js

let ajaxLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  const sidenav = document.querySelector('.sidenav');
  if (sidenav) M.Sidenav.init(sidenav);

  M.updateTextFields();

  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => M.Modal.init(modal));

  const errorMsg = document.getElementById('err-msg');
  if (errorMsg) errorMsg.textContent = '';

  const accountModal = document.getElementById('AccountAction-modal');
  if (accountModal) {
    const instance = M.Modal.getInstance(accountModal);
    instance.open();
  }

  // DELETE ACCOUNT
  const deleteButton = document.getElementById('deleteButton');
  if (deleteButton) {
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (errorMsg) errorMsg.textContent = '';
      const deleteModal = document.getElementById('delete-account-modal');
      const instance = M.Modal.getInstance(deleteModal);
      instance.open();
    });
  }

  // CONFIRM DELETE
  const confirmDelete = document.getElementById('confirm-delete');
  if (confirmDelete) {
    confirmDelete.addEventListener('click', async () => {
      console.log('Clicked on Confirm Delete button');
      const deleteAccount = {
        account_id: document.getElementById('accountid').value.trim(),
        email: document.getElementById('emailinput').value.trim(),
      };
      console.log(deleteAccount);

      if (deleteAccount.account_id && deleteAccount.email) {
        try {
          const response = await fetch(
            `/user/${deleteAccount.account_id}/${deleteAccount.email}`,
            { method: 'DELETE' },
          );

          if (!response.ok) throw new Error('Delete failed');

          console.log('deleted account', deleteAccount.account_id);
          location.reload();
        } catch (error) {
          console.error('Error deleting account:', error);
        }
      } else {
        console.log('fill out entire form');
        if (errorMsg) errorMsg.textContent = 'fill out entire form';
      }
    });
  }

  // CANCEL DELETE
  const cancelDelete = document.getElementById('cancel-delete');
  if (cancelDelete) {
    cancelDelete.addEventListener('click', () => {
      const deleteModal = document.getElementById('delete-account-modal');
      const instance = M.Modal.getInstance(deleteModal);
      instance.close();
    });
  }

  // UPDATE MY ACCOUNT
  const updateButton = document.getElementById('updateButton');
  if (updateButton) {
    updateButton.addEventListener('click', async (event) => {
      event.preventDefault();
      console.log('About to update my account...');

      const changeAccount = {
        account_id: document.getElementById('account_id').value.trim(),
        first_name: document.getElementById('firstname-input').value.trim(),
        last_name: document.getElementById('lastname-input').value.trim(),
        address1: document.getElementById('address-input').value.trim(),
        address2: document.getElementById('address2-input').value.trim(),
        city: document.getElementById('city-input').value.trim(),
        state: document.getElementById('state-input').value.trim(),
        zip: document.getElementById('zipcode-input').value.trim(),
        school: document.getElementById('school-input').value.trim(),
        email: document.getElementById('email-input').value.trim(),
        phone: document.getElementById('phone-input').value.trim(),
      };

      if (errorMsg) errorMsg.textContent = '';
      console.log(changeAccount);

      if (changeAccount.phone && changeAccount.email && changeAccount.zip
                && changeAccount.state && changeAccount.city && changeAccount.address1
                && changeAccount.last_name && changeAccount.first_name) {
        try {
          const response = await fetch(`/user/${changeAccount.account_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(changeAccount),
          });

          if (!response.ok) throw new Error('Update failed');

          console.log('Updated account', changeAccount);
          location.reload();
        } catch (error) {
          console.error('Error updating account:', error);
        }
      } else {
        console.log('**Please fill out entire form**');
        const updateErrMsg = document.getElementById('update-err-msg');
        if (updateErrMsg) updateErrMsg.textContent = '**Please fill out entire form**';
      }
    });
  }

  // Update another user account from Email Search
  const updateUserButton = document.getElementById('updateUserButton');
  if (updateUserButton) {
    updateUserButton.addEventListener('click', async (event) => {
      event.preventDefault();
      console.log('About to update another users account...');

      const changeAccount = {
        account_id: document.getElementById('searchedAccountid').value.trim(),
        first_name: document.getElementById('searchedFirstnameinput').value.trim(),
        last_name: document.getElementById('searchedLastnameinput').value.trim(),
        address1: document.getElementById('searchedAddressinput').value.trim(),
        address2: document.getElementById('searchedAddress2input').value.trim(),
        city: document.getElementById('searchedCityinput').value.trim(),
        state: document.getElementById('searchedStateinput').value.trim(),
        zip: document.getElementById('searchedZipcodeinput').value.trim(),
        school: document.getElementById('searchedSchoolinput').value.trim(),
        email: document.getElementById('searchedEmailinput').value.trim(),
        phone: document.getElementById('searchedPhoneinput').value.trim(),
        role: document.getElementById('searchedRoleinput').value.trim(),
      };

      if (errorMsg) errorMsg.textContent = '';
      console.log(changeAccount);

      if (changeAccount.phone && changeAccount.email && changeAccount.zip
                && changeAccount.state && changeAccount.city && changeAccount.address1
                && changeAccount.last_name && changeAccount.first_name && changeAccount.role) {
        try {
          const response = await fetch(`/user/${changeAccount.account_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(changeAccount),
          });

          if (!response.ok) throw new Error('Update failed');

          console.log('Updated account', changeAccount);
          location.reload();
        } catch (error) {
          console.error('Error updating account:', error);
        }
      } else {
        console.log('**Please fill out entire form**');
        const updateErrMsg = document.getElementById('update-err-msg');
        if (updateErrMsg) updateErrMsg.textContent = '**Please fill out entire form**';
      }
    });
  }

  // SEARCH FOR AN ACCOUNT
  const userSearch = document.getElementById('userSearch');
  if (userSearch) {
    userSearch.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailSearched = document.getElementById('searchforUser').value.trim();
      console.log(`emailSearched ~~~~~~~ ${emailSearched}`);

      if (emailSearched.match(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/i)) {
        try {
          const response = await fetch(`/searchuser/${emailSearched}`);

          if (!response.ok) {
            throw new Error('User not found');
          }

          const res = await response.json();

          // Update form fields with search results
          document.getElementById('searchedRoleinput').value = res.searchedRole;
          document.getElementById('searchedAccountid').value = res.searchedId;
          document.getElementById('searchedFirstnameinput').value = res.searchedFirst_name;
          document.getElementById('searchedLastnameinput').value = res.searchedLast_name;
          document.getElementById('searchedAddressinput').value = res.searchedAddress1;
          document.getElementById('searchedAddress2input').value = res.searchedAddress2;
          document.getElementById('searchedCityinput').value = res.searchedCity;
          document.getElementById('searchedStateinput').value = res.searchedState;
          document.getElementById('searchedZipcodeinput').value = res.searchedZip;
          document.getElementById('searchedPhoneinput').value = res.searchedPhone;
          document.getElementById('searchedEmailinput').value = res.searchedEmail;
          document.getElementById('searchedSchoolinput').value = res.searchedSchool;

          document.getElementById('searchforUser').value = '';
          if (errorMsg) errorMsg.textContent = '';
          M.updateTextFields();
        } catch (error) {
          console.error('Search error:', error);
          if (errorMsg) {
            errorMsg.textContent = '**Email not found.. Please enter a different Email-Id**';
          }
          document.getElementById('searchforUser').value = '';
        }
      } else {
        console.log('**Please enter a valid email**');
        if (errorMsg) {
          errorMsg.textContent = '**Email not found.. Please enter a valid Email**';
        }
      }
    });
  }

  // Search for all School accounts
  const listAllStudents = document.querySelector('.listAllStudents');
  if (listAllStudents) {
    listAllStudents.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!ajaxLoading) {
        ajaxLoading = true;
        const school = document.getElementById('Schoolinput').value.trim();
        console.log(`School Searched ~~~~~~~ ${school}`);

        if (school) {
          try {
            const response = await fetch(`/listusers/${school}`);

            if (!response.ok) {
              throw new Error('Users not found');
            }

            const users = await response.json();
            console.log('Line 253 $$$$$$$$$$$$$$$$$$$$$$$ users: ', users);

            // Create table using modern DOM manipulation
            const table = document.createElement('table');

            // Caption
            const caption = document.createElement('caption');
            caption.textContent = `List of users from ${school}`;
            table.appendChild(caption);

            // Header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = [
              'Select', 'First Name', 'Last Name', 'Registered',
              'Phone Number', 'Role', 'Email',
            ];

            headers.forEach((headerText) => {
              const th = document.createElement('th');
              th.textContent = headerText;
              headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Body
            const tbody = document.createElement('tbody');
            users.forEach((user) => {
              const row = document.createElement('tr');
              row.dataset.id = user._id;

              // Checkbox cell
              const checkboxCell = document.createElement('td');
              checkboxCell.className = 'action-checkbox';
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.id = user._id;
              checkboxCell.appendChild(checkbox);
              row.appendChild(checkboxCell);

              // Data cells
              [user.first_name, user.last_name, user.active,
                user.phone, user.role, user.email].forEach((text) => {
                const td = document.createElement('td');
                td.textContent = text;
                row.appendChild(td);
              });

              tbody.appendChild(row);
            });

            table.appendChild(tbody);
            const userTable = document.getElementById('userTable');
            if (userTable) userTable.appendChild(table);
          } catch (error) {
            console.error('Error fetching users:', error);
            if (errorMsg) errorMsg.textContent = '** School not found. **';
          } finally {
            ajaxLoading = false;
          }

          // Handle delete row functionality
          const deleteRow = document.querySelector('.delete-row');
          if (deleteRow) {
            deleteRow.addEventListener('click', () => {
              const checkedBoxes = document.querySelectorAll('input[name="record"]:checked');
              checkedBoxes.forEach((checkbox) => {
                checkbox.closest('tr').remove();
              });
            });
          }
        }
      }
    }, { once: true }); // Replaces .one()
  }
});
