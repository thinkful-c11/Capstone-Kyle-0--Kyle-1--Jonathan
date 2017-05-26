///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////        appState + helper functions ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
/*global google */
'use strict';

const appState = {
  dayOfWeek: null,
  yourLoc: {},
  map: null,
  marker: [],
  markerLocation: {
    lat: null,
    lng: null
  },
  dailyForecast: {
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
  tommorrowForecast: {
    city: {
      name: null,
      country: null,
    },
    list: [],
  },
  highestTemp: Number.NEGATIVE_INFINITY,
  lowestTemp: Number.POSITIVE_INFINITY,
  dayAfterForecast: {
    city: {
      name: null,
      country: null,
    },
    list: [],
  },
};

//Convert Kelvin to Farenheit
function KtoF(temp) {
  return ((9 / 5 * (temp - 273) + 32) * 100) / 100;
}

//Display the direction wind is blowing
function windDirection(deg) {
  let direction = 'North';
  switch (deg) {
  case 0:
    direction = 'North';
    break;
  case 90:
    direction = 'East';
    break;
  case 180:
    direction = 'South';
    break;
  case 270:
    direction = 'West';
    break;
  default:
    if (deg > 0 && deg < 90) direction = 'NorthEast';
    else if (deg > 90 && deg < 180) direction = 'SouthEast';
    else if (deg > 180 && deg < 270) direction = 'SouthWest';
    else direction = 'NorthWest';
  }
  return direction;
}
//Getting tommorrow
function getNewDay1(response) {
  const d = new Date();
  const arr = response.list.filter(el => grabDateFromString(el.dt_txt) === `${d.getDate() +1}`);
  return arr;
}
//Getting Day After
function getNewDay2(response) {
  const d = new Date();
  const arr = response.list.filter(el => grabDateFromString(el.dt_txt) === `${d.getDate() +2}`);
  return arr;
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
function setMarkerLatLng(data, state) {
  const markerLoc = state.markerLocation;
  markerLoc.lat = data.latLng.lat();
  markerLoc.lng = data.latLng.lng();
  return markerLoc;
}

//make a marker every time u click
function makeMarker(state) {

  state.marker.push(new google.maps.Marker({
    position: state.markerLocation,
    map: state.map,
  }));
}

//clear the marker from the map
function clearMarker(state) {
  state.marker.map(el => el.setMap(null));
}

//date stuff
function grabDateFromString(str) {
  return str.substring(8, 10);
}

//highest temperature object
function highTemp(fun, state) {
  const newDayList = fun;
  const highestTempArr = newDayList.filter(el => el.main.temp_max === max(el.main.temp_max, state));
  return highestTempArr[highestTempArr.length - 1];
}
//lowest temperature object
function lowTemp(fun, state) {
  const newDayList = fun;
  const lowestTempArr = newDayList.filter(el => el.main.temp_min === min(el.main.temp_min, state));
  return lowestTempArr[lowestTempArr.length - 1];
}

//set the max temperature
function max(temp, state) {
  if (temp > state.highestTemp) {
    state.highestTemp = temp;
  }
  return state.highestTemp;
}

//set min temperature
function min(temp, state) {
  if (temp < state.lowestTemp) {
    state.lowestTemp = temp;
  }
  return state.lowestTemp;
}
//adding the low temp and high temp obj to state
function addLowHighObj(response, state, forecast, fun) {
  forecast.list.push(highTemp(fun, state));
  forecast.list.push(lowTemp(fun, state));
  return forecast.list;
}
//reset highest and lowest temp
function resetHLTemp(state) {
  state.highestTemp = Number.NEGATIVE_INFINITY;
  state.lowestTemp = Number.POSITIVE_INFINITY;
}
//reset list
function resetHLList(forecast) {
  forecast.list = [];
  return forecast.list.length;
}

function setCountryCity(state, response) {
  state.tommorrowForecast.city.country = response.city.country;
  state.tommorrowForecast.city.name = response.city.name;
  state.dayAfterForecast.city.country = response.city.country;
  state.dayAfterForecast.city.name = response.city.name;
}


/////////////////////////////////////////////////////////////////////
//////////////     OpenWeather          //////////////////////
////////////////////////////////////////////////////////////////////

function queryOpenWeather(state) {
  const parameters = {
    lat: state.markerLocation.lat || state.yourLoc.lat,
    lon: state.markerLocation.lng || state.yourLoc.lng,
  };

  $.getJSON('http://api.openweathermap.org/data/2.5/weather?APPID=4902823442c59be1e82130ed0fb15339', parameters, response => {
    addDailyWeatherToState(state, response);
  });
  $.getJSON('http://api.openweathermap.org/data/2.5/forecast?APPID=4902823442c59be1e82130ed0fb15339', parameters, response => {
    resetHLTemp(state);
    resetHLList(state.tommorrowForecast);
    resetHLList(state.dayAfterForecast);
    setCountryCity(state, response);
    addLowHighObj(response, state, state.tommorrowForecast, getNewDay1(response));
    resetHLTemp(state);
    addLowHighObj(response, state, state.dayAfterForecast, getNewDay2(response));
  });
}

function queryOpenWeatherZip(state, code) {
  const parameters = {
    zip: code
  };

  $.getJSON('http://api.openweathermap.org/data/2.5/weather?APPID=4902823442c59be1e82130ed0fb15339', parameters)
    .done(response => {
      addDailyWeatherToState(state, response);

      clearMarker(state);
      makeMarker(state);
    });

  $.getJSON('http://api.openweathermap.org/data/2.5/forecast?APPID=4902823442c59be1e82130ed0fb15339', parameters)
    .done(response => {
      resetHLTemp(state);
      resetHLList(state.tommorrowForecast);
      resetHLList(state.dayAfterForecast);
      setCountryCity(state, response);
      addLowHighObj(response, state, state.tommorrowForecast, getNewDay1(response));
      resetHLTemp(state);
      addLowHighObj(response, state, state.dayAfterForecast, getNewDay2(response));
    })
    .fail(() => {
      alert('That zip code does not exist.');
    });

}

/////////////////////////////////////////////////////////////////////
//////////////     Render functions          //////////////////////
////////////////////////////////////////////////////////////////////

const renderDailyWeather = function(state, element) {
  const daily = state.dailyForecast;
  element.html(`<p class="city-name">${daily.cityName}, ${daily.sys.country}</p>
          <img src="http://openweathermap.org/img/w/${daily.weather.icon}.png"/>
          <p class="description">${daily.weather.description.charAt(0).toUpperCase() + daily.weather.description.slice(1)}</p>
          <p>${Math.floor(KtoF(daily.main.temp))} &deg;F</p>
          <p>${daily.main.pressure} mbar</p>
          <p>${daily.main.humidity}% humidity</p>
          <p>Wind is blowing at ${daily.wind.speed} meter/sec to the ${windDirection(daily.wind.degrees)}.</p>
          <p>${daily.clouds.all}% cloudy</p>`);
};

const renderForecast = function(state, element) {
  const weather = state.list[0];
  element.html(`<p class="city-name">${state.city.name}, ${state.city.country}</p>
          <img src="http://openweathermap.org/img/w/${weather.weather[0].icon}.png"/>
          <p>${weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}</p>
          <p>${Math.floor(KtoF(weather.main.temp))} &deg;F</p>
          <p>${weather.main.pressure} mbar</p>
          <p>${weather.main.humidity}% humidity</p>
          <p>Wind is blowing ${weather.wind.speed} meter/sec to the ${windDirection(weather.wind.degrees)}.</p>
          <p>${weather.clouds.all}% cloudy</p>`);
};

//////////////////////////////////////////////////////////////
///////////          CALLBACK FUNCTIONS        /////////////
///////////////////////////////////////////////////////////

//openweather current weather
const addDailyWeatherToState = function(state, response) {
  const daily = state.dailyForecast;
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

    if (response.coord) {
      state.markerLocation.lat = response.coord.lat;
      state.markerLocation.lng = response.coord.lon;

    }
    renderDailyWeather(state, $('.weather-information'));
  }
};

//Google
function callbackGoogle(response) {
  if (response !== null) { // if not initial query
    clearMarker(appState);
    setMarkerLatLng(response, appState);
    makeMarker(appState);
  }
  queryOpenWeather(appState);
}

const eventListeners = function(state) {

  const weatherInformation = $('.weather-information');

  $('#zip-code-search').submit(function(event) {
    event.preventDefault();
    queryOpenWeatherZip(state, $('.zip-code-submit').val());
  });

  $('#current').click(() => {
    renderDailyWeather(state, weatherInformation);
  });

  $('#tommorrow').click(() => {
    renderForecast(state.tommorrowForecast, weatherInformation);
  });

  $('#day-after').click(() => {
    renderForecast(state.dayAfterForecast, weatherInformation);
  });
};

// TO FIX
// $().ready(function() {
//   setDaysOfWeek();
// })

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

      callbackGoogle(null);
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
