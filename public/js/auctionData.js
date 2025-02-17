document.addEventListener('DOMContentLoaded', async () => {
  // Cache DOM elements
  const auctionForm = document.querySelector('form.auctionData');
  const auctionBtn = document.getElementById('auctionBtn');
  const errMsg = document.getElementById('err-msg');

  // Initialize Materialize components
  $('.modal').modal();

  // Helper function to show/hide loading state
  const toggleLoading = (isLoading) => {
    const button = $('#auctionBtn');
    button.prop('disabled', isLoading)
      .text(isLoading ? 'Processing...' : 'Submit auction data');
  };

  // Client-side sanitization utilities
  const sanitizeInput = {
    string: (str, maxLength = 100) => {
      if (!str) return '';
      // Remove special characters, limit length
      return str
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Basic XSS prevention
        .replace(/[^\w\s-,.]/gi, ''); // Only allow safe characters
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
      // Basic MongoDB ObjectId format check (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      return objectIdRegex.test(id) ? id : '';
    },
  };

  // Validate form data
  function validateForm(formData) {
    const errors = [];

    // Check required fields
    const requiredFields = {
      auctionId: 'Auction ID',
      charityName: 'Charity Name',
      dateAuctionStart: 'Start Date',
      timeAuctionStart: 'Start Time',
      dateAuctionStop: 'End Date',
      timeAuctionStop: 'End Time',
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        errors.push(`${label} is required`);
      }
    });

    // Validate dates
    if (formData.dateAuctionStart && formData.timeAuctionStart
          && formData.dateAuctionStop && formData.timeAuctionStop) {
      const startDate = new Date(`${formData.dateAuctionStart}T${formData.timeAuctionStart}`);
      const endDate = new Date(`${formData.dateAuctionStop}T${formData.timeAuctionStop}`);

      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    if (errors.length > 0) {
      errMsg.textContent = errors.join('\n');
      return false;
    }

    return true;
  }

  // Handle form submission
  if (auctionForm) {
    auctionForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      errMsg.textContent = '';
      toggleLoading(true);

      try {
        // Get and sanitize form data
        const rawFormData = {
          auctionId: $('#auctionId').val(),
          charityName: $('#charityName').val(),
          dateAuctionStart: $('#dateAuctionStart').val(),
          timeAuctionStart: $('#timeAuctionStart').val(),
          dateAuctionStop: $('#dateAuctionStop').val(),
          timeAuctionStop: $('#timeAuctionStop').val(),
          organizer: $('#account_id').val(),
        };

        // Sanitize all inputs
        const formData = {
          auctionId: sanitizeInput.string(rawFormData.auctionId, 50),
          charityName: sanitizeInput.string(rawFormData.charityName, 100),
          dateAuctionStart: sanitizeInput.date(rawFormData.dateAuctionStart),
          timeAuctionStart: sanitizeInput.time(rawFormData.timeAuctionStart),
          dateAuctionStop: sanitizeInput.date(rawFormData.dateAuctionStop),
          timeAuctionStop: sanitizeInput.time(rawFormData.timeAuctionStop),
          organizer: sanitizeInput.id(rawFormData.organizer),
        };

        // Validate sanitized data
        if (!validateForm(formData)) {
          toggleLoading(false);
          return;
        }

        // Send sanitized data to server
        const response = await fetch('/api/create-auction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Error creating auction');
        }

        // Show success message
        M.toast({ html: 'Auction created successfully!', classes: 'green' });

        // Reset form
        auctionForm.reset();
      } catch (error) {
        console.error('Error:', error);
        errMsg.textContent = error.message || 'Error creating auction';
        M.toast({ html: 'Error creating auction', classes: 'red' });
      } finally {
        toggleLoading(false);
      }
    });
  }

  // Initialize Materialize datepicker and timepicker
  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd',
    autoClose: true,
    showClearBtn: true,
  });

  $('.timepicker').timepicker({
    twelveHour: false,
    showClearBtn: true,
  });
});
