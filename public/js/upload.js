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
  $('.materialboxed').materialbox();
  $('#fileUpload').on('click', (event) => {
    // $('.progress-bar').text('0%');
    // $('.progress-bar').width('0%');
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
          const filename = file.name;
          console.log('====================================');
          console.log('file.name: ', filename);
          console.log('====================================');
          file = $('#sampleFile').prop('files')[0];
        }
        console.log('sampleFile[0]: ', sampleFile[0]);
        const tmppath = URL.createObjectURL(sampleFile[0]);
        // newArkwork.append('file', $('#sampleFile'), tmppath);
        console.log('image value path: ', tmppath);
        $('#upload-err-msg').empty('');
        $('#art-upload').empty('');
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
                success(status, response) {
                  console.log('status: ', status.art_name_input);
                  $('#upload-err-msg').empty('').text(`**${status} Success! ${sampleFile[0].name} uploaded! **`);
                  $('#FileAction-modal').modal('open');
                  // alert('Success! File uploaded!', response);
                },
                error(status, error) {
                  // $.each(xhr, (key, value) => {
                  //   alert(key + ": " + value);
                  // });
                  $('#upload-err-msg').empty('').text(`**${status}: Something Broke-->${error}**`);
                  alert('Umm...something broke...', error);
                },
              }).then((res) => {
                console.log('Line 133 ================> res: ', res);
                if (newArtwork.image !== undefined) {
                  console.log('Line 135 in .then(res)');
                  window.location.replace('/profile');
                } else {
                  $('#upload-err-msg').empty('').text(`This File Uploaded: ${sampleFile.name}`);
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

  // Delete artwork Button
  $('#startGal').on('click', '.remove', function () {
    console.log('Delete Clicked!');
    console.log('id to remove: ', this.id);
    const { id } = this;
    const split_id = id.split('-');
    const deleteindex = split_id[1];
    try {
      $.ajax({
        type: 'post',
        url: '/delete',
        data: { _id: deleteindex },
        success(status, response) {
          console.log('status: ', status.art_name_input);
          $('#upload-err-msg').empty('').text(`** Success! ${status.art_name_input} removed from database! **`);
          $('#FileAction-modal').modal('open');
          //alert('Success! File removed!', response);
        },
        error(status, error) {
          // $.each(xhr, (key, value) => {
          //   alert(key + ": " + value);
          // });
          $('#upload-err-msg').empty('').text(`**${status}: Something Broke-->${error}**`);
          alert('Umm...something broke...', error);
        },
      })
        .then((res) => {
        });
    } catch (err) {
      console.log(`Something went wrong ${err}`);
      $('#err-msg').empty('').text('**images not Deleted.**');
    }
    $(`#resp-${deleteindex}`).remove();
  });

  // Render files in upload directories
  // const divimg = document.getElementById('image');
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
            console.log('trying to add Title Div to <img>: ', res[count].artName);
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
            $(`<div>Title: ${res[count - 1].artName}</div>`).appendTo(picrow);
            $(`<div>Artist Email: ${res[count - 1].artistEmail}</div>`).appendTo(picrow);
            $(`<div> ${res[count - 1].artDesc}</div>`).appendTo(picrow);
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
        // const li = $('<li/>')
        // .text(res[i])
        // .appendTo(cpics);
        // eslint-disable-next-line no-plusplus
      });
  } catch (err) {
    console.log(`Something went wrong ${err}`);
    $('#err-msg').empty('').text('**images not found.**');
  }
});
