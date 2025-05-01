let ajaxLoading = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  const sidenavElems = document.querySelectorAll('.sidenav');
  sidenavElems.forEach((elem) => M.Sidenav.init(elem));

  const modalElems = document.querySelectorAll('.modal');
  modalElems.forEach((elem) => M.Modal.init(elem));

  const materialboxElems = document.querySelectorAll('.materialboxed');
  materialboxElems.forEach((elem) => M.Materialbox.init(elem));

  const textareaElems = document.querySelectorAll('textarea#description_input');
  textareaElems.forEach((elem) => M.CharacterCounter.init(elem));

  // Main form submission handling
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFormSubmit);
  }

  // Gallery event listeners
  const startGal = document.getElementById('startGal');
  if (startGal) {
    startGal.addEventListener('click', handleGalleryEvents);
  }

  // Display user art initialization
  const displayArtBtn = document.querySelector('.displayUserArt');
  if (displayArtBtn) {
    displayArtBtn.addEventListener('click', handleDisplayArt, { once: true });
  }
});

/**
 * Handles gallery-related events and interactions
 * This was the missing function causing the ReferenceError
 */
function handleGalleryEvents() {
  console.log('Setting up gallery event handlers');
  
  // Add bid button event listeners
  const bidButtons = document.querySelectorAll('.addBid');
  if (bidButtons.length) {
    bidButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        const artId = this.id.split('-')[1];
        openBidModal(artId);
      });
    });
  }
  
  // Initialize any gallery-specific Materialize components
  const materialboxedElems = document.querySelectorAll('.materialboxed');
  if (materialboxedElems.length) {
    M.Materialbox.init(materialboxedElems);
    console.log('Initialized', materialboxedElems.length, 'materialboxed elements in gallery');
  }
  
  // You might need to implement gallery navigation or filtering here
  console.log('Gallery event handlers have been set up');
}

/**
 * Opens the bid modal for a specific artwork
 * @param {String} artId - ID of the artwork being bid on
 */
function openBidModal(artId) {
  console.log(`Opening bid modal for artwork ${artId}`);
  
  // Find and initialize the bid modal
  const bidModal = document.getElementById('bid-modal');
  if (bidModal) {
    // Store the artwork ID in a hidden field if needed
    const artIdInput = document.getElementById('bid-art-id');
    if (artIdInput) {
      artIdInput.value = artId;
    }
    
    // Open the modal
    const instance = M.Modal.getInstance(bidModal);
    if (instance) {
      instance.open();
    } else {
      // If the modal wasn't initialized yet, initialize it and open
      M.Modal.init(bidModal).open();
    }
  } else {
    console.warn('Bid modal element not found');
  }
}

/**
 * Handles displaying user artwork
 * This function was referenced but not defined in the original code
 */
function handleDisplayArt(event) {
  console.log('Displaying user artwork');
  // Implement the functionality to display user artwork
  // This would typically involve fetching data and updating the DOM
}

// Form data collection
function collectFormData() {
  console.log('Collecting form data...');
  return {
    artist_firstname_input: document.getElementById('artist_firstname_input').value.trim(),
    artist_lastname_input: document.getElementById('artist_lastname_input').value.trim(),
    artist_email_input: document.getElementById('artist_email_input').value.trim(),
    art_name_input: document.getElementById('art_name_input').value.trim(),
    medium_input: document.getElementById('medium_input').value.trim(),
    description_input: document.getElementById('description_input').value.trim(),
    h_size_input: document.getElementById('h_size_input').value.trim(),
    w_size_input: document.getElementById('w_size_input').value.trim(),
    d_size_input: document.getElementById('d_size_input').value.trim(),
    price_input: document.getElementById('price_input').value.trim(),
    school: document.getElementById('school_input').value.trim(),
    approved: false, // Initial state is always unapproved
  };
}

// Form validation
function validateForm() {
  console.log('Starting form validation');
  const requiredFields = [
    'artist_firstname_input',
    'artist_lastname_input',
    'artist_email_input',
    'art_name_input',
    'medium_input',
    'description_input',
    'h_size_input',
    'w_size_input',
    'price_input',
    'sampleFile',
    'auctionId',
  ];

  const validationResults = requiredFields.map((fieldId) => {
    const element = document.getElementById(fieldId);
    const isValid = element && element.value.trim().length > 0;
    console.log(`Validating ${fieldId}:`, {
      element: !!element,
      value: element?.value,
      isValid,
    });
    return isValid;
  });

  const isValid = validationResults.every((result) => result);
  console.log('Form validation result:', isValid);
  return isValid;
}

