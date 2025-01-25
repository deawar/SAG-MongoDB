function addFile(form, sampleFile, name) {
  const newArtwork = new FormData();
  // newArtwork.append('formvalues', form);
  newArtwork.append('sampleFile', sampleFile[0], name);
  newArtwork.append('artist_firstname_input', form.first_name);
  newArtwork.append('artist_lastname_input', form.last_name);
  newArtwork.append('art_name_input', form.artwork_name);
  newArtwork.append('description_input', form.description);
  newArtwork.append('d_size_input', form.depth);
  newArtwork.append('artist_email_input', form.email);
  newArtwork.append('h_size_input', form.height);
  newArtwork.append('medium_input', form.medium);
  newArtwork.append('price_input', form.price);
  newArtwork.append('w_size_input', form.width);
  newArtwork.append('school_input', form.school);
  newArtwork.append('approved', form.approved);
  console.log('newArtwork form after append: ', newArtwork);
  return newArtwork;
}
// let ajaxLoading = false;
$(document).ready(() => {
  $('.sidenav').sidenav();
  $('.modal').modal();
  $('.materialboxed').materialbox();
  $('textarea#description_input').characterCounter();

  // --------------------- File Upload Button --------------------- //
  $('#fileUpload').on('click', (event) => {
    event.preventDefault();
    if (!ajaxLoading) {
      ajaxLoading = true;
      console.log('====================================');
      console.log('Upload Clicked!');
      console.log('====================================');
      $('#upload-carousel').carousel();
      // eslint-disable-next-line no-undef
      console.log('Line 15 upload.js');
      const sampleFile = $('#sampleFile').get(0).files;
      console.log('sampleFile: ', sampleFile);
      console.log('====================================');
      console.log('sampleFile: ', sampleFile);
      if ($('#artist_firstname_input').length && $('#artist_firstname_input').val().length
        && $('#artist_lastname_input').length && $('#artist_lastname_input').val().length
        && $('#artist_email_input').length && $('#artist_email_input').val().length
        && $('#art_name_input').length && $('#art_name_input').val().length
        && $('#medium_input').length && $('#medium_input').val().length
        && $('#description_input').length && $('#description_input').val().length
        && $('#h_size_input').length && $('#h_size_input').val().length
        && $('#w_size_input').length && $('#w_size_input').val().length
        && $('#price_input').length && $('#price_input').val().length
        && $('#sampleFile').length && $('#sampleFile').val().length) {
        const newArtworkform = {
          first_name: $('#artist_firstname_input').val().trim(),
          last_name: $('#artist_lastname_input').val().trim(),
          email: $('#artist_email_input').val().trim(),
          artwork_name: $('#art_name_input').val().trim(),
          medium: $('#medium_input').val().trim(),
          depth: $('#d_size_input').val().trim(),
          description: $('#description_input').val().trim(),
          height: $('#h_size_input').val().trim(),
          width: $('#w_size_input').val().trim(),
          price: $('#price_input').val().trim(),
          school: $('#school_input').val().trim(),
          approved: false,
          file: $('#sampleFile').val(),
        };
        console.log('newArtwork form: ', newArtworkform);
        if (sampleFile.length > 0) {
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < sampleFile.length; i++) {
            let file = sampleFile[i];
            const filename = file.name;
            console.log('====================================');
            console.log('file.name: ', filename);
            console.log('====================================');
            // eslint-disable-next-line prefer-destructuring
            file = $('#sampleFile').prop('files')[0];
          }
          console.log('sampleFile[0]: ', sampleFile[0]);
          const tmppath = URL.createObjectURL(sampleFile[0]);
          console.log('image value path: ', tmppath);
          $('#upload-err-msg').empty('');
          $('#art-upload').empty('');
          const newArtwork = addFile(newArtworkform, $('#sampleFile').get(0).files, sampleFile.name);
          console.log('formData: ', newArtworkform);
          if (newArtworkform.first_name.length > 0 && newArtworkform.last_name.length > 0
          && newArtworkform.email.length > 0 && newArtworkform.artwork_name.length > 0
          && newArtworkform.medium.length > 0 && newArtworkform.description.length > 0
          && newArtworkform.height.length > 0 && newArtworkform.width.length > 0
          && newArtworkform.price.length > 0) {
            console.log('#####===========>is newArtwork null: ', newArtwork);
            // const fileUpload = req.file.path;
            if (newArtwork !== '' || !newArtwork || newArtwork !== undefined) {
              try {
                $.ajax({
                  type: 'post',
                  url: '/upload',
                  data: newArtwork,
                  processData: false,
                  contentType: false,
                  cache: false,
                  // eslint-disable-next-line object-shorthand
                  success(status, response) {
                    console.log('status: ', status.art_name_input);
                    $('#upload-err-msg').empty('').text(`** Success! ${status.artwork_name} added to database! **`);
                    $('#FileAction-modal').modal('open').html(
                      `<div class='modal-content'>
                      <h4>File Activity</h4>
                      <h4 class='center-align'>Success!</h4>
                      <h5 class='center-align'><b>The File ${status.artwork_name} was added to the database!</b></h5>
                      </div>
                      <div class="modal-footer">
                      <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
                      </div>
                      </div>`,
                    );
                  },
                  error(status, error) {
                    $('#upload-file-modal').modal('open').html(
                      `<div class='modal-content'>
                      <h4>File Activity</h4>
                      <h4 class='center-align'>Error!</h4>
                      <h5 class='center-align'>Error status code: ${status.status} Error: ${error}</b></h5>
                      </div>
                      <div class="modal-footer">
                      <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
                      </div>
                      </div>`,
                    );
                    console.log('Status:', status);
                    console.log('error: ', error);
                  },
                  function() {
                    ajaxLoading = false;
                  },
                })
                  .then((res) => {
                    console.log('Line 133 ================> res: ', res);
                    if (newArtwork.image !== undefined) {
                      console.log('Line 135 in .then(res)');
                      window.location.reload(true);
                    } else {
                      $('#upload-err-msg').empty('').text(`This File Uploaded: ${sampleFile.name}`);
                      console.log(`Line 139---->** These Files Uploaded: ${sampleFile.name}`);
                    }
                  }).then((res) => {
                    console.log('Line 142 -------> upload.js checking res.files', res.files);
                    if (res.files) {
                      window.location.replace('/profile');
                    }
                  });
              } catch (err) {
                console.log('*** Nothing Uploaded *** :', err);
              }
            } else {
              console.log('Nothing Uploaded yet!');
              $('#upload-err-msg').empty('').text('Nothing to Uploaded chosen yet!');
            }
          } else {
            console.log('**-->Please fill out entire form**');
            $('#upload-err-msg').empty('').text('**Please fill out entire form**');
          }
        }
      } else {
        console.log('**Please fill out entire form!!**');
        $('#upload-err-msg').empty('').text('**Please fill out entire form!!**');
        $('#FileAction-modal').modal('open').html(
          `<div class='modal-content'>
          <h4>File Activity</h4>
          <h4 class='center-align'>Error!</h4>
          <h5 class='center-align'><b>Please fill out the Whole form to upload a file.</b></h5>
          </div>
          <div class="modal-footer">
          <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
          </div>
          </div>`,
        );
      }
    }
  });

  // --------------------- Approve Artwork Button --------------------- //
  $('#startGal').on('click', '.approve', function () {
    $('.modal').modal();
    console.log('Approve Clicked!');
    console.log('id to Approve: ', this.id);
    const { id } = this;
    const splitId = id.split('-');
    const approveindex = splitId[1];
    try {
      $.ajax({
        type: 'post',
        url: '/approve',
        data: { _id: approveindex },
        success(status, res) {
          console.log('status: ', status.art_name_input);
          $('#upload-err-msg').empty('').text(`** Success! ${status.art_name_input} Approved for Gallery! **`);
          $('#FileAction-modal').modal('open').html(
            `<div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Success!</h4>
            <h5 class='center-align'><b>The File ${status.art_name_input} was Approved!</b></h5>
            </div>
            <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-small">Close</a>
            </div>
            </div>`,
          );
        },
        error(status, error) {
          console.log('Line 205===-------->>>In ERROR: ', status);
          $('#upload-err-msg').empty('').text(`**${status}: Something Broke-->${error}**`);
          $('#FileAction-modal').modal('open').html(
            `<div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Error!</h4>
            <h5 class='center-align'><b>The File ${status.art_name_input} was NOT Approved!</b></h5>
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
          console.log('Success res: ', res);
        });
    } catch (err) {
      console.log(`Something went wrong ${err}`);
      $('#err-msg').empty('').text('**images not Approved.**');
    }
    // $(`#resp-${approveindex}`).load();  <----TODO next
    $('.displayUserArt').click();
  });

  // --------------------- Delete Artwork Button --------------------- //
  $('#startGal').on('click', '.remove', function () {
    console.log('Delete Clicked!');
    console.log('id to remove: ', this.id);
    const { id } = this;
    const splitId = id.split('-');
    const deleteindex = splitId[1];
    try {
      $.ajax({
        type: 'post',
        url: '/delete',
        data: { _id: deleteindex },
        success(status, res) {
          console.log('status: ', status.art_name_input);
          $('#upload-err-msg').empty('').text(`** Success! ${status.art_name_input} removed from database! **`);
          $('#FileAction-modal').modal('open').html(
            `<div class='modal-content'>
            <h4>File Activity</h4>
            <h4 class='center-align'>Success!</h4>
            <h5 class='center-align'><b>The File ${status.art_name_input} was removed from the database!</b></h5>
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
            <h5 class='center-align'><b>The File ${status.art_name_input} was NOT removed from the database!</b></h5>
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
          console.log('Success res: ', res);
        });
    } catch (err) {
      console.log(`Something went wrong ${err}`);
      $('#err-msg').empty('').text('**images not Deleted.**');
    }
    $(`#resp-${deleteindex}`).remove();
    $('.displayUserArt').click();
  });

  // --------------------- Render files in upload directories --------------------- //
  // const divimg = document.getElementById('image');
  $('.displayUserArt').one('click', (event) => {
    $('.modal').modal();
    console.log('line 232 event: ', event);
    const items = [];
    try {
      $.ajax({
        type: 'get',
        url: '/get-imgs',
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
            const apprBut = $('<a class="btn btn-small teal darken-4 waves-effect waves-light hoverable approve value="Approve"><i class="material-icons right">done</i>Approve</a>');
            const delBut = $('<a class="btn btn-small red darken-4 waves-effect waves-light hoverable remove" value="Delete"><i class="material-icons right">delete</i>Delete</a>');
            if (!res[i].artId || res[i].artId === undefined) {
              respdiv = $('<div>')
                .addClass('responsive')
                .attr('id', `resp-${res[count - 1].artId}`)
                .prependTo('#startGal');
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
              $(`<div><b>Price: $</b> ${res[count - 1].artPrice}</div>`).appendTo(picrow);
              $(`<div><b>Height:</b> ${res[count - 1].artHeight} <b>in Width:</b> ${res[count - 1].artWidth} <b>in</b></div>`).appendTo(picrow);
              if (res[count - 1].artDepth > 0) {
                $(`<div><b>Depth:</b> ${res[count - 1].artDepth}<b>in</div>`).appendTo(picrow);
              }
              $(`<div><b>Approved:</b> ${res[count - 1].artApproved}</div>`).appendTo(picrow);
              if (res[count - 1].artReviewer === 'admin' && res[count - 1].artApproved === false) {
                $(apprBut).attr('id', `approv-${res[count - 1].artId}`);
                $(picrow).append(apprBut);
              }
              $(delBut).attr('id', `del-${res[count - 1].artId}`);
              $(picrow).append(delBut);
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
  });
});
