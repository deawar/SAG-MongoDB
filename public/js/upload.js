function addFile(form, sampleFile, name) {
  const newArtwork = new FormData();
  // newArtwork.append('formvalues', form);
  newArtwork.append('sampleFile', sampleFile[0], name);
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

$(document).ready(() => {
  $('.modal').modal();
  $('#fileUpload').on('click', (event) => {
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    // });
    // $('#fileUpload').on('change', function (event) {
    event.preventDefault();
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
    if ($('#artist_email_input').length && $('#artist_email_input').val().length
      && $('#art_name_input').length && $('#art_name_input').val().length
      && $('#medium_input').length && $('#medium_input').val().length
      && $('#description_input').length && $('#description_input').val().length
      && $('#h_size_input').length && $('#h_size_input').val().length
      && $('#w_size_input').length && $('#w_size_input').val().length
      && $('#price_input').length && $('#price_input').val().length
      && $('#sampleFile').length && $('#sampleFile').val().length) {
      const newArtworkform = {
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
        // let newArkwork = new FormData();
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < sampleFile.length; i++) {
          let file = sampleFile[i];
          let filename = file.name;
          console.log('====================================');
          console.log('file.name: ', filename);
          console.log('====================================');
          file = $('#sampleFile').prop('files')[0];
        }
        console.log('sampleFile[0]: ', sampleFile[0]);
        let tmppath = URL.createObjectURL(sampleFile[0]);
        // newArkwork.append('file', $('#sampleFile'), tmppath);
        console.log('image value path: ', tmppath);
        $('#upload-err-msg').empty('');
        const newArtwork = addFile(newArtworkform, $('#sampleFile').get(0).files, sampleFile.name);
        console.log('formData: ', newArtworkform);
        // newArtwork.append('files', sampleFile[0].file, sampleFile.name);
        if (newArtworkform.email.length > 0 && newArtworkform.artwork_name.length > 0
        && newArtworkform.medium.length > 0 && newArtworkform.description.length > 0
        && newArtworkform.height.length > 0 && newArtworkform.width.length > 0
        && newArtworkform.price.length > 0) {
          console.log('#####===========>is newArtwork null: ', newArtwork);
          // const fileUpload = req.file.path;
          if (newArtwork !== '' || !newArtwork) {
            try {
              $.ajax({
                type: 'post',
                url: '/upload',
                data: newArtwork,
                processData: false,
                contentType: false,
                cache: false,
                // eslint-disable-next-line object-shorthand
                error: function (xhr, status, error) {
                  $('#upload-err-msg').empty('').text(`**${status}: Something Broke-->${error}**`);
                  alert('Umm...something broke...', error);
                },
                success(status, response) {
                  $('#upload-err-msg').empty('').text(`**${status} Success! ${sampleFile[0].name} uploaded! **`);
                  alert('Success! File uploaded!', response);
                },
                xhr() {
                  const xhr = new XMLHttpRequest();

                  // listen for the progress events
                  // xhr.upload.addEventListener('progress', (evt) => {
                  //   if (evt.lengthComputable) {
                  //   // calculate the percentage of upload completed
                  //     let percentComplete = evt.loaded / evt.total;
                  //     percentComplete = parseInt(percentComplete * 100, 10);

                  //     // update the Bootstrap progress bar with the new percentage
                  //     $('.progress-bar').text(`${percentComplete}%`);
                  //     $('.progress-bar').width(`${percentComplete}%`);

                  //     // once the upload reaches 100%, set the progress bar text to done
                  //     if (percentComplete === 100) {
                  //       $('.progress-bar').html('Done');
                  //     }
                  //   }
                  // }, false);

                  return xhr;
                },

              }).then((res) => {
                console.log('Line 129 ================> res: ', res);
                if (newArtwork.image !== undefined) {
                  window.location.replace('/profile');
                } else {
                  $('#art-upload').empty('').text(`This File Uploaded: ${sampleFile.name}`);
                  console.log(`** These Files Uploaded: ${sampleFile.name}`);
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

  // Render files in upload directories
  let divimg = document.getElementById('image');
  try {
    $.ajax({
      type: 'get',
      url: '/get-imgs',
      data: items,

  // });
});
