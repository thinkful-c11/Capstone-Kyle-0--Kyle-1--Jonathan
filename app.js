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
      icon: null,
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
  return ((9/5*(temp - 273) + 32)*100)/100;
}

//Display the direction wind is blowing
function windDirection(deg){
  let direction = "North";
  switch(deg){
    case 0:
      direction = "North";
      break;
    case 90:
      direction = "East";
      break;
    case 180:
      direction = "South";
      break;
    case 270:
      direction = "West";
      break;
    default:
      if(deg>0 && deg < 90) direction="NorthEast";
      else if(deg>90 && deg<180) direction = "SouthEast";
      else if(deg>180 && deg<270) direction = "SouthWest";
      else direction = "NorthWest";
  }
  return direction;
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
    const markerLoc = state.markerLocation;
    markerLoc.lat = data.latLng.lat();
    markerLoc.lng = data.latLng.lng();
    return markerLoc;
}

//make a marker every time u click
function makeMarker(state) {
  console.log("Is zip causing this?");
  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
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

function queryOpenWeatherZip(state, code) {
  const parameters = {
    zip: code
  };

  $.getJSON('http://api.openweathermap.org/data/2.5/weather?APPID=4902823442c59be1e82130ed0fb15339', parameters, response => {

    addWeatherToState(state, response);
    clearMarker(state);
    makeMarker(state);
  });
}
/////////////////////////////////////////////////////////////////////
//////////////     Render functions          //////////////////////
////////////////////////////////////////////////////////////////////

const renderWeather = function(state, element) {
  const daily = state.dailyForcast;
  element.html(`<p>City: ${daily.cityName}</p>
          <p class="country">Country: ${daily.sys.country}</p>
          <p class="description">Description: ${daily.weather.description.charAt(0).toUpperCase() + daily.weather.description.slice(1)} <img src="http://openweathermap.org/img/w/${daily.weather.icon}.png"</p>
          <p>Temp: ${Math.floor(KtoF(daily.main.temp))} Farenheit</p>
          <p>Pressure: ${daily.main.pressure}</p>
          <p>Humidity: ${daily.main.humidity}%</p>
          <p>Wind Speed: ${daily.wind.speed}</p>
          <p>Wind Degrees: ${daily.wind.degrees} ${windDirection(daily.wind.degrees)}</p>
          <p>It will blow at ${daily.wind.speed} meter/sec in ${windDirection(daily.wind.degrees)} direction</p>
          <p>Clouds: ${daily.clouds.all}% cloudy</p>`);
};


//////////////////////////////////////////////////////////////
///////////          CALLBACK FUNCTIONS        /////////////
///////////////////////////////////////////////////////////

//openweather
const addWeatherToState = function(state, response) {
  console.log(response);
  const daily = state.dailyForcast;
  if (response) {
    daily.weather.main = response.weather[0].main;
    daily.weather.description = response.weather[0].description;
    daily.weather.icon = response.weather[0].icon;

    daily.main.temp = response.main.temp;
    daily.main.pressure = response.main.pressure;
    daily.main.humidity = response.main.humidity;

    daily.wind.speed = response.wind.speed;
    daily.wind.degrees = response.wind.deg;

    daily.clouds.all = response.clouds.all;

    daily.sys.country = response.sys.country;

    daily.cityName = response.name;

    if(response.coord) {
      state.markerLocation.lat = response.coord.lat;
      state.markerLocation.long = response.coord.lon;
      console.log(state);
    }
    renderWeather(state, $('.weather-information'));
  }
};

//Google
function callbackGoogle(response){
    clearMarker(appState);
    setMarkerLatLng(response,appState);
    makeMarker(appState);
    queryOpenWeather(appState);
}
const eventListeners = function(state){

  $('#zip-code-search').submit(function(event) {
    event.preventDefault();
    queryOpenWeatherZip(state, $('.zip-code-submit').val());
  });
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
  eventListeners(appState);

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
