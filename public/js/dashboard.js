// For the countdown timer
// Set the date we're counting down to
const countDownDate = new Date('April 5, 2025 15:30:00').getTime();

// Create a countdown timer
const countdownElement = document.getElementById('demo');

/**
 * Updates the countdown display
 */
const updateCountdown = () => {
  // Get current time
  const now = new Date().getTime();

  // Find the distance between now and the count down date
  const distance = countDownDate - now;

  if (distance < 0) {
    // If countdown is over
    if (countdownElement) {
      countdownElement.textContent = 'EXPIRED';
    }
    return;
  }

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Output the result
  if (countdownElement) {
    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Schedule next update
  setTimeout(updateCountdown, 1000);
};

// Start the countdown if the element exists
if (countdownElement) {
  updateCountdown();
}

// Client-side JavaScript for dashboard page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard page initialized');
  loadArtworkForSlider();
});

/**
   * Loads artwork using the existing /get-imgs endpoint
   * and initializes both the slider and thumbnails
   */
function loadArtworkForSlider() {
  console.log('Loading artwork for dashboard slider');

  fetch('/get-imgs')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((res) => {
      console.log('Response received:', res.length, 'items');

      if (!res || res.length === 0) {
        displayError('No artwork found to display');
        return;
      }

      // Extract the actual image data and pair it with metadata
      const processedArtworks = processArtworkData(res);
      console.log('Processed artworks:', processedArtworks);

      populateSlider(processedArtworks);
      populateThumbnails(processedArtworks);
      initializeSlider();

      // Initialize materialbox after a delay to ensure everything is rendered
      setTimeout(() => {
        initializeMaterialbox();
      }, 500);

      // Use a subset for latest artworks
      populateLatestArtworks(processedArtworks.slice(0, 4));
    })
    .catch((err) => {
      console.error(`Error loading artwork for slider: ${err}`);
      displayError('Unable to load artwork for display');
    });
}

/**
   * Process the raw data to pair metadata with images correctly
   * @param {Array} rawData - The raw data from the API
   * @returns {Array} - Processed artwork items with metadata and image source
   */
function processArtworkData(rawData) {
  const processedItems = [];
  let currentMetadata = null;

  console.log('Processing raw data:', rawData.length, 'items');

  // Log some sample data to verify structure
  if (rawData.length > 0) {
    console.log('First item type:', typeof rawData[0]);
    if (typeof rawData[0] === 'object') {
      console.log('First item properties:', Object.keys(rawData[0]).join(', '));
    }
  }

  if (rawData.length > 1) {
    console.log('Second item type:', typeof rawData[1]);
    if (typeof rawData[1] === 'string' && rawData[1].startsWith('data:image')) {
      console.log('Second item appears to be an image data URL');
    }
  }

  // Look at each item and pair metadata with the following image
  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];

    // If it's an object with artId, it's metadata
    if (typeof item === 'object' && item.artId) {
      currentMetadata = item;
      console.log(`Found metadata at index ${i} for art ID: ${item.artId}`);
    }
    // If it's a string starting with data:image, it's an image and should be paired with the previous metadata
    else if (typeof item === 'string' && item.startsWith('data:image') && currentMetadata) {
      console.log(`Found image at index ${i}, pairing with metadata for art ID: ${currentMetadata.artId}`);
      processedItems.push({
        metadata: currentMetadata,
        imageSource: item,
      });
      currentMetadata = null; // Reset for the next pair
    }
  }

  console.log(`Created ${processedItems.length} paired artwork items`);

  // Log the first processed item for verification
  if (processedItems.length > 0) {
    console.log('First processed item:', {
      'metadata.artId': processedItems[0].metadata.artId,
      imageSource: `${processedItems[0].imageSource.substring(0, 30)}...`,
    });
  }

  return processedItems;
}

/**
   * Populates the main slider with artwork
   * @param {Array} artworks - Array of processed artwork objects
   */
