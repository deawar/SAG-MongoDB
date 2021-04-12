// Attempt to use dropdown/autocomplete to get school name.
document.addEventListener('DOMContentLoaded', () => {
  function ajaxAutoComplete(options) {
    const defaults = {
      inputId: null,
      ajaxUrl: false,
      data: {},
      minLength: 3,
    };
  
    options = $.extend(defaults, options);
    const $input = $(`#${options.inputId}`);
  
    if (options.ajaxUrl) {
      const $autocomplete = $('<ul id="ac" class="autocomplete-content dropdown-content"'
                  + 'style="position:absolute"></ul>');
      const $inputDiv = $input.closest('.input-field');
      let request;
      let runningRequest = false;
      let timeout;
      let liSelected;
  
      if ($inputDiv.length) {
        $inputDiv.append($autocomplete); // Set ul in body
      } else {
        $input.after($autocomplete);
      }
  
      const highlight = function (string, match) {
        const matchStart = string.toLowerCase().indexOf(`${match.toLowerCase()}`);
        const matchEnd = matchStart + match.length - 1;
        const beforeMatch = string.slice(0, matchStart);
        const matchText = string.slice(matchStart, matchEnd + 1);
        const afterMatch = string.slice(matchEnd + 1);
        string = `<span>${beforeMatch}<span class='highlight'>${
          matchText}</span>${afterMatch}</span>`;
        return string;
      };
  
      $autocomplete.on('click', 'li', function () {
        $input.val($(this).text().trim());
        $autocomplete.empty();
      });
  
      $input.on('keyup', (e) => {
        if (timeout) { // comment to remove timeout
          clearTimeout(timeout);
        }
  
        if (runningRequest) {
          request.abort();
        }
  
        if (e.which === 13) { // select element with enter key
          liSelected[0].click();
          return;
        }
  
        // scroll ul with arrow keys
        if (e.which === 40) { // down arrow
          if (liSelected) {
            liSelected.removeClass('selected');
            next = liSelected.next();
            if (next.length > 0) {
              liSelected = next.addClass('selected');
            } else {
              liSelected = $autocomplete.find('li').eq(0).addClass('selected');
            }
          } else {
            liSelected = $autocomplete.find('li').eq(0).addClass('selected');
          }
          return; // stop new AJAX call
        } if (e.which === 38) { // up arrow
          if (liSelected) {
            liSelected.removeClass('selected');
            next = liSelected.prev();
            if (next.length > 0) {
              liSelected = next.addClass('selected');
            } else {
              liSelected = $autocomplete.find('li').last().addClass('selected');
            }
          } else {
            liSelected = $autocomplete.find('li').last().addClass('selected');
          }
          return;
        }
  
        // escape these keys
        if (e.which === 9 // tab
                      || e.which === 16 // shift
                      || e.which === 17 // ctrl
                      || e.which === 18 // alt
                      || e.which === 20 // caps lock
                      || e.which === 35 // end
                      || e.which === 36 // home
                      || e.which === 37 // left arrow
                      || e.which === 39) { // right arrow
          return;
        } if (e.which === 27) { // Esc. Close ul
          $autocomplete.empty();
          return;
        }
  
        const val = $input.val().toLowerCase();
        $autocomplete.empty();
  
        if (val.length > options.minLength) {
          timeout = setTimeout(() => { // comment this line to remove timeout
            runningRequest = true;
  
            request = $.ajax({
              type: 'GET',
              url: options.ajaxUrl + val,
              success(data) {
                if (!$.isEmptyObject(data)) { // (or other) check for empty result
                  let appendList = '';
                  for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                      let li = '';
                      if (data[key]) { // if image exists as in official docs
                        li += `<li><img src="${data[key]}" class="left">`;
                        li += `<span>${highlight(key, val)}</span></li>`;
                      } else {
                        li += `<li><span>${highlight(key, val)}</span></li>`;
                      }
                      appendList += li;
                    }
                  }
                  $autocomplete.append(appendList);
                } else {
                  $autocomplete.append($('<li>No matches</li>'));
                }
              },
              complete() {
                runningRequest = false;
              },
            });
          }, 250); // comment this line to remove timeout
        }
      });
  
      $(document).click((event) => { // close ul if clicked outside
        if (!$(event.target).closest($autocomplete).length) {
          $autocomplete.empty();
        }
      });
    }
  }
  // capture input from school-inputB field
  const searchInput = document.getElementById('school-inputB');
  function RecieveData() {
    if (this.readyState === 4 && this.status === 200) {
      console.log(this.responseText);
      ajaxAutoComplete({ inputId: 'school-inputB', ajaxUrl: 'autocomplete/' });
    }
  }
});
