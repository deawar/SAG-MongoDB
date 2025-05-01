function addFile(form, sampleFile, name) {
  const newBid = new FormData();
  // newArtwork.append('formvalues', form);
  newBid.append('sampleFile', sampleFile[0], name);
  newBid.append('artist_firstname_input', form.first_name);
  newBid.append('artist_lastname_input', form.last_name);
  newBid.append('art_name_input', form.artwork_name);
  newBid.append('description_input', form.description);
  newBid.append('d_size_input', form.depth);
  newBid.append('artist_email_input', form.email);
  newBid.append('h_size_input', form.height);
  newBid.append('medium_input', form.medium);
  newBid.append('price_input', form.price);
  newBid.append('w_size_input', form.width);
  newBid.append('school_input', form.school);
  newBid.append('approved', form.approved);
  console.log('newBid form after append: ', newBid);
  return newBid;
}

/**
 * Loads artwork items from the server and populates the gallery
 */
function loadGalleryItems() {
  console.log('Loading gallery items');

  fetch('/get-imgs')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((res) => {
      populateGallery(res);
      initializeMaterialbox();
    })
    .catch((err) => {
      console.error(`Error loading gallery: ${err}`);
      displayError('** No Images found. **');
    });
}

// Client-side JavaScript for gallery page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Gallery page initialized');
  loadGalleryItems();
});

/**
 * Populates the gallery with artwork items
 * @param {Array} res - Array of artwork objects
 */
function populateGallery(res) {
  const displayUserArt = document.getElementById('displayUserArt');

  if (!res || res.length === 0) {
    displayError('** No Images found. **');
    return;
  }

  let count = 0;

  res.forEach((item, i) => {
    // Create container elements
    let respdiv = createElement('div', ['responsive']);
    let picrow = createElement('div', ['gallery']);
    let divcol = createElement('div', ['gallery'], { style: 'overflow-wrap: normal' });

    // Create bid button
    const bidBut = createElement('a', ['btn', 'btn-small', 'red', 'darken-4', 'waves-effect', 'waves-light', 'hoverable', 'addBid'], { value: 'Bid' });
    bidBut.innerHTML = 'Bid <i class="material-icons right">gavel</i>';

    // Handle items without artId (similar to original logic)
    if (!res[i].artId || res[i].artId === undefined) {
      if (count > 0) { // Make sure we don't go out of bounds
        respdiv = createElement('div', ['responsive'], { id: `resp-${res[count - 1].artId}` });
        displayUserArt.prepend(respdiv);

        picrow = createElement('div', ['gallery'], { id: `#row${count}` });
        respdiv.prepend(picrow);

        divcol = createElement('div', ['gallery'], { id: `ulimage${count}` });
        picrow.prepend(divcol);
      }
    } else {
      console.log('=====================>>>>>trying to add Name Div to <img>: ', res[count].artistFirstName);
      console.log(`<img${count + 1}>`);
    }

    console.log('XXXXXXXXXXXXXXXXXXX count : ', count);

    // Add content based on count (similar to original logic)
    if (count % 4 !== 0) {
      console.log('added: ', divcol);
      console.log(`res[${i}.artId] ${res[i].artId}`);

      // Create and add image
      const img = createElement('img', ['materialboxed', 'responsive-img'], {
        id: `img${count}`,
      });

      // Handle base64 image data
      if (typeof res[count] === 'string' && res[count].includes(',')) {
        img.src = res[count];
      } else if (typeof res[count] === 'string') {
        img.src = `data:image/jpeg;base64,${res[count]}`;
      } else {
        img.src = res[count].src || '';
      }
      picrow.prepend(img);

      // Add artwork details
      if (count > 0) { // Make sure we don't go out of bounds
        const titleDiv = createElement('div');
        titleDiv.innerHTML = `<b>Title:</b> ${res[count - 1].artName}`;
        picrow.appendChild(titleDiv);

        const artistDiv = createElement('div');
        artistDiv.innerHTML = `<b>Artist:</b> ${res[count - 1].artistFirstName} ${res[count - 1].artistLastName}`;
        picrow.appendChild(artistDiv);

        const descDiv = createElement('div');
        descDiv.innerHTML = `${res[count - 1].artDesc}`;
        picrow.appendChild(descDiv);

        const dimensionsDiv = createElement('div');
        dimensionsDiv.innerHTML = `<b>Height:</b> ${res[count - 1].artHeight} <b>in Width:</b> ${res[count - 1].artWidth} <b>in</b>`;
        picrow.appendChild(dimensionsDiv);

        const priceDiv = createElement('div');
        priceDiv.innerHTML = `<b>Price: $</b> ${res[count - 1].artPrice}`;
        picrow.appendChild(priceDiv);

        if (res[count - 1].artDepth > 0) {
          const depthDiv = createElement('div');
          depthDiv.innerHTML = `<b>Depth:</b> ${res[count - 1].artDepth}<b>in</b>`;
          picrow.appendChild(depthDiv);
        }

        bidBut.id = `bid-${res[count - 1].artId}`;
        picrow.appendChild(bidBut);
        console.log(`res[${count}]._id`);
      }
    } else {
      // Handle every 4th item
      const img = createElement('img', ['materialboxed', 'responsive-img'], {
        id: `img${count}`,
      });

      // Handle base64 image data
      if (typeof res[count] === 'string' && res[count].includes(',')) {
        img.src = res[count];
      } else if (typeof res[count] === 'string') {
        img.src = `data:image/jpeg;base64,${res[count]}`;
      } else {
        img.src = res[count].src || '';
      }
      picrow.prepend(img);

      const spacerDiv = createElement('div', ['row'], { id: `ulDisplay${count}` });
      spacerDiv.innerHTML = '<br>';
      respdiv.appendChild(spacerDiv);
    }

    displayUserArt.appendChild(respdiv);
    count++;
    console.log('in if then divcol: ', divcol);
  });
}

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
 * Initializes Materialize components
 */
function initializeMaterialbox() {
  const materialboxed = document.querySelectorAll('.materialboxed');
  M.Materialbox.init(materialboxed);
}

/**
 * Displays an error message
 * @param {String} message - Error message
 */
function displayError(message) {
  const errMsg = document.getElementById('err-msg');
  if (errMsg) {
    errMsg.textContent = message;
  } else {
    console.error(message);
  }
}