function populateSlider(artworks) {
  const sliderContainer = document.querySelector('.slider .slides');

  if (!sliderContainer) {
    console.error('Slider container not found');
    return;
  }

  // Clear existing slides
  sliderContainer.innerHTML = '';

  // Add artwork to slider
  artworks.forEach((item, index) => {
    if (index < 10) { // Limit to 10 slides for performance
      const slide = document.createElement('li');

      // Create image element with materialboxed class for zoom functionality
      const img = document.createElement('img');
      img.classList.add('materialboxed'); // Add materialboxed class for zoom

      // Set image source directly and log for debugging
      console.log(`Setting image source for slide ${index}:`, item.imageSource ? `${item.imageSource.substring(0, 30)}...` : 'undefined');
      img.src = item.imageSource || '';

      // Add event listeners to debug image loading
      img.onload = function () {
        console.log(`Image ${index} loaded successfully`);
      };
      img.onerror = function () {
        console.error(`Error loading image for slide ${index}`);
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><text x="10" y="20" fill="red">Image Error</text></svg>';
        this.alt = 'Error loading image';
      };

      // Add caption with metadata
      const { metadata } = item;
      if (metadata) {
        const caption = document.createElement('div');
        caption.className = 'caption center-align';

        const title = document.createElement('h3');
        title.textContent = metadata.artName || 'Untitled';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        caption.appendChild(title);

        const artist = document.createElement('h5');
        artist.className = 'light grey-text text-lighten-3';
        artist.textContent = `${metadata.artistFirstName || ''} ${metadata.artistLastName || ''}`;
        artist.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        caption.appendChild(artist);

        // Add the caption to the slide
        slide.appendChild(caption);

        // Log for debugging
        console.log(`Added caption for slide ${index}: "${metadata.artName}" by ${metadata.artistFirstName} ${metadata.artistLastName}`);
      }

      slide.appendChild(img);
      sliderContainer.appendChild(slide);
    }
  });

  console.log('Adding navigation arrows to slider');
  // Add navigation arrows
  addSliderNavigation();
}

/**
   * Add navigation arrows to the slider
   */
function addSliderNavigation() {
  // Make sure to get the slider container, not the slides container
  const slider = document.querySelector('.slider');
  if (!slider) {
    console.error('Slider not found for adding navigation arrows');
    return;
  }

  console.log('Found slider element, adding navigation arrows');

  // Remove any existing arrows first to prevent duplicates
  const existingArrows = slider.querySelectorAll('.slider-nav-arrow');
  existingArrows.forEach((arrow) => arrow.remove());

  // Create left arrow
  const leftArrow = document.createElement('div');
  leftArrow.className = 'slider-nav-arrow left-arrow';
  leftArrow.innerHTML = '<i class="material-icons large">chevron_left</i>';
  leftArrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sliderInstance = M.Slider.getInstance(slider);
    if (sliderInstance) {
      sliderInstance.prev();
    }
    console.log('Left arrow clicked');
  });

  // Create right arrow
  const rightArrow = document.createElement('div');
  rightArrow.className = 'slider-nav-arrow right-arrow';
  rightArrow.innerHTML = '<i class="material-icons large">chevron_right</i>';
  rightArrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const sliderInstance = M.Slider.getInstance(slider);
    if (sliderInstance) {
      sliderInstance.next();
    }
    console.log('Right arrow clicked');
  });

  // Add arrows to slider
  slider.appendChild(leftArrow);
  slider.appendChild(rightArrow);

  // Ensure the arrows are visible by checking if they're in the DOM
  console.log('Left arrow added to DOM:', document.body.contains(leftArrow));
  console.log('Right arrow added to DOM:', document.body.contains(rightArrow));

  // Add CSS for arrows and image display
  addSliderStyles();
}

/**
   * Add the CSS styles for the slider and navigation arrows
   */
