'use strict';

let currentLoc = {
    lat: 39.6061444,
    long: -106.3549717
};

const mapsKey = "AIzaSyAk6cIJCwxIpMhWqBsPB3SUoIYO7dfyueg";

var geocoder;
var map;
var infowindow;
var service;

function codeAddress(q) {
    initMap(q)
    var address = q;
    console.log(address);
    geocoder.geocode( { 'placeId': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}



function initMap(q) {
    var pos = new google.maps.LatLng(currentLoc.lat, currentLoc.long);

    map = new google.maps.Map(document.getElementById('view'), {
      center: pos,
      zoom: 8
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      keyword: `${q} ski`,
      location: {lat: currentLoc.lat, lng: currentLoc.long},
      radius: 50000,
      fields: ['formatted_address', 'geometry', 'name', 'opening_hours', 'photos', 'rating'
    ]}, callback);
  }

  function callback(results, status) {
      console.log(results);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  }

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }

function findLoc() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('my current location ', pos);
          currentLoc.lat = pos.lat;
          currentLoc.long = pos.long;
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
}
//https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=YOUR_API_KEY

/*function initMap() {
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

        currentLoc = pos;

        console.log(pos);

        infoWindow.setPosition(pos);
        infoWindow.setContent('Me');
        infoWindow.open(map);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
    reload();
  }
*/

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'This service requires your location.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

function watchIcon() {
    //console.log('watchIcon run');
    $('#location_arrow').click(event => {
        event.preventDefault();
        initMap();
        console.log('getGeoPos Called');
    });
}

function watchButton(currentLoc) {
    //console.log('WatchButton run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      console.log(searchTerm);
      //initMap(searchTerm);
      codeAddress(searchTerm);
    });
  }

function reload() {
    watchButton(currentLoc);
    watchIcon();
}

$(document).ready(function(){
    watchButton(currentLoc);
    watchIcon();
});
