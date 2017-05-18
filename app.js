/* global google
  global $
  global navigator
*/
const appState = {
  yourLoc: {},
  map: null,
  marker: [],
  markerLocation: {
    lat: null,
    long: null
  },
  dailyForcast: {
    weather: {
      main: null,
      description: null,
    },
    main: {
      temp: null,
      pressure: null,
      humidity: null,
    },
    wind: {
      speed: null,
      degrees: null,
    },
    clouds: {
      all: null
    },
    sys: {
      country: null,
    },
    cityName: null,
  },
  fiveDayForcast: {},
  sixteenDayForcast: {},
};

function cleanData(dirtyData) {
  console.log(dirtyData);
}

/////////////////////////////////////////////////////////////////////
//////////////   State modification functions   //////////////////////
////////////////////////////////////////////////////////////////////

//Set map to google maps
function setMap(map, state) {
  state.map = map;
}

//set Lat and Lng
function setLatLng(pos, state) {
  state.yourLoc.lat = pos.lat;
  state.yourLoc.lng = pos.lng;
}

function makeMarker(state) {
  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
    title: 'Hello World!'
  }));
}

function clearMarker(state) {
  state.marker.map(el => el.setMap(null));
}
/////////////////////////////////////////////////////////////////////
//////////////     OpenWeather          //////////////////////
////////////////////////////////////////////////////////////////////

function queryOpenWeather(state) {
  const parameters = {
    lat: state.markerLocation.lat,
    lon: state.markerLocation.lng,
  };

  $.getJSON('http://api.openweathermap.org/data/2.5/weather?APPID=4902823442c59be1e82130ed0fb15339', parameters, response => {

    addWeatherToState(state, response);
  });
}




/////////////////////////////////////////////////////////////////////
//////////////     Render functions          //////////////////////
////////////////////////////////////////////////////////////////////

const renderWeather = function(state, element) {
  element.html(`<p>City: ${state.dailyForcast.cityName}</p>
          <p>Country: ${state.dailyForcast.sys.country}</p>
          <p>Main: ${state.dailyForcast.weather.main}</p>
          <p>Description: ${state.dailyForcast.weather.description.charAt(0).toUpperCase() + state.dailyForcast.weather.description.slice(1)}</p>
          <p>Temp: ${state.dailyForcast.main.temp} Kelvin</p>
          <p>Pressure: ${state.dailyForcast.main.pressure}</p>
          <p>Humidity: ${state.dailyForcast.main.humidity}</p>
          <p>Wind Speed: ${state.dailyForcast.wind.speed}</p>
          <p>Wind Degrees: ${state.dailyForcast.wind.degrees}</p>
          <p>Clouds: ${state.dailyForcast.clouds.all}</p>`);
}


//////////////////////////////////////////////////////////////
///////////          CALLBACK FUNCTIONS        /////////////
///////////////////////////////////////////////////////////


const addWeatherToState = function(state, response) {
  console.log(response);
  if (response.weather) {
    state.dailyForcast.weather.main = response.weather[0].main;
    state.dailyForcast.weather.description = response.weather[0].description;

    state.dailyForcast.main.temp = response.main.temp;
    state.dailyForcast.main.pressure = response.main.pressure;
    state.dailyForcast.main.humidity = response.main.humidity;

    state.dailyForcast.wind.speed = response.wind.speed;
    state.dailyForcast.wind.degrees = response.wind.deg;

    state.dailyForcast.clouds.all = response.clouds.all;

    state.dailyForcast.sys.country = response.sys.country;

    state.dailyForcast.cityName = response.name;
    renderWeather(state, $('.information'));
  }
}

//////////////////////////////////////////////////////////////
///////////          Google Stuff              /////////////
///////////////////////////////////////////////////////////

//Google Maps Javascript API
function initMap() {
  var uluru = {
    lat: -25.363,
    lng: 131.044
  };
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru,
  });


  setMap(map, appState);
  const infoWindow = new google.maps.InfoWindow;
  getYourCoords(infoWindow, appState);

  google.maps.event.addDomListener(map, 'click', function(response) {
    clearMarker(appState);
    appState.markerLocation.lat = response.latLng.lat();
    appState.markerLocation.lng = response.latLng.lng();
    makeMarker(appState);
    queryOpenWeather(appState);
  });

}

function getYourCoords(infoWindow, state) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //modification to state
      setLatLng(pos, state);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(state.map);
      state.map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, state.map);
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, state.map);
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, map) {
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
