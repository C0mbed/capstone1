'use strict';

let currentLoc = "";
const mapsKey = "AIzaSyAk6cIJCwxIpMhWqBsPB3SUoIYO7dfyueg";

let map, infoWindow;

function initMap() {
    console.log('init map');
    map = new google.maps.Map(document.getElementById('view'), {
      center: {lat: 50.0591608, lng: -122.9919636},
      zoom: 10
    });
    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log(pos);

        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

function watchIcon() {
    console.log('watchIcon run');
    $('#location_arrow').click(event => {
        event.preventDefault();
        initMap();
        console.log('getGeoPos Called');
    });
}

function watchForm() {
    console.log('WatchForm run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      currentLoc = searchTerm;
      console.log(currentLoc);
      console.log('User entered zip', searchTerm);
    });
  }

  $(watchForm);
  $(watchIcon);