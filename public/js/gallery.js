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

$(document).ready(() => {
  $('.sidenav').sidenav();
  $('.materialboxed').materialbox();

  // Populate Gallery with approved artwork
  console.log('line 6 In gallery.js');
  const items = [];
  try {
    $.ajax({
      type: 'get',
      url: '/get-gallery-imgs',
      data: items,
    })
      .then((res) => {
        let count = 0;
        // eslint-disable-next-line no-loop-func
        $.each(res, (i) => {
          let respdiv = $('<div>')
            .addClass('responsive');
          let picrow = $('<div>')
            .addClass('gallery');
          let divcol = $('<div/>')
            .addClass('gallery')
            .attr('style', 'overflow-wrap: normal');
          const bidBut = $('<a class="btn btn-small red darken-4 waves-effect waves-light hoverable addBid" value="Bid"><i class="material-icons right">gavel</i>Bid</a>');
          if (!res[i].artId || res[i].artId === undefined) {
            respdiv = $('<div>')
              .addClass('responsive')
              .attr('id', `resp-${res[count - 1].artId}`)
              .prependTo('#displayUserArt');
            picrow = $('<div>')
              .addClass('gallery')
              .attr('id', `#row${count}`)
              .prependTo(respdiv);
            divcol = $('<div/>')
              .addClass('gallery')
              .attr('id', `ulimage${count}`)
              .prependTo(picrow);
            $(divcol);
          } else {
            console.log('=====================>>>>>trying to add Name Div to <img>: ', res[count].artistFirstName);
            console.log(`<img${count + 1}>`);
          }
          console.log('XXXXXXXXXXXXXXXXXXX count : ', count);
          if (count % 4 !== 0) {
            console.log('added: ', divcol);
            console.log(`res[${i}.artId] ${res[i].artId}`);
            const img = $('<img>')
              .addClass('materialboxed')
              .addClass('responsive-img')
              .attr('id', `img${count}`)
              .attr('src', res[count])
              .prependTo(picrow);
            $(`<div><b>Title:</b> ${res[count - 1].artName}</div>`).appendTo(picrow);
            $(`<div><b>Artist:</b> ${res[count - 1].artistFirstName} ${res[count - 1].artistLastName}</div>`).appendTo(picrow);
            $(`<div> ${res[count - 1].artDesc}</div>`).appendTo(picrow);
            $(`<div><b>Height:</b> ${res[count - 1].artHeight} <b>in Width:</b> ${res[count - 1].artWidth} <b>in</b></div>`).appendTo(picrow);
            $(`<div><b>Price: $</b> ${res[count - 1].artPrice}</div>`).appendTo(picrow);
            if (res[count - 1].artDepth > 0) {
              $(`<div><b>Depth:</b> ${res[count - 1].artDepth}<b>in</b></div>`).appendTo(picrow);
            }
            $(bidBut).attr('id', `bid-${res[count - 1].artId}`);
            $(picrow).append(bidBut);
            console.log(`res[${count}]._id`);
          } else {
            const img = $('<img>')
              .addClass('materialboxed')
              .addClass('responsive-img')
              .attr('id', `img${count}`)
              .attr('src', res[count])
              .prependTo(picrow);
            // $(`<div>Title: ${res[count].artName}</div>`).append(picrow);
            $('<div>' + '<br>' + '</div>')
              .addClass('row')
              .attr('id', `ulDisplay${count}`)
              .appendTo(respdiv);
          // count = 0;
          }
          // eslint-disable-next-line no-plusplus
          count++;
          console.log('in if then divcol: ', divcol);
          $('.materialboxed').materialbox();
        });
      });
  } catch (err) {
    console.log(`Something went wrong ${err}`);
    $('#err-msg').empty('').text('** No Images found. **');
  }

  // ------------------------------ get_id_fx ---------------------------------- //
  function getId(idIn) {
    console.log('got id from button click idIn: ', idIn);
    const splitId = idIn.split('-');
    const idOut = splitId[1];
    return (idOut);
  }

  // Bid Button
  $('#displayUserArt').on('click', '.addBid', function () {
    console.log('Bid Clicked!');
    console.log('id to copy to user Bid page: ', this.id);
    try {
      $.ajax({
        type: 'get',
        url: '/get-gallery-imgs',
        data: items,
      })
        .then((res) => {
          console.log('Info from button click res: ', res);
          console.log('Line 130--->>>This: ', this.id);
          const bidId = getId(this.id);
          console.log('Line---132 this.artName: ', this.artName);
          try {
            $.ajax({
              type: 'get',
              url: '/get-bid-img',
              data: bidId,
            })
              .then((resp) => {
                console.log('resp: ', resp);
                const bidArtname = resp.artName;
              });
          } catch (err) {
            console.log(`Something went wrong ${err}`);
            $('#err-msg').empty('').text('** No Images found. **');
          }
          $('#BidAction-modal').modal('open').html(`
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
          </div>
        `);
        });
    }
    catch (err) {
      $('#BidAction-modal').modal('open').html(`
          <div class='modal-content'>
            <h4>Error Entering Your Bid</h4>
            <h4 class='center-align'>There was an issue with your Bid.</h4>
            <h5 class='center-align'><b>Your bid did not go through!</b></h5>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-default green darken-4 modal-close" id="cancel-bid">CANCEL</button>
          </div>
          </div>
        `);
    }
    const { id } = this;
    const splitId = id.split('-');
    const bidindex = splitId[1];
    try {
      $.ajax({
        type: 'post',
        url: '/add-bid',
        data: { _id: bidindex },
        success(status, res) {
          console.log('Line 158--->status: ', status.art_name_input);
          $('#upload-err-msg').empty('').text(`** Success! ${status.art_name_input} copied to bid collection! **`);
          $('#FileAction-modal').modal('open').html(
            `<div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Success!</h4>
            <h5 class='center-align'><b>The File ${status.art_name_input} was copied to the bid collection!</b></h5>
            </div>
            <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
            </div>
            </div>`,
          );
        },
        error(status, error) {
          // $.each(xhr, (key, value) => {
          //   alert(key + ": " + value);
          // });
          $('#upload-err-msg').empty('').text(`**${status}: Something Broke-->${error}**`);
          $('#FileAction-modal').modal('open').html(
            `<div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Error!</h4>
            <h5 class='center-align'><b>The File ${status.art_name_input} was NOT added to the bid collection!</b></h5>
            <h5 class='center-align'><b>**${status}: Something Broke-->${error}** </b></h5>
            </div>
            <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
            </div>
            </div>`,
          );
        },
      })
        .then((res) => {
        });
    } catch (err) {
      console.log(`Something went wrong ${err}`);
      $('#err-msg').empty('').text('**images not added to the bid collection.**');
    }
    // the following line would remove the gallery block by index bidindex
    // $(`#resp-${bidindex}`).remove();

    $('.displayUserArt').click();
  });
});
