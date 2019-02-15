'use strict';

let currentLoc = {
  lat: 39.6061444,
  long: -106.3549717
};

//global variables used by google to display the map + weather
var currentWeather;
var geocoder;
var map;
var infowindow;
var weather;

//Loads a lightbox/modal when the page first loads to explain the function. 
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

//The following functions initiate the API calls to openWeather and Google. 

//This is the api call for Open Weather.
function getOpenWeatherData(currentLoc) {

  const openOptions = {
    key: '0901146c0bfaac7c82fb3660c772b2ed',
    latitude: currentLoc.lat,
    longitude: currentLoc.long
  };

  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${openOptions.latitude}&lon=${openOptions.longitude}&APPID=${openOptions.key}`;

  if (currentLoc) {
      return fetch(url)
          .then(res => {
              if (res.ok) {
                  return res.json();
              }
              throw new Error(response.statusText);
          })
          .then(resJson => setWeather(resJson))
          .catch(err => {
              $('#results_view').empty();
              $('#results_view').text(`Something went wrong: ${err.message}`);
          });
  }
}

//This function is called on page load, and initializes the places API and map.  
function initializeMapFromPlaces() {
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

//This is a function that turns a text based address search into lat/long for use with the places API. 
function codeAddress() {
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

//This function takes a key word input into the form along with the current lat long and places it on the map. 
function initMap(q) {
    var pos = new google.maps.LatLng(currentLoc.lat, currentLoc.long);

    initializeMapFromPlaces();

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
    ]}, handlePlacesApiResults);
  }

  //This is the result from the API call above and it is used to create markers on the screen, and to display the results. 
  function handlePlacesApiResults(results, status) {
    const filteredResults = filterResults(results);
    $('#results_view_list').empty();
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < filteredResults.length; i++) {
        createMarker(filteredResults[i]);
        displayPlacesSearchResult(filteredResults[i]);
      }
    } else {
      const noResorts = `No Ski Resorts within 50km.`
      $('#results_view_list').append(noResorts);
    }
  }

  //This is a places API function that creates the markers on the map. 
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

//The following functions control filtering and formatting the data prior to being displayed.

  //This function takes the results from google places API and filters out unwanted categories.
function filterResults(results) {
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

//This converts the temperature from the openWeather api from Kelvin into Celsius.
function formatTemp(temp) {
  const tempC = `${Math.round(temp-273.15)}C`;
  return tempC;
}

//This function determines which weather icon needs to be displayed.  
function determineWeatherIcon(conditions) {
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

//The following functions control the display of the results to the result view. 

//This function appends the #results_view_list to add li items as the filtered search results.
function displayPlacesSearchResult(result) {
  const resultLi = `<li class="result_li">${result.name}</li>`
    $('#results_view_list').append(resultLi);
}

//This function handles calling the openWeatherApi and the display weather function if there is a current location for the user. 
function findCurrentWeather(currentLoc) {
  getOpenWeatherData(currentLoc).then(currentWeather =>{
      if (currentWeather) {
          displayWeather(currentWeather);
      }
  });
}

//This function handles calling the display of the weather, and if there is an error it displays the error text instead.
function setWeather(res) {
  if (res) {
      weather = res;
      displayWeather(weather);
  } else {
      $('#results_view').empty();
      $('#results_view').text(`Something went wrong: ${err.message}`);
  }
}

//This function takes the results of the Open Weather call and displays it in the results view. 
function displayWeather(weather) {
  const conditions = weather.list[0].weather[0].main;
  const forecastDescription = weather.list[0].weather[0].description;

  const icon = determineWeatherIcon(conditions);
  const tempInKelvin =  weather.list[0].main.temp;
  const tempInF = formatTemp(tempInKelvin);

  $('#icon').addClass(icon);
  $('#temp').text(tempInF);
  $('#weather_desc').text(forecastDescription);

}

//The following functions are used as event listeners to control the closing of the modal, and triggering input/form submission. 

//This function watches for a button click on the 'GOPOW' button and triggers the input submit event. 
function watchButton() {
    //console.log('WatchButton run');
    $('#submit_button').click(event => {
      event.preventDefault();
      $('#results_view_list').removeClass('hidden');
      const searchTerm = $('#js-search-form').val();
      if (searchTerm) {
          let title = `<h3>Ski Areas Within 50km:</h3>`;
          $('#results_title').removeClass('hidden');
          $('#resort_view').removeClass('hidden');
          $('#results_title').empty();
          $('#results_title').append(title);
        codeAddress();
      } else {
        alert("You must enter a search term");
      }
      
    });
  }

//This function handles a keypress when the user puts info into the input field.  Hitting 'enter' triggers the submit button function. 
function handleKeypress() {
  $('#js-search-form').keypress(event => {
    if (event.keyCode == 13) {
      event.preventDefault();

      $('#submit_button').click();
    }
  });
}

//This controls how the modal is closed to continue to the main page.
function closeModal() {
  $(document).click(event => {
    event.preventDefault();
    $('#new_modal').addClass('hidden');
  });
}

function touchToCloseModal() {
  $(document).click(event => {
    event.preventDefault();
    $('#new_modal').addClass('hidden');
  })
}

$(document).ready(function(){
    watchButton();
    //watchIcon();
    handleKeypress();
    initiateModal();
});
