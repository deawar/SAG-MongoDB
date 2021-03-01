$(document).ready(() => {
  $('.modal').modal();
  $('#fileUpload').on('click', (event) => {
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    // });
    // $('#fileUpload').on('change', function (event) {
    event.preventDefault();
    let newArtwork = new FormData();
    console.log('====================================');
    console.log('Upload Clicked!');
    console.log('====================================');
    $('#upload-carousel').carousel();
    // eslint-disable-next-line no-undef
    console.log('Line 15 upload.js');
    const sampleFile = $('#sampleFile').get(0).files;
    console.log('sampleFile: ', sampleFile);
    // FormData.append('file', $('#sampleFile').Filelist[0]file, sampleFile.name);
    console.log('====================================');
    console.log('sampleFile: ', sampleFile);
    if ($('#artist-email-input').length && $('#artist-email-input').val().length
      && $('#art-name-input').length && $('#art-name-input').val().length
      && $('#medium-input').length && $('#medium-input').val().length
      && $('#description-input').length && $('#description-input').val().length
      && $('#h-size-input').length && $('#h-size-input').val().length
      && $('#w-size-input').length && $('#w-size-input').val().length
      && $('#price-input').length && $('#price-input').val().length
      && $('#sampleFile').length && $('#sampleFile').val().length) {
      newArtwork = {
        email: $('#artist-email-input').val().trim(),
        artwork_name: $('#art-name-input').val().trim(),
        medium: $('#medium-input').val().trim(),
        description: $('#description-input').val().trim(),
        height: $('#h-size-input').val().trim(),
        width: $('#w-size-input').val().trim(),
        price: $('#price-input').val().trim(),
        file: $('#sampleFile').val(),
      };
      console.log('Artwork form: ', newArtwork);
      if (sampleFile.length > 0) {
        // let newArkwork = new FormData();
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < sampleFile.length; i++) {
          let file = sampleFile[i];
          console.log('====================================');
          console.log('file.name: ', file.name);
          console.log('====================================');
          file = $('#sampleFile').prop('files')[0];
        }
        FormData.append('files', sampleFile, sampleFile.name);
        console.log('sampleFile[0]: ', sampleFile[0]);
        let tmppath = URL.createObjectURL(sampleFile[0]);
        // newArkwork.append('file', $('#sampleFile'), tmppath);
        console.log('image value: ', newArtwork.file);
        $('#upload-err-msg').empty('');
        console.log('formData: ', newArtwork);
        newArtwork.append('files', sampleFile[0].file, sampleFile.name);
        if (newArtwork.email.length > 0 && newArtwork.artwork_name.length > 0
        && newArtwork.medium.length > 0 && newArtwork.description.length > 0
        && newArtwork.height.length > 0 && newArtwork.width.length > 0
        && newArtwork.price > 0) {
        // console.log('files to upload: ', res.sampleFile);
        // const fileUpload = req.file.path;
          if (newArtwork !== '') {
            try {
              $.ajax({
                type: 'post',
                url: '/upload',
                data: newArtwork,
                processData: false,
                contentType: false,
                // eslint-disable-next-line object-shorthand
                error: function (xhr, status, error) {
                  alert(error);
                },
                success(response) {
                  alert(response);
                },
                xhr() {
                  const xhr = new XMLHttpRequest();

                  // listen for the progress events
                  xhr.upload.addEventListener('progress', (evt) => {
                    if (evt.lengthComputable) {
                    // calculate the percentage of upload completed
                      let percentComplete = evt.loaded / evt.total;
                      percentComplete = parseInt(percentComplete * 100, 10);

                      // update the Bootstrap progress bar with the new percentage
                      $('.progress-bar').text(`${percentComplete}%`);
                      $('.progress-bar').width(`${percentComplete}%`);

                      // once the upload reaches 100%, set the progress bar text to done
                      if (percentComplete === 100) {
                        $('.progress-bar').html('Done');
                      }
                    }
                  }, false);

                  return xhr;
                },

              }).then((res) => {
                console.log(newArtwork.image);
                if (newArtwork.image !== undefined) {
                  window.location.replace('/profile');
                } else {
                  $('#art-upload').empty('').text(`These Files Uploaded: ${newArtwork.image.name}`);
                  console.log(`** These Files Uploaded: ${newArtwork.image.name}`);
                }
              }).then((res) => {
                console.log('Line 20 upload.js checking res.files', res.files);
                if (res.files) {
                  window.location.replace('/profile');
                }
              });
            } catch (err) {
              console.log('*** Nothing Uploaded *** :', err);
            }
          } else {
            console.log('Nothing Uploaded yet!');
            $('#art-upload').empty('').text('Nothing to Uploaded chosen yet!');
          }
        } else {
          console.log('**Please fill out entire form**');
          $('#upload-err-msg').empty('').text('**Please fill out entire form**');
        }
      }
    } else {
      console.log('**Please fill out entire form**');
      $('#upload-err-msg').empty('').text('**Please fill out entire form**');
    }
  });
  // });
});
