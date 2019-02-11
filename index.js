'use strict';

let currentLoc = {
  lat: 39.6061444,
  long: -106.3549717
};

var currentWeather;
var geocoder;
var map;
var infowindow;
var weather;

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

function findCurrentWeather(currentLoc) {
  openWeatherCall(currentLoc).then(currentWeather =>{
      if (currentWeather) {
          console.log('currentWeather in findCurrentWeather ', currentWeather);
          displayWeather(currentWeather);
      }
  });
}

function formatTemp(temp) {
  const tempF = `${Math.round(temp-273.15)}C`;
  return tempF;
}

function setWeather(res) {
    if (res) {
        weather = res;
        displayWeather(weather);
    } else {
        $('#results_view').empty();
        $('#results_view').text(`Something went wrong: ${err.message}`);
    }

}

function openWeatherCall(currentLoc) {

  const openOptions = {
    key: '0901146c0bfaac7c82fb3660c772b2ed',
    latitude: currentLoc.lat,
    longitude: currentLoc.long
  };

  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${openOptions.latitude}&lon=${openOptions.longitude}&APPID=${openOptions.key}`;
  console.log('the url is ', url);

  if (currentLoc) {
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
}

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
    } else {
      const noResorts = `No Ski Resorts within 50km.`
      $('#results_view_list').append(noResorts);
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
  console.log(results);
  const disallowedArray = ['restaurant', 'lodging', 'clothing_store', 'travel_agency', 'real_estate_agency'];
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

function determineIcon(conditions) {
  const formattedConditions = conditions.toLowerCase();
  const conditionObject = {
    clouds: 'fa-cloud',
    clear: 'fa-sun',
    rain: 'fa-cloud-rain',
    snow: 'fa-snowflake',
    fog: 'fa-fog'
  };

  if (conditionObject[formattedConditions]) {
      return conditionObject[formattedConditions];
  }
  const weatherKeys = Object.keys(conditionObject);
}

function displaySearchResult(result) {
  console.log(result);
  const resultLi = `<li class="result_li">${result.name}</li>`
    console.log(resultLi);
    $('#results_view_list').append(resultLi);
}

function displayWeather(weather) {
  const conditions = weather.list[0].weather[0].main;
  const forecastDescription = weather.list[0].weather[0].description;

  const icon = determineIcon(conditions);
  const tempInKelvin =  weather.list[0].main.temp;
  const tempInF = formatTemp(tempInKelvin);

  $('#icon').addClass(icon);
  $('#temp').text(tempInF);
  $('#weather_desc').text(forecastDescription);

}

function watchButton() {
    //console.log('WatchButton run');
    $('#submit_button').click(event => {
      event.preventDefault();
      console.log('button submitted');
      const searchTerm = $('#js-search-form').val();
      //initMap(searchTerm);
      let title = `<h3>Showing Ski Areas Within 50km of ${searchTerm}</h3>`;
      $('#results_title').removeClass('hidden');
      $('#resort_view').removeClass('hidden');
      $('#results_title').empty();
      $('#results_title').append(title);
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

function closeModal() {
  $(document).click(event => {
    event.preventDefault();
    $('#new_modal').addClass('hidden');
  });
}

function initiateModal() {
  const popUp = `<div id="modal-content">
                    <h2 id='modal_title'>GoPow</h2>
                    <p>Welcome! GoPow is a simple web application to help you locate all ski resorts within 50 kilometers of your current location, and provide you with current weather conditions within that 50km radius.  To start enter the closest ski resort in the field above the map.  You can use a name, an address, or a postal code to search.</p>
                    <p id='lets_go'>Let's Go!  Click anywhere on the page to close this box!</p>
                    </div>`
  $('#new_modal').append(popUp);
  closeModal();
  $('#new_modal').removeClass('hidden');
}

$(document).ready(function(){
    watchButton();
    //watchIcon();
    handleKeypress();
    initiateModal();
});
