// Main Event Listener
// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';

    try {
      // Handle multiple date formats
      if (dateString.includes(',')) {
        // Format: "Feb 28, 2025"
        const dateParts = dateString.split(' ');
        const month = new Date(`${dateParts[0]} 1, 2000`).getMonth() + 1;
        const day = parseInt(dateParts[1].replace(',', ''));
        const year = parseInt(dateParts[2]);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } if (dateString.includes('/')) {
        // Format: MM/DD/YYYY
        const [month, day, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } if (dateString.includes('-')) {
        // Already in YYYY-MM-DD format
        return dateString;
      }

      // Handle ISO date format as fallback
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error sanitizing date:', error);
      return '';
    }
}

function convertTo24Hour(time12h) {
  if (!time12h) return '';
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours}:${minutes}`;
}

// Input sanitization
const sanitizeInput = {
  string: (input, maxLength = 255) => {
    if (!input) return '';
    return ('' + input).slice(0, maxLength).trim();
  },
  date: (input) => {
    if (!input) return '';
    // Ensure date format is yyyy-MM-dd
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(input) ? input : '';
  },
  id: (input) => {
    if (!input) return '';
    return ('' + input).trim();
  }
};

// Toggle loading state on UI elements
function toggleLoading(isLoading) {
  const button = document.getElementById('auctionBtn');
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.textContent = 'Processing...';
  } else {
    button.disabled = false;
    button.textContent = 'Submit Auction Info';
  }
}

// Load existing auctions
async function loadAuctions() {
  try {
    const response = await fetch('/api/auctions');
    if (!response.ok) throw new Error('Failed to load auctions');
    const auctions = await response.json();
    console.log('Loaded auctions:', auctions);
    // Implement display logic here
  } catch (error) {
    console.error('Error loading auctions:', error);
    M.toast({ html: 'Failed to load auctions', classes: 'red' });
  }
}

// Delete selected auctions
async function deleteSelectedAuctions() {
  // Implement deletion logic here
  console.log('Delete selected auctions clicked');
}

// Main document ready function
document.addEventListener('DOMContentLoaded', async () => {
  const auctionForm = document.querySelector('form.auctionData');
  const errMsg = document.getElementById('err-msg');
  const deleteButton = document.getElementById('deleteRowsButton');

  // Setup delete button handler
  if (deleteButton) {
    deleteButton.addEventListener('click', deleteSelectedAuctions);
  }

  // Initialize all modals
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  // Initialize Materialize components
  const datePickerElements = document.querySelectorAll('.datepicker');
  const timePickerElements = document.querySelectorAll('.timepicker');

  // Initialize date pickers with proper format
  if (datePickerElements.length) {
    M.Datepicker.init(datePickerElements, {
      format: 'yyyy-mm-dd',
      defaultDate: new Date(),
      setDefaultDate: true,
      autoClose: true,
      onSelect(date) {
        this.el.value = date.toISOString().split('T')[0];
      }
    });
  }

  // Initialize time pickers
  if (timePickerElements.length) {
    M.Timepicker.init(timePickerElements, {
      defaultTime: '12:00',
      twelveHour: true,
      autoClose: true,
      onSelect(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        this.el.value = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
      }
    });
  }

  // Fix date input value
  const dateAuctionStop = document.getElementById('dateAuctionStop');
  if (dateAuctionStop && dateAuctionStop.value === 'Date of Auction stop') {
    dateAuctionStop.value = '';
  }

  // Fix for radio buttons - ensure at least one is selected by default
  const schoolRadios = document.querySelectorAll('input[name="chooseSchool"]');
  let foundChecked = false;

  schoolRadios.forEach((radio) => {
    if (radio.checked) foundChecked = true;
  });

  if (!foundChecked && schoolRadios.length > 0) {
    schoolRadios[0].checked = true;
    console.log('Set default school selection:', schoolRadios[0].value);
  }

  // Handle form submission
  if (auctionForm) {
    auctionForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      toggleLoading(true);
      
      try {
        // Get location value from radio buttons
        const locationRadios = document.querySelectorAll('input[name="chooseSchool"]');
        let locationValue = '';
        
        for (const radio of locationRadios) {
          if (radio.checked) {
            locationValue = radio.value;
            break;
          }
        }
        
        // Collect raw form data
        const rawFormData = {
          account_id: document.getElementById('account_id')?.value.trim() || '',
          location: locationValue,
          auctionId: document.getElementById('enteredAuctionId')?.value.trim() || '',
          charityName: document.querySelector('input[name="charityName"]')?.value.trim() || '',
          dateAuctionStart: document.getElementById('dateAuctionStart')?.value.trim() || '',
          timeAuctionStart: document.getElementById('timeAuctionStart')?.value.trim() || '',
          dateAuctionStop: document.getElementById('dateAuctionStop')?.value.trim() || '',
          timeAuctionStop: document.getElementById('timeAuctionStop')?.value.trim() || ''
        };

        console.log('Raw form data:', rawFormData);

        // Validate required fields
        const requiredFields = [
          'account_id',
          'location',
          'auctionId', 
          'charityName', 
          'dateAuctionStart', 
          'timeAuctionStart', 
          'dateAuctionStop', 
          'timeAuctionStop'
        ];
        
        const missingFields = requiredFields.filter(field => !rawFormData[field]);
        
        if (missingFields.length > 0) {
          M.toast({html: `Please fill out all required fields: ${missingFields.join(', ')}`});
          toggleLoading(false);
          return;
        }
        
        let dateAuctionStart24 = rawFormData.dateAuctionStart;
        let dateAuctionStop24 = rawFormData.dateAuctionStop;

        // Convert time formats from 12-hour to 24-hour if needed
        let timeAuctionStart24 = rawFormData.timeAuctionStart;
        let timeAuctionStop24 = rawFormData.timeAuctionStop;

        if (rawFormData.dateAuctionStart.includes(',')) {
          dateAuctionStart24 = formatDate(rawFormData.dateAuctionStart);
          console.log('Converted start date:', rawFormData.dateAuctionStart, 'to', dateAuctionStart24);
        }
        
        if (rawFormData.dateAuctionStop.includes(',')) {
          dateAuctionStop24 = formatDate(rawFormData.dateAuctionStop);
          console.log('Converted stop date:', rawFormData.dateAuctionStop, 'to', dateAuctionStop24);
        }

        if (rawFormData.timeAuctionStart.includes('AM') || rawFormData.timeAuctionStart.includes('PM')) {
          timeAuctionStart24 = convertTo24Hour(rawFormData.timeAuctionStart);
          console.log('Converted start time:', rawFormData.timeAuctionStart, 'to', timeAuctionStart24);
        }
        
        if (rawFormData.timeAuctionStop.includes('AM') || rawFormData.timeAuctionStop.includes('PM')) {
          timeAuctionStop24 = convertTo24Hour(rawFormData.timeAuctionStop);
          console.log('Converted end time:', rawFormData.timeAuctionStop, 'to', timeAuctionStop24);
        }

        // Create formatted datetime strings
        const startDateTime = `${dateAuctionStart24}T${timeAuctionStart24}`;
        const stopDateTime = `${dateAuctionStop24}T${timeAuctionStop24}`;

        // Calculate auction duration
        let auctionTotalTime = '';
        try {
          const startDate = new Date(startDateTime);
          console.log('Start date:', startDate);
          const endDate = new Date(stopDateTime);
          console.log('End date:', endDate);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const durationMs = endDate - startDate;
            if (durationMs > 0) {
              const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
              auctionTotalTime = `${days}d ${hours}h ${minutes}m`;
              console.log('Calculated auction duration:', auctionTotalTime);
              
              // Set the value for display
              const auctionTotalTimeElement = document.getElementById("auction_total_time");
              if (auctionTotalTimeElement) {
                // Check if it's an input element or a paragraph
                if (auctionTotalTimeElement.tagName === 'INPUT') {
                  auctionTotalTimeElement.value = auctionTotalTime;
                } else {
                  auctionTotalTimeElement.textContent = auctionTotalTime;
                }
              }
              
              // Add event listeners for recalculating duration when date/time fields change
              function calculateAuctionDuration() {
                // This will be called when any date/time field changes
                try {
                  const newStartDate = new Date(`${document.getElementById('dateAuctionStart').value}T${document.getElementById('timeAuctionStart').value}`);
                  const newEndDate = new Date(`${document.getElementById('dateAuctionStop').value}T${document.getElementById('timeAuctionStop').value}`);
                  
                  if (!isNaN(newStartDate.getTime()) && !isNaN(newEndDate.getTime())) {
                    const newDiffMs = newEndDate - newStartDate;
                    
                    if (newDiffMs > 0) {
                      const newDays = Math.floor(newDiffMs / (1000 * 60 * 60 * 24));
                      const newHours = Math.floor((newDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const newMinutes = Math.floor((newDiffMs % (1000 * 60 * 60)) / (1000 * 60));
                      
                      const totalTimeElement = document.getElementById("auction_total_time");
                      if (totalTimeElement) {
                        const formattedTime = `${newDays}d ${newHours}h ${newMinutes}m`;
                        if (totalTimeElement.tagName === 'INPUT') {
                          totalTimeElement.value = formattedTime;
                        } else {
                          totalTimeElement.textContent = formattedTime;
                        }
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error updating duration:', err);
                }
              }
              
              // Add event listeners to date/time inputs
              ["dateAuctionStart", "timeAuctionStart", "dateAuctionStop", "timeAuctionStop"].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                  input.addEventListener("change", calculateAuctionDuration);
                }
              });
            } else {
              throw new Error('End date must be after start date');
            }
          } else {
            throw new Error('Invalid date format');
          }
        } catch (error) {
          console.error('Error calculating auction duration:', error);
          M.toast({html: error.message || 'Invalid date/time values'});
          toggleLoading(false);
          return;
        }

        // Sanitize all data fields
        const sanitizedData = {
          account_id: sanitizeInput.id(rawFormData.account_id),
          auctionId: sanitizeInput.string(rawFormData.auctionId, 50),
          charityName: sanitizeInput.string(rawFormData.charityName, 100),
          dateAuctionStart: (rawFormData.dateAuctionStart),
          //dateAuctionStart: sanitizeInput.date(rawFormData.dateAuctionStart),
          timeAuctionStart: timeAuctionStart24,
          dateAuctionStop: (rawFormData.dateAuctionStop),
          //dateAuctionStop: sanitizeInput.date(rawFormData.dateAuctionStop),
          timeAuctionStop: timeAuctionStop24,
          location: sanitizeInput.string(rawFormData.location, 200),
          auctionTotalTime,
          startDateTime,
          stopDateTime
        };

        console.log('Before being Sanitized dateAuctionStart:', dateAuctionStart24);
        console.log('Before being Sanitized dateAuctionStop:', dateAuctionStop24);
        console.log('Sanitized form data:', sanitizedData);

        // Final data object to send to server
        const auctionData = {
          auctionId: sanitizedData.auctionId,
          charityName: sanitizedData.charityName,
          dateAuctionStart: dateAuctionStart24,  // Use the formatted date
          timeAuctionStart: timeAuctionStart24,
          dateAuctionStop: dateAuctionStop24,    // Use the formatted date
          timeAuctionStop: timeAuctionStop24,
          organizer: sanitizedData.account_id,
          location: sanitizedData.location,      // Remove the duplicate location property
          auctionTotalTime: sanitizedData.auctionTotalTime
        };

        console.log('Sending data to server:', auctionData);

        // Send data to server
        const response = await fetch('/api/create-auction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(auctionData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create auction');
        }

        const result = await response.json();
        console.log('Auction created:', result);

        M.toast({ html: 'Auction created successfully!', classes: 'green' });
        auctionForm.reset();

        // Reload auctions to show the new one
        await loadAuctions();
      } catch (error) {
        console.error('Form submission error:', error);
        if (errMsg) errMsg.textContent = error.message || 'Error processing auction';
        M.toast({ html: error.message || 'Error creating auction', classes: 'red' });
      } finally {
        toggleLoading(false);
      }
    });
  } else {
    console.error('Auction form not found!');
  }

  // Load existing auctions on page load
  try {
    await loadAuctions();
  } catch (error) {
    console.error('Initial auction load failed:', error);
  }
});

// Function to load auctions
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

    const result = await response.json();
    const auctions = result.data || [];

    console.log('Loaded auctions:', auctions.length);

    if (auctions.length === 0) {
      auctionList.innerHTML = `
        <div class="card-panel blue lighten-4 blue-text text-darken-4">
          No auctions found. Create your first auction below.
        </div>
      `;
      return;
    }

    const tableHTML = generateAuctionTable(auctions);
    auctionList.innerHTML = tableHTML;
    console.log('Auctions table rendered');

    // Safely initialize Materialize components
    try {
      // Only initialize specific components we know exist
      const selects = auctionList.querySelectorAll('select');
      if (selects.length > 0) {
        M.FormSelect.init(selects);
      }
    } catch (error) {
      console.warn('Non-critical error initializing Materialize components:', error);
    }

    // Scroll to the auction list
    auctionList.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  // Safe date parsing with fallbacks
  let startBase; let
    endBase;

  try {
    startBase = new Date(auction.dateAuctionStart);
    if (isNaN(startBase.getTime())) {
      startBase = new Date(); // Fallback to current date
    }
  } catch (e) {
    console.error('Error parsing start date:', e);
    startBase = new Date();
  }

  try {
    endBase = new Date(auction.dateAuctionStop);
    if (isNaN(endBase.getTime())) {
      // Fallback to start date + 1 day
      endBase = new Date(startBase);
      endBase.setDate(endBase.getDate() + 1);
    }
  } catch (e) {
    console.error('Error parsing end date:', e);
    endBase = new Date(startBase);
    endBase.setDate(endBase.getDate() + 1);
  }

  // Parse and set times safely
  try {
    if (auction.timeAuctionStart) {
      const [startHours, startMinutes] = auction.timeAuctionStart.split(':');
      startBase.setHours(parseInt(startHours) || 0, parseInt(startMinutes) || 0, 0);
    }
  } catch (e) {
    console.error('Error setting start time:', e);
  }

  try {
    if (auction.timeAuctionStop) {
      const [endHours, endMinutes] = auction.timeAuctionStop.split(':');
      endBase.setHours(parseInt(endHours) || 0, parseInt(endMinutes) || 0, 0);
    }
  } catch (e) {
    console.error('Error setting end time:', e);
  }

  const now = new Date();
  let status;

  if (now < startBase) {
    status = '<span class="new badge blue">Upcoming</span>';
  } else if (now > endBase) {
    status = '<span class="new badge grey">Ended</span>';
  } else {
    status = '<span class="new badge green">Active</span>';
  }

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
          <input type="checkbox" class="filled-in auction-select" data-id="${auction._id || ''}" />
          <span></span>
        </label>
      </td>
      <td>${auction.auctionId || 'N/A'}</td>
      <td>${auction.charityName || 'N/A'}</td>
      <td>${formattedStartDate}</td>
      <td>${formattedEndDate}</td>
      <td>${auction.auctionTotalTime || 'N/A'}</td>
      <td>${auction.organizer || 'N/A'}</td>
      <td>${auction.location || 'N/A'}</td>
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