function addSliderStyles() {
  // Check if our custom styles already exist
  const existingStyle = document.getElementById('slider-custom-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Add CSS for arrows and image display
  const style = document.createElement('style');
  style.id = 'slider-custom-styles';
  style.textContent = `
      .slider {
        position: relative;
      }
      .slider-nav-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 999;
        cursor: pointer;
        background-color: rgba(0,0,0,0.5);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
        pointer-events: auto;
      }
      .slider-nav-arrow:hover {
        background-color: rgba(0,0,0,0.7);
      }
      .slider-nav-arrow i {
        color: white;
      }
      .left-arrow {
        left: 10px;
      }
      .right-arrow {
        right: 10px;
      }
      /* Restore original image display behavior but maintain aspect ratio */
      .slider .slides li img {
        height: auto !important;
        max-height: 450px !important;
        display: block;
        margin: 0 auto;
      }
      /* Set fixed height for the slider to provide consistent space */
      .slider .slides {
        height: 450px !important;
        background-color: #f5f5f5;
      }
      /* Ensure captions are visible */
      .slider .slides li .caption {
        width: 100%;
        padding: 10px;
        background-color: rgba(0,0,0,0.5);
        position: absolute;
        bottom: 0;
        left: 0;
        color: white;
      }
      .slider .slides li .caption h3 {
        font-size: 24px;
        margin: 5px 0;
      }
      .slider .slides li .caption h5 {
        font-size: 18px;
        margin: 5px 0;
      }
      /* Make sure materialbox overlay is above everything */
      .materialbox-overlay {
        z-index: 1000 !important;
      }
      /* Ensure the active materialboxed image appears above overlay */
      img.active.materialboxed {
        z-index: 1001 !important;
        max-width: 90% !important;
        max-height: 90% !important;
        width: auto !important;
        height: auto !important;
        object-fit: contain !important;
      }
    `;
  document.head.appendChild(style);
  console.log('Custom slider styles added');
}

/**
   * Populates the thumbnails section beneath the slider
   * @param {Array} artworks - Array of processed artwork objects
   */
function populateThumbnails(artworks) {
  const thumbnailsContainer = document.getElementById('thumbnails-container');

  if (!thumbnailsContainer) {
    console.error('Thumbnails container not found');
    return;
  }

  // Clear existing thumbnails
  thumbnailsContainer.innerHTML = '';

  // Add thumbnails
  artworks.forEach((item, index) => {
    if (index < 10) { // Match number of slides
      const thumbDiv = createElement('div', ['thumbnail-item']);

      // Create image element
      const img = createElement('img', ['responsive-img', 'thumbnail']);
      img.src = item.imageSource;

      // Add click event to navigate to slide
      img.addEventListener('click', () => {
        const slider = M.Slider.getInstance(document.querySelector('.slider'));
        if (slider) {
          slider.set(index);
        }
      });

      thumbDiv.appendChild(img);
      thumbnailsContainer.appendChild(thumbDiv);
    }
  });
}

/**
   * Populates the latest artworks section
   * @param {Array} artworks - Array of processed artwork objects
   */
function populateLatestArtworks(artworks) {
  const container = document.getElementById('latest-artworks');

  if (!container) {
    console.error('Latest artworks container not found');
    return;
  }

  const row = container.querySelector('.row');
  if (!row) return;

  // Clear existing content
  row.innerHTML = '';

  // Add recent artworks
  artworks.forEach((item, index) => {
    const { metadata } = item;
    if (metadata) {
      const col = createElement('div', ['col', 's12', 'm6', 'l3']);

      const card = createElement('div', ['card']);

      // Card image
      const cardImage = createElement('div', ['card-image']);
      const img = createElement('img', ['materialboxed']); // Use materialboxed
      img.src = item.imageSource;

      cardImage.appendChild(img);

      // Card content
      const cardContent = createElement('div', ['card-content']);
      const title = createElement('span', ['card-title']);
      title.textContent = metadata.artName || 'Untitled';

      const artist = createElement('p');
      artist.textContent = `${metadata.artistFirstName || ''} ${metadata.artistLastName || ''}`;

      cardContent.appendChild(title);
      cardContent.appendChild(artist);

      // Assemble card
      card.appendChild(cardImage);
      card.appendChild(cardContent);
      col.appendChild(card);

      row.appendChild(col);
    }
  });
}

/**
   * Initializes the Materialize slider
   */
function initializeSlider() {
  const sliderElem = document.querySelector('.slider');

  if (sliderElem) {
    const options = {
      indicators: true,
      height: 450, // Increase height to provide more space for images
      duration: 500,
      interval: 999999999, // Very large interval effectively disables auto-sliding
      pause: true, // Pause on hover
      noWrap: false,
    };

    const sliderInstance = M.Slider.init(sliderElem, options);

    // Explicitly stop auto-sliding by pausing and clearing any auto-slide interval
    if (sliderInstance) {
      // Access the internal interval if possible and clear it
      if (sliderInstance._interval) {
        clearInterval(sliderInstance._interval);
        sliderInstance._interval = null;
      }

      // Ensure captions are visible
      setTimeout(() => {
        const captions = document.querySelectorAll('.slider .caption');
        captions.forEach((caption) => {
          caption.style.display = 'block';
          caption.style.opacity = '1';
        });
      }, 500);
    }

    console.log('Slider initialized with manual navigation, auto-sliding disabled');
  } else {
    console.error('Slider element not found');
  }
}

/**
   * Initialize Materialbox for image zoom
   */
function initializeMaterialbox() {
  // Remove any existing lightbox elements from our custom implementation
  const existingLightbox = document.getElementById('custom-lightbox');
  if (existingLightbox) {
    existingLightbox.remove();
  }

  // Wait a moment to ensure all images are loaded
  setTimeout(() => {
    // First, make sure no existing instances are active
    const materialboxedElems = document.querySelectorAll('.materialboxed');
    materialboxedElems.forEach((elem) => {
      const instance = M.Materialbox.getInstance(elem);
      if (instance) {
        instance.destroy();
      }
    });

    // Reinitialize with proper configuration
    const elems = document.querySelectorAll('.materialboxed');
    if (elems.length) {
      const options = {
        inDuration: 275,
        outDuration: 200,
        onOpenStart(el) {
          console.log('Materialbox opening');
          // Override Materialize's calculations to ensure full size display
          setTimeout(() => {
            if (el.classList.contains('active')) {
              // Get actual image dimensions
              const { naturalWidth } = el;
              const { naturalHeight } = el;

              // Calculate max dimensions based on window size (90% of viewport)
              const maxWidth = window.innerWidth * 0.9;
              const maxHeight = window.innerHeight * 0.9;

              // Calculate dimensions that maintain aspect ratio
              let width = naturalWidth;
              let height = naturalHeight;

              // Scale down if necessary
              if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height *= ratio;
              }

              if (height > maxHeight) {
                const ratio = maxHeight / height;
                height = maxHeight;
                width *= ratio;
              }

              // Apply dimensions
              el.style.width = `${width}px`;
              el.style.height = `${height}px`;

              console.log(`Set zoomed image size to ${width}x${height}`);
            }
          }, 300); // Wait for animation to complete
        },
        onCloseStart() {
          console.log('Materialbox closing');
        },
      };

      M.Materialbox.init(elems, options);
      console.log(`Materialbox initialized for ${elems.length} images`);
    } else {
      console.warn('No materialboxed elements found');
    }
  }, 1000); // Wait for images to load and slider to initialize
}

// No need for the custom lightbox functions anymore

/**
   * Helper function to create DOM elements
   * @param {String} tag - HTML tag name
   * @param {Array} classes - CSS classes to add
   * @param {Object} attributes - HTML attributes to add
   * @returns {HTMLElement} - Created element
   */
function createElement(tag, classes = [], attributes = {}) {
  const element = document.createElement(tag);

  if (classes && classes.length) {
    element.classList.add(...classes);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

/**
   * Displays an error message
   * @param {String} message - Error message
   */
function displayError(message) {
  const errMsg = document.getElementById('dashboard-error');
  if (errMsg) {
    errMsg.textContent = message;
    errMsg.style.display = 'block';
  } else {
    console.error(message);
  }
}
