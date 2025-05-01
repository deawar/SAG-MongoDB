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

// Dynamic artwork slideshow using Materialize CSS components
let artworks = []; // Will store artwork data from the database
let carouselInstance = null; // Will store Materialize carousel instance

/**
 * Fetches artwork data from the database
 * @returns {Promise<Array>} Array of artwork objects
 */
const fetchArtworks = async () => {
  try {
    // Using the endpoint from dashboard_controller.js
    const response = await fetch('/get-imgs');
    // const response = await fetch('/artworks');
    console.log('Fetched artworks:', artworks);
    if (!response.ok) {
      throw new Error(`Failed to fetch artworks: ${response.status}`);
    }

    const data = await response.json();

    // Debugging: Log the entire response
    console.log('Raw API Response:', data);

    if (!data.success) {
      console.error('API responded with an error:', data);
      return [];
    }

    // Debugging: Log the actual artworks array
    console.log('Fetched Artworks:', data.artworks);

    return data.success ? data.artworks : [];
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
};

/**
 * Initializes the Materialize carousel with artworks from the database
 */
const initializeCarousel = async () => {
  setTimeout(() => {
    console.log('Carousel HTML after initialization:', document.querySelector('.carousel').innerHTML);
  }, 2000);
  // Get the carousel container
  const carouselContainer = document.querySelector('.carousel');

  if (!carouselContainer) {
    console.error('Carousel container not found');
    return;
  }

  try {
    // Fetch artworks from database
    artworks = await fetchArtworks();

    if (artworks.length === 0) {
      carouselContainer.innerHTML = '<p class="center-align">No artworks available at this time.</p>';
      return;
    }

    // Clear existing slides
    carouselContainer.innerHTML = '';

    // Create carousel items for each artwork
    artworks.forEach((artwork) => {
      console.log(`Adding image: ${artwork.img}`);
      // Create carousel item
      const slide = document.createElement('a');
      slide.className = 'carousel-item';
      slide.href = '#';
      slide.setAttribute('data-artwork-id', artwork._id);

      // Create image and caption
      const img = document.createElement('img');
      img.src = artwork.img;
      img.alt = artwork.art_name_input || artwork.title;

      const caption = document.createElement('div');
      caption.className = 'caption center-align';

      // Use the appropriate field names depending on what's available
      const title = artwork.art_name_input || artwork.title || 'Untitled';
      const artistName = artwork.artist_firstname_input && artwork.artist_lastname_input
        ? `${artwork.artist_firstname_input} ${artwork.artist_lastname_input}`
        : artwork.artistName || 'Unknown Artist';

      caption.innerHTML = `
        <h3>${title}</h3>
        <h5>by ${artistName}</h5>
      `;

      // Append elements
      slide.appendChild(img);
      slide.appendChild(caption);
      carouselContainer.appendChild(slide);
    });

    // Initialize Materialize Carousel
    const options = {
      fullWidth: true,
      indicators: true,
      duration: 200,
      onCycleTo(item) {
        // Update caption if needed
        const captionElement = document.getElementById('caption');
        if (captionElement) {
          const activeArtworkId = item.getAttribute('data-artwork-id');
          const activeArtwork = artworks.find((a) => a._id === activeArtworkId);
          if (activeArtwork) {
            const title = activeArtwork.art_name_input || activeArtwork.title || 'Untitled';
            const description = activeArtwork.description_input || activeArtwork.description || '';
            const artistName = activeArtwork.artist_firstname_input && activeArtwork.artist_lastname_input
              ? `${activeArtwork.artist_firstname_input} ${activeArtwork.artist_lastname_input}`
              : activeArtwork.artistName || 'Unknown Artist';
            const currentBid = activeArtwork.currentBid || activeArtwork.currentbid;

            captionElement.innerHTML = `
              <h4>${title}</h4>
              <p>${description}</p>
              <p>Artist: ${artistName}</p>
              ${currentBid ? `<p>Current Bid: $${currentBid}</p>` : ''}
            `;
          }
        }
      },
    };

    // Initialize the carousel
    carouselInstance = M.Carousel.init(carouselContainer, options);

    // Add navigation buttons if needed
    setupCarouselNavigation();

    // Auto-slide functionality if desired
    const autoSlideInterval = setInterval(() => {
      if (carouselInstance) {
        carouselInstance.next();
      } else {
        clearInterval(autoSlideInterval);
      }
    }, 5000); // Change slide every 5 seconds

    console.log('Carousel initialized successfully with', artworks.length, 'artworks');
  } catch (error) {
    console.error('Error initializing carousel:', error);
    carouselContainer.innerHTML = '<p class="center-align red-text">Error loading artwork slideshow</p>';
  }
};

/**
 * Sets up navigation buttons for the carousel
 */
const setupCarouselNavigation = () => {
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');

  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (carouselInstance) {
        carouselInstance.prev();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (carouselInstance) {
        carouselInstance.next();
      }
    });
  }
};

/**
 * Checks for new artworks and updates the carousel if needed
 */
const checkForNewArtworks = async () => {
  try {
    const newArtworks = await fetchArtworks();

    // If we have new artworks (either more or different ones), reinitialize the carousel
    if (newArtworks.length !== artworks.length
        || JSON.stringify(newArtworks.map((a) => a._id)) !== JSON.stringify(artworks.map((a) => a._id))) {
      console.log('New artworks detected, updating carousel');

      // Destroy existing carousel instance if it exists
      if (carouselInstance) {
        carouselInstance.destroy();
        carouselInstance = null;
      }

      // Reinitialize carousel with new data
      initializeCarousel();
    }
  } catch (error) {
    console.error('Error checking for new artworks:', error);
  }
};

// Initialize the carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeCarousel();

  // Set up a periodic check for new artworks
  setInterval(checkForNewArtworks, 60000); // Check every minute
});