// File processing and FormData creation
function addFile(form, sampleFile, name) {
  try {
    console.log('Processing file and form data:', {
      fileName: name,
      fileType: sampleFile[0]?.type,
      fileSize: sampleFile[0]?.size,
    });

    const newArtwork = new FormData();

    // Handle numeric conversions
    const numericForm = {
      price: parseFloat(form.price_input) || 0,
      height: parseFloat(form.h_size_input) || 0,
      width: parseFloat(form.w_size_input) || 0,
      depth: form.d_size_input ? parseFloat(form.d_size_input) : null,
    };

    // Validate numeric values
    if (numericForm.price <= 0) throw new Error('Price must be greater than 0');
    if (numericForm.height <= 0) throw new Error('Height must be greater than 0');
    if (numericForm.width <= 0) throw new Error('Width must be greater than 0');
    if (numericForm.depth !== null && numericForm.depth < 0) {
      throw new Error('Depth cannot be negative');
    }

    // Append file first
    newArtwork.append('sampleFile', sampleFile[0], name);

    // Append all form fields
    Object.entries(form).forEach(([key, value]) => {
      console.log(`Appending form field: ${key} = ${value}`);
      newArtwork.append(key, value);
    });

    // Log final FormData contents
    console.log('FormData created successfully. Fields:');
    for (const pair of newArtwork.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    return newArtwork;
  } catch (error) {
    console.error('Error in addFile:', error);
    throw error;
  }
}

// Main form submission handler
async function handleFormSubmit(event) {
  event.preventDefault();
  console.log('Form submission started');

  if (ajaxLoading) {
      console.log('Upload already in progress');
      return;
  }

  try {
      ajaxLoading = true;
      
      const sampleFileInput = document.getElementById('sampleFile');
      const sampleFile = sampleFileInput?.files;

      if (!sampleFile || sampleFile.length === 0) {
          throw new Error('Please select a file to upload');
      }

      if (validateForm()) {
          const formData = collectFormData();
          clearMessages();

          try {
              const artworkData = addFile(formData, sampleFile, sampleFile[0].name);
              
              // Show progress container
              const progressContainer = document.getElementById('upload-progress-container');
              if (progressContainer) progressContainer.style.display = 'block';

              // Use XMLHttpRequest for upload progress
              const uploadPromise = new Promise((resolve, reject) => {
                  const xhr = new XMLHttpRequest();

                  xhr.upload.addEventListener('progress', (event) => {
                      if (event.lengthComputable) {
                          const percentComplete = Math.round((event.loaded / event.total) * 100);
                          updateProgress(percentComplete);
                      }
                  });

                  xhr.addEventListener('load', () => {
                      if (xhr.status >= 200 && xhr.status < 300) {
                          resolve(JSON.parse(xhr.response));
                      } else {
                          reject(new Error(`Upload failed: ${xhr.statusText}`));
                      }
                  });

                  xhr.addEventListener('error', () => {
                      reject(new Error('Upload failed'));
                  });

                  xhr.open('POST', '/upload');
                  xhr.send(artworkData);
              });

              const result = await uploadPromise;
              
              console.log('Upload success:', result);
              updateProgress(100);
              showSuccessModal(result.artwork_name);
              
              setTimeout(() => {
                  window.location.replace('/profile');
              }, 2000);
          } catch (error) {
              console.error('Upload error:', error);
              showErrorModal(error.message);
          }
      } else {
          showFormErrorModal();
      }
  } catch (error) {
      console.error('Form submission error:', error);
      showErrorMessage(error.message);
  } finally {
      ajaxLoading = false;
  }
}

function updateProgress(percent) {
  console.log(`Upload progress: ${percent}%`);
  const progressBar = document.getElementById('upload-progress-bar');
  const progressText = document.getElementById('upload-progress-text');
  
  if (progressBar) {
      progressBar.style.width = `${percent}%`;
      progressBar.setAttribute('aria-valuenow', percent);
  }
  if (progressText) {
      progressText.textContent = `${Math.round(percent)}%`;
  }
}

// UI Update Functions
function clearMessages() {
  const uploadErrMsg = document.getElementById('upload-err-msg');
  const artUpload = document.getElementById('art-upload');
  if (uploadErrMsg) uploadErrMsg.textContent = '';
  if (artUpload) artUpload.textContent = '';
}

// Note: There are two updateProgress functions in the original code.
// I'm keeping both for compatibility, but you might want to consolidate them.
function updateProgress(percent) {
  const progressBar = document.getElementById('upload-progress-bar');
  const progressText = document.getElementById('upload-progress-text');
  const progressContainer = document.getElementById('upload-progress-container');

  if (progressContainer) progressContainer.style.display = 'block';
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}%`;
}

function showModal(content) {
  const modal = document.getElementById('FileAction-modal');
  if (modal) {
    modal.innerHTML = content;
    const instance = M.Modal.getInstance(modal);
    if (instance) instance.open();
  }
}

// Modal Content Generators
function getSuccessModalContent(artworkName) {
  return `
        <div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Success!</h4>
            <h5 class='center-align'><b>The File ${artworkName} was added to the database!</b></h5>
        </div>
        <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
        </div>
    `;
}

function getErrorModalContent(message) {
  return `
        <div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Error!</h4>
            <h5 class='center-align'><b>${message}</b></h5>
        </div>
        <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
        </div>
    `;
}

// Message Display Functions
function showErrorMessage(message) {
  const errorMsg = document.getElementById('upload-err-msg');
  if (errorMsg) errorMsg.textContent = message;
}

function showSuccessModal(artworkName) {
  showModal(getSuccessModalContent(artworkName));
}

function showErrorModal(message) {
  showModal(getErrorModalContent(message));
}

function showFormErrorModal() {
  showModal(getErrorModalContent('Please fill out the Whole form to upload a file.'));
  showErrorMessage('**Please fill out entire form!!**');
}