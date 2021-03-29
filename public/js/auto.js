document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('school-input');
  function RecieveData() {
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.responseText);
    }
  }

  function getQuery() {
    const query = document.getElementById('school-input').value;
    console.log(query);
    if (query === '') {
      console.log('Search again');
    } else {
      const url = 'autocomplete';
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = RecieveData.readyStateChange;
      xhr.open('GET', url, true);
      xhr.send();
    }
  }

  searchInput.addEventListener('input', getQuery);
});

$(() => {
  $('#school-input').autocomplete({
    source(req, res) {
      $.ajax({
        url: 'autocomplete/',
        dataType: 'jsonp',
        type: 'GET',
        data: req,
        success(data) {
          res(data);
        },
        error(err) {
          console.log(err.status);
        },
      });
    },
    minLength: 1,
    select(event, ui) {
      if (ui.item) {
        $('#school-input').val(ui.item.label);
      }
    },
  });
});
