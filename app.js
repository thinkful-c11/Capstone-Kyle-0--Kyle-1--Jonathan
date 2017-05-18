/* global google
  global $
  global navigator
*/
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////        appState + helper functions ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
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

//Convert Kelvin to Farenheit
function KtoF(temp) {
  return (9/5*(temp - 273) + 32);
}

/////////////////////////////////////////////////////////////////////
//////////////   State modification functions   //////////////////////
////////////////////////////////////////////////////////////////////

//Set map to google maps
function setMap(map, state) {
  state.map = map;
  return state.map;
}

//set Lat and Lng
function setLatLng(pos, state) {
  const yourLoc = state.yourLoc;
  yourLoc.lat = pos.lat;
  yourLoc.lng = pos.lng;
  return state.yourLoc;
}
//Set Marker Lat and Lng
function setMarkerLatLng(data,state){
    const markerLoc = appState.markerLocation;
    markerLoc.lat = data.latLng.lat();
    markerLoc.lng = data.latLng.lng();
    return markerLoc;
}

//make a marker every time u click
function makeMarker(state) {
  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
    title: 'Hello World!'
  }));
}

//clear the marker from the map
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
          <p>Temp: ${Math.floor(KtoF(state.dailyForcast.main.temp)*100)/100} Farenheit</p>
          <p>Pressure: ${state.dailyForcast.main.pressure}</p>
          <p>Humidity: ${state.dailyForcast.main.humidity}</p>
          <p>Wind Speed: ${state.dailyForcast.wind.speed}</p>
          <p>Wind Degrees: ${state.dailyForcast.wind.degrees}</p>
          <p>Clouds: ${state.dailyForcast.clouds.all}</p>`);
}


//////////////////////////////////////////////////////////////
///////////          CALLBACK FUNCTIONS        /////////////
///////////////////////////////////////////////////////////

//openweather
const addWeatherToState = function(state, response) {
  const daily = state.dailyForcast;
  if (response.weather) {
    daily.weather.main = response.weather[0].main;
    daily.weather.description = response.weather[0].description;

    daily.main.temp = response.main.temp;
    daily.main.pressure = response.main.pressure;
    daily.main.humidity = response.main.humidity;

    daily.wind.speed = response.wind.speed;
    daily.wind.degrees = response.wind.deg;

    daily.clouds.all = response.clouds.all;

    daily.sys.country = response.sys.country;

    daily.cityName = response.name;
    renderWeather(state, $('.weather-information'));
  }
}

//Google
function callbackGoogle(response){
    clearMarker(appState);
    setMarkerLatLng(response,appState);
    makeMarker(appState);
    queryOpenWeather(appState);
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
  
  //clicking on google maps
  google.maps.event.addDomListener(map, 'click', callbackGoogle);

}


//Get your Coordinates
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
