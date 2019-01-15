'use strict';

let currentLoc = {
    lat: 39.6061444,
    long: -106.3549717
};

let currentWeather;

function findCurrentWeather(currentLoc) {
  openWeatherCall(currentLoc).then(currentWeather =>{
    console.log('currentWeather is findCurrentWeather ', currentWeather);
    displayWeather(currentWeather);
  });
}


function yesterdayTimeStamp() {
  let unixStamp = Math.round(((new Date()).getTime() / 1000) - 86400);
  return unixStamp;
}

function displayResults(res) {
  console.log(res);
}


const mapsKey = "AIzaSyAk6cIJCwxIpMhWqBsPB3SUoIYO7dfyueg";

var geocoder;
var map;
var infowindow;
var service;
var weather;

function setWeather(res) {
  weather = res;
  displayWeather(weather);
}

function openWeatherCall(currentLoc) {

  const openOptions = {
    key: '0901146c0bfaac7c82fb3660c772b2ed',
    latitude: currentLoc.lat,
    longitude: currentLoc.long
  };

  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${openOptions.latitude}&lon=${openOptions.longitude}&APPID=${openOptions.key}`;
  console.log('the url is ', url);

  return fetch(url)
    .then(res => {
      console.log('fetch run');
      if (res.ok) {
        return res.json();
      }
      console.log('error');
      throw new Error(response.statusText);
    })
    .then(resJson => setWeather(resJson))
    .catch(err => {
      $('#results_view').empty();
      $('#results_view').text(`Something went wrong: ${err.message}`);
    });
}

/*function codeAddress(q) {
    initMap(q)
    var address = q;
    console.log('This console log is in CodeAddres(q)', address);
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
*/

function initialize() {
  var address = (document.getElementById('js-search-form'));
  var autocomplete = new google.maps.places.Autocomplete(address);
  autocomplete.setTypes(['geocode']);

  $('input').click

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
          return;
      }
  var address = '';
  if (place.address_components) {
      address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
  }
});
}

function codeAddress() {
  console.log('codeAddress the second is being called');
  geocoder = new google.maps.Geocoder();
  var address = document.getElementById("js-search-form").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        currentLoc.lat = results[0].geometry.location.lat();
        currentLoc.long = results[0].geometry.location.lng();
        console.log('currentloc in code address is', currentLoc);
        findCurrentWeather(currentLoc);
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

function generateId(result) {
  let removeSpaces = result.name.split(" ");
  let idName = removeSpaces[0] + "_" + removeSpaces[1];

  return idName;
}

function displaySearchResult(result) {
    let idName = generateId(result);

    const resultDiv = `<div class="result_div" id="${idName}">${result.name}</div>`

    $('#results_view_list').append(resultDiv);

}

function determineIcon(conditions) {
  const conditionArray = {
    clouds: 'fa-cloud',
    clear: 'fa-sun',
    rain: 'fa-cloud-rain',
    snow: 'fa-cloud-snow',
    fog: 'fa-fog'
  };

}

function displayWeather(weather) {
  console.log('the weather in displayWeather is ', weather);
  const conditions = weather.list[0].weather[0].main;
  const forecastDescription = weather.list[0].weather[0].description;

  const icon = determineIcon(conditions);

  $('#icon').addClass(icon);
  $('#weather_results_list').append(conditions);
  $('#weather_results_list').append(forecastDescription);

}

function findLoc() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

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

function watchButton() {
    //console.log('WatchButton run');
    $('#submit_button').click(event => {
      event.preventDefault();
      const searchTerm = $('#js-search-form').val();
      //initMap(searchTerm);
      let title = `<h2>Showing Ski Areas Within 50km of ${searchTerm}</h2>`;
      $('#results_view').empty();
      $('#results_view').append(title);
      codeAddress();
    });
  }

function handleKeypress() {
  $('#js-search-form').keypress(event => {
    if (event.keyCode == 13) {
      event.preventDefault();

      $('#submit_button').click();
    }
  });
}

function reload() {
    watchButton();
    //watchIcon();
    handleKeypress();
}

$(document).ready(function(){
    watchButton();
    //watchIcon();
    handleKeypress();
});
