// Helper Functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Convert 12-hour times to 24-hour format
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

const toggleLoading = (isLoading) => {
  const button = document.getElementById('auctionBtn');
  if (button) {
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 'Processing...' : 'Submit Auction Info';
  }
};

// Client-side sanitization utilities
const sanitizeInput = {
  string: (str, maxLength = 100) => {
    if (!str) return '';
    return str
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '')
      .replace(/[^\w\s-,.]/gi, '');
  },

  date: (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  },

  time: (timeStr) => {
    if (!timeStr) return '';
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr) ? timeStr : '';
  },

  id: (id) => {
    if (!id) return '';
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id) ? id : '';
  },
};

// Form Validation Function
function validateForm(formData) {
  const errors = [];
  const requiredFields = {
    auctionId: 'Auction ID',
    charityName: 'Charity Name',
    dateAuctionStart: 'Start Date',
    timeAuctionStart: 'Start Time',
    dateAuctionStop: 'End Date',
    timeAuctionStop: 'End Time',
    location: 'Location',
  };

  Object.entries(requiredFields).forEach(([field, label]) => {
    if (!formData[field]) {
      errors.push(`${label} is required`);
    }
  });

  if (formData.dateAuctionStart && formData.timeAuctionStart
      && formData.dateAuctionStop && formData.timeAuctionStop) {
    const startDate = new Date(`${formData.dateAuctionStart}T${formData.timeAuctionStart}`);
    const endDate = new Date(`${formData.dateAuctionStop}T${formData.timeAuctionStop}`);

    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Auction Table Functions
async function loadAuctions() {
  console.log('Loading auctions...');
  const auctionList = document.getElementById('auction-list');
  if (!auctionList) {
    console.log('Auction list container not found');
    return;
  }

  try {
    const response = await fetch('/api/auctions');
    if (!response.ok) throw new Error('Failed to fetch auctions');

    const { data: auctions } = await response.json();
    console.log('Full auctions data:', auctions);

    const tableHTML = generateAuctionTable(auctions);
    auctionList.innerHTML = tableHTML;
    console.log('Auctions table rendered');

    M.AutoInit();
  } catch (error) {
    console.error('Error loading auctions:', error);
    auctionList.innerHTML = `
          <div class="card-panel red lighten-4 red-text text-darken-4">
              Error loading auctions: ${error.message}
          </div>
      `;
  }
}

function generateAuctionTable(auctions) {
  return `
      <table class="striped highlight responsive-table">
          <thead>
              <tr>
                  <th>
                      <label>
                          <input type="checkbox" class="filled-in" id="selectAll" />
                          <span></span>
                      </label>
                  </th>
                  <th>Auction ID</th>
                  <th>Charity Name</th>
                  <th>Start Date/Time</th>
                  <th>End Date/Time</th>
                  <th>Total Time</th>
                  <th>Organizer</th>
                  <th>Location</th>
                  <th>Status</th>
              </tr>
          </thead>
          <tbody>
              ${auctions.map((auction) => generateAuctionRow(auction)).join('')}
          </tbody>
      </table>
  `;
}

function generateAuctionRow(auction) {
  const startBase = new Date(auction.dateAuctionStart);
  const endBase = new Date(auction.dateAuctionStop);

  const [startHours, startMinutes] = auction.timeAuctionStart.split(':');
  startBase.setHours(parseInt(startHours), parseInt(startMinutes), 0);

  const [endHours, endMinutes] = auction.timeAuctionStop.split(':');
  endBase.setHours(parseInt(endHours), parseInt(endMinutes), 0);

  const now = new Date();
  let status;
  if (now < startBase) status = '<span class="new badge blue">Upcoming</span>';
  else if (now > endBase) status = '<span class="new badge grey">Ended</span>';
  else status = '<span class="new badge green">Active</span>';

  const formattedStartDate = startBase.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedEndDate = endBase.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `
      <tr>
          <td>
              <label>
                  <input type="checkbox" class="filled-in auction-select" data-id="${auction._id}" />
                  <span></span>
              </label>
          </td>
          <td>${auction.auctionId}</td>
          <td>${auction.charityName}</td>
          <td>${formattedStartDate}</td>
          <td>${formattedEndDate}</td>
          <td>${auction.auctionTotalTime || ''}</td>
          <td>${auction.organizer}</td>
          <td>${auction.location}</td>
          <td>${status}</td>
      </tr>
  `;
}

// Checkbox and Delete Functions
function setupCheckboxHandlers() {
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.auction-select');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked;
      });
    });
  }
}

