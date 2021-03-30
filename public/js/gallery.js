$(document).ready(() => {
  $('.materialboxed').materialbox();

  // Populate Gallery with approved artwork
  // $('.displayUserArt').one('click', (event) => {
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
          const bidBut = $('<a class="btn btn-small red darken-4 waves-effect waves-light hoverable remove" value="Bid"><i class="material-icons right">gavel</i>Bid</a>');
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
            $(`<div>Title: ${res[count - 1].artName}</div>`).appendTo(picrow);
            $(`<div>Artist: ${res[count - 1].artistFirstName} ${res[count - 1].artistLastName}</div>`).appendTo(picrow);
            $(`<div> ${res[count - 1].artDesc}</div>`).appendTo(picrow);
            $(`<div>Price: $ ${res[count - 1].artPrice}</div>`).appendTo(picrow);
            $(`<div>Height: ${res[count - 1].artHeight} in Width: ${res[count - 1].artWidth} in</div>`).appendTo(picrow);
            if (res[count - 1].artDepth > 0) {
              $(`<div>Depth: ${res[count - 1].artDepth}in</div>`).appendTo(picrow);
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
});
