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

function initialize() {
  var address = (document.getElementById('js-search-form'));
  var autocomplete = new google.maps.places.Autocomplete(address);
  autocomplete.setTypes(['geocode']);
  console.log('The address is ', autocomplete);

  $('input').click

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      console.log('keypress engaged');
      if (!place.geometry) {
        console.log('keypress engaged');
          return;
      }
  var address = '';
  if (place.address_components) {
      address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
  console.log(address);
  }
});
}

function codeAddress() {
  geocoder = new google.maps.Geocoder();
  var address = document.getElementById("js-search-form").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        currentLoc.lat = results[0].geometry.location.lat();
        currentLoc.long = results[0].geometry.location.lng();
        initMap();
    }
    else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function initMap(q) {
    var pos = new google.maps.LatLng(currentLoc.lat, currentLoc.long);

    initialize();

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
    const filteredResults = filterResults(results);
    $('#results_view_list').empty();
    console.log(filteredResults);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < filteredResults.length; i++) {
        createMarker(filteredResults[i]);
        displaySearchResult(filteredResults[i]);
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

function filterResults(results) {
  const disallowedArray = ['restaurant', 'store', 'clothing_store', 'travel_agency', 'real_estate_agency'];
   return results.filter(result => {
    let end = true;
    disallowedArray.forEach(type => {
      if(result.types.includes(type)) {
        end = false;
      }
    })
    return end;
  })
}

function displaySearchResult(result) {
    let newResult = `<li>${result.name}</li>`;
    $('#results_view_list').append(newResult)
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

function watchIcon() {
    //console.log('watchIcon run');
    $('#location_arrow').click(event => {
        event.preventDefault();
        initMap();
        console.log('getGeoPos Called');
    });
}

function watchButton() {
    //console.log('WatchButton run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      console.log(searchTerm);
      //initMap(searchTerm);
      codeAddress();
    });
  }

function handleKeypress() {
  $('#js-search-form').keypress(event => {
    console.log('keypress engaged');
    if (event.keyCode == 13) {
      event.preventDefault();
      console.log('keypress engaged');
      $('#submit_button').click();
    }
  });
}

function reload() {
    watchButton();
    watchIcon();
    handleKeypress();
}

$(document).ready(function(){
    watchButton();
    watchIcon();
    handleKeypress();
});
