$(document).ready(() => {
  $('.modal').modal();
  $('#fileUpload').on('click', (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-undef
    const newArtwork = {
      email: $('#artist-email-input').val().trim(),
      artwork_name: $('#art-name-input').val().trim(),
      medium: $('#medium-input').val().trim(),
      description: $('#description-input').val().trim(),
      height: $('#h-size-input').val().trim(),
      width: $('#w-size-input').val().trim(),
      image: $('#fileUpload').val(),
    };
    console.log(newArtwork.image);
    $('#err-msg').empty('');

    if (newArtwork.email.length > 0 && newArtwork.artwork_name.length > 0
        && newArtwork.medium.length > 0 && newArtwork.description.length > 0
        && newArtwork.height.length > 0 && newArtwork.width.length > 0) {
      // console.log('files to upload: ', res.sampleFile);
      // const fileUpload = req.file.path;
      if (newArtwork !== '') {
        try {
          $.ajax({
            type: 'post',
            url: 'api/upload',
            data: newArtwork,
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
  });
});