async function deleteSelectedAuctions() {
  try {
    const selectedCheckboxes = document.querySelectorAll('.auction-select:checked');
    if (selectedCheckboxes.length === 0) {
      M.toast({ html: 'Please select auctions to delete', classes: 'red' });
      return;
    }

    // Get the modal instance
    const modalElem = document.getElementById('delete-auction-modal');
    if (!modalElem) {
      console.error('Delete modal not found');
      return;
    }

    const modal = M.Modal.init(modalElem);
    modal.open();

    // Handle confirm delete
    document.getElementById('confirm-delete-auctions').onclick = async () => {
      const auctionIds = Array.from(selectedCheckboxes).map((checkbox) => checkbox.dataset.id);

      try {
        const response = await fetch('/api/delete-auctions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: auctionIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete auctions');
        }

        const result = await response.json();
        modal.close();
        M.toast({ html: result.message || 'Auctions deleted successfully', classes: 'green' });
        await loadAuctions();
      } catch (error) {
        console.error('Error deleting auctions:', error);
        modal.close();
        M.toast({ html: 'Error deleting auctions', classes: 'red' });
      }
    };
  } catch (error) {
    console.error('Error in delete process:', error);
    M.toast({ html: 'Error in delete process', classes: 'red' });
  }
}

// Main Event Listener
document.addEventListener('DOMContentLoaded', async () => {
  const auctionForm = document.querySelector('form.auctionData');
  const errMsg = document.getElementById('err-msg');
  const deleteButton = document.getElementById('deleteRowsButton');

  // Initialize all modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => M.Modal.init(modal));

  // Setup delete button handler
  if (deleteButton) {
    deleteButton.addEventListener('click', deleteSelectedAuctions);
  }

  // Handle form submission
  if (auctionForm) {
    auctionForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log('Form submission started');

      if (errMsg) errMsg.textContent = '';
      toggleLoading(true);

      try {
        const rawFormData = {
          auctionId: document.getElementById('auctionId').value,
          charityName: document.getElementById('charityName').value,
          dateAuctionStart: document.getElementById('dateAuctionStart').value,
          timeAuctionStart: document.getElementById('timeAuctionStart').value,
          dateAuctionStop: document.getElementById('dateAuctionStop').value,
          timeAuctionStop: document.getElementById('timeAuctionStop').value,
          organizer: document.getElementById('account_id').value,
          location: document.querySelector('input[name="chooseSchool"]:checked').value,
        };

        console.log('Raw form data:', rawFormData);

        
        const timeAuctionStart24 = convertTo24Hour(timeAuctionStart);

        const timeAuctionStop24 = convertTo24Hour(timeAuctionStop);

        const formData = {
          auctionId: sanitizeInput.string(rawFormData.auctionId, 50),
          charityName: sanitizeInput.string(rawFormData.charityName, 100),
          dateAuctionStart: sanitizeInput.date(rawFormData.dateAuctionStart),
          timeAuctionStart: sanitizeInput.time(rawFormData.timeAuctionStart24),
          dateAuctionStop: sanitizeInput.date(rawFormData.dateAuctionStop),
          timeAuctionStop: sanitizeInput.time(rawFormData.timeAuctionStop24),
          organizer: sanitizeInput.id(rawFormData.organizer),
          location: sanitizeInput.string(rawFormData.location, 200),
        };

        console.log('Sanitized form data:', formData);

        const { isValid, errors } = validateForm(formData);
        if (!isValid) {
          errMsg.textContent = errors.join('\n');
          return;
        }

        const response = await fetch('/api/create-auction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error creating auction');
        }

        const result = await response.json();
        console.log('Auction created:', result);

        M.toast({ html: 'Auction created successfully!', classes: 'green' });
        auctionForm.reset();
        await loadAuctions();
      } catch (error) {
        console.error('Form submission error:', error);
        errMsg.textContent = error.message || 'Error creating auction';
        M.toast({ html: 'Error creating auction', classes: 'red' });
      } finally {
        toggleLoading(false);
      }
    });
  }

  // Initialize datepickers and timepickers
  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd',
    autoClose: true,
    showClearBtn: true,
  });

  $('.timepicker').timepicker({
    twelveHour: false,
    showClearBtn: true,
  });

  // Initial load
  await loadAuctions();
  setupCheckboxHandlers();
});
