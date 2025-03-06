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

// Helper function to create and append elements (replacement for jQuery element creation)
function createElement(tag, classes = [], attributes = {}) {
  const element = document.createElement(tag);

  if (classes.length) {
    element.classList.add(...classes);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  const sidenavElements = document.querySelectorAll('.sidenav');
  if (sidenavElements.length) {
    M.Sidenav.init(sidenavElements);
  }

  const materialboxedElements = document.querySelectorAll('.materialboxed');
  if (materialboxedElements.length) {
    M.Materialbox.init(materialboxedElements);
  }

  // Populate Gallery with approved artwork
  console.log('line 6 In gallery.js');
  const items = [];

  try {
    fetch('/get-imgs')
      .then((response) => response.json())
      .then((res) => {
        let count = 0;

        res.forEach((item, i) => {
          let respdiv = createElement('div', ['responsive']);
          let picrow = createElement('div', ['gallery']);
          let divcol = createElement('div', ['gallery'], { style: 'overflow-wrap: normal' });

          const bidBut = createElement('a', ['btn', 'btn-small', 'red', 'darken-4', 'waves-effect', 'waves-light', 'hoverable', 'addBid'], { value: 'Bid' });
          bidBut.innerHTML = 'Bid <i class="material-icons right">gavel</i>';

          if (!res[i].artId || res[i].artId === undefined) {
            respdiv = createElement('div', ['responsive'], { id: `resp-${res[count - 1].artId}` });
            document.getElementById('displayUserArt').prepend(respdiv);

            picrow = createElement('div', ['gallery'], { id: `#row${count}` });
            respdiv.prepend(picrow);

            divcol = createElement('div', ['gallery'], { id: `ulimage${count}` });
            picrow.prepend(divcol);
          } else {
            console.log('=====================>>>>>trying to add Name Div to <img>: ', res[count].artistFirstName);
            console.log(`<img${count + 1}>`);
          }

          console.log('XXXXXXXXXXXXXXXXXXX count : ', count);

          if (count % 4 !== 0) {
            console.log('added: ', divcol);
            console.log(`res[${i}.artId] ${res[i].artId}`);

            const img = createElement('img', ['materialboxed', 'responsive-img'], {
              id: `img${count}`,
              src: res[count],
            });
            picrow.prepend(img);

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
          } else {
            const img = createElement('img', ['materialboxed', 'responsive-img'], {
              id: `img${count}`,
              src: res[count],
            });
            picrow.prepend(img);

            const spacerDiv = createElement('div', ['row'], { id: `ulDisplay${count}` });
            spacerDiv.innerHTML = '<br>';
            respdiv.appendChild(spacerDiv);
          }

          count++;
          console.log('in if then divcol: ', divcol);

          // Re-initialize materialbox for newly added elements
          const newMaterialboxed = document.querySelectorAll('.materialboxed');
          M.Materialbox.init(newMaterialboxed);
        });
      });
  } catch (err) {
    console.log(`Something went wrong ${err}`);
    const errMsg = document.getElementById('err-msg');
    if (errMsg) {
      errMsg.textContent = '** No Images found. **';
    }
  }

  // ------------------------------ get_id_fx ---------------------------------- //
  function getId(idIn) {
    console.log('got id from button click idIn: ', idIn);
    const splitId = idIn.split('-');
    const idOut = splitId[1];
    return idOut;
  }

  // Bid Button click handler using event delegation
  const displayUserArt = document.getElementById('displayUserArt');
  if (displayUserArt) {
    displayUserArt.addEventListener('click', (event) => {
      if (event.target.closest('.addBid')) {
        const bidButton = event.target.closest('.addBid');
        console.log('Bid Clicked!');
        console.log('id to copy to user Bid page: ', bidButton.id);

        try {
          fetch('/get-gallery-imgs')
            .then((response) => response.json())
            .then((res) => {
              console.log('Info from button click res: ', res);
              console.log('Line 130--->>>This: ', bidButton.id);
              const bidId = getId(bidButton.id);
              console.log('Line---132 this.artName: ', bidButton.artName);

              let bidArtname = '';

              try {
                fetch(`/get-bid-img?id=${bidId}`)
                  .then((response) => response.json())
                  .then((resp) => {
                    console.log('resp: ', resp);
                    bidArtname = resp.artName;

                    // Open modal for bid
                    const bidModal = M.Modal.getInstance(document.getElementById('BidAction-modal'));
                    if (bidModal) {
                      document.getElementById('BidAction-modal').innerHTML = `
                        <div class='modal-content'>
                          <h4>Enter Your Bid</h4>
                          <h4 class='center-align'>How much are you Bidding?</h4>
                          <form action="#">
                          <p class="range-field">
                            <input type="range" id="newBid" min="0" max="1000" />
                          </p>
                        </form>
                          <h5 class='center-align'><b>Your bid on ${bidArtname} was copied to the bid collection!</b></h5>
                        </div>
                        <div class="modal-footer">
                          <button type="submit" class="btn btn-default red darken-4" id="confirm-bid">YES</button>
                          <button type="submit" class="btn btn-default green darken-4 modal-close" id="cancel-bid">CANCEL</button>
                        </div>
                        `;
                      bidModal.open();
                    }
                  });
              } catch (err) {
                console.log(`Something went wrong ${err}`);
                const errMsg = document.getElementById('err-msg');
                if (errMsg) {
                  errMsg.textContent = '** No Images found. **';
                }
              }
            });
        } catch (err) {
          const bidModal = M.Modal.getInstance(document.getElementById('BidAction-modal'));
          if (bidModal) {
            document.getElementById('BidAction-modal').innerHTML = `
              <div class='modal-content'>
                <h4>Error Entering Your Bid</h4>
                <h4 class='center-align'>There was an issue with your Bid.</h4>
                <h5 class='center-align'><b>Your bid did not go through!</b></h5>
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-default green darken-4 modal-close" id="cancel-bid">CANCEL</button>
              </div>
              `;
            bidModal.open();
          }
        }

        const { id } = bidButton;
        const splitId = id.split('-');
        const bidindex = splitId[1];

        try {
          fetch('/add-bid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: bidindex }),
          })
            .then((response) => response.json())
            .then((status) => {
              console.log('Line 158--->status: ', status.art_name_input);

              const uploadErrMsg = document.getElementById('upload-err-msg');
              if (uploadErrMsg) {
                uploadErrMsg.textContent = `** Success! ${status.art_name_input} copied to bid collection! **`;
              }

              const fileModal = M.Modal.getInstance(document.getElementById('FileAction-modal'));
              if (fileModal) {
                document.getElementById('FileAction-modal').innerHTML = `
                <div class='modal-content'>
                <h4>File Activity</h4>
                <h4 class='center-align'>Success!</h4>
                <h5 class='center-align'><b>The File ${status.art_name_input} was copied to the bid collection!</b></h5>
                </div>
                <div class="modal-footer">
                <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
                </div>
                `;
                fileModal.open();
              }
            })
            .catch((error) => {
              const uploadErrMsg = document.getElementById('upload-err-msg');
              if (uploadErrMsg) {
                uploadErrMsg.textContent = `**Error: Something Broke-->${error}**`;
              }

              const fileModal = M.Modal.getInstance(document.getElementById('FileAction-modal'));
              if (fileModal) {
                document.getElementById('FileAction-modal').innerHTML = `
                <div class='modal-content'>
                <h4>File Activity</h4>
                <h4 class='center-align'>Error!</h4>
                <h5 class='center-align'><b>The File was NOT added to the bid collection!</b></h5>
                <h5 class='center-align'><b>**Error: Something Broke-->${error}** </b></h5>
                </div>
                <div class="modal-footer">
                <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
                </div>
                `;
                fileModal.open();
              }
            });
        } catch (err) {
          console.log(`Something went wrong ${err}`);
          const errMsg = document.getElementById('err-msg');
          if (errMsg) {
            errMsg.textContent = '**images not added to the bid collection.**';
          }
        }

        // the following line would remove the gallery block by index bidindex
        // document.getElementById(`resp-${bidindex}`).remove();

        // Trigger click on displayUserArt if needed
        const displayUserArtBtn = document.querySelector('.displayUserArt');
        if (displayUserArtBtn) {
          displayUserArtBtn.click();
        }
      }
    });
  }
});
