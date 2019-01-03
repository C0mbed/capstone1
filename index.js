'use strict';

const geoOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function getGeoSuccess(pos) {
    console.log(pos);
    const crd = pos.coords;
    console.log('Current position: ', crd);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function watchIcon() {
    console.log('watchIcon run');
    $('#location_arrow').click(event => {
        event.preventDefault();
        navigator.geolocation.getCurrentPosition(getGeoSuccess, error, geoOptions);
        console.log('getGeoPos Called');
    });
}

function watchForm() {
    console.log('WatchForm run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      console.log('User entered zip', searchTerm);
    });
  }

  $(watchForm);
  $(watchIcon);