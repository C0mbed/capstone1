'use strict';

function watchForm() {
    console.log('WatchForm run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      console.log('User entered zip', searchTerm);
    });
  }

  $(watchForm);