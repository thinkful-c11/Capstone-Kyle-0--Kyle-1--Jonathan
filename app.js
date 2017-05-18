/* global google 
  global $
  global navigator
*/
const appState={
    yourLoc: {},
    map:null,
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
function setMap(map,state){
    state.map = map;
}

//set Lat and Lng
function setLatLng(pos, state){
    state.yourLoc.lat = pos.lat;
    state.yourLoc.lng = pos.lng;
}

/////////////////////////////////////////////////////////////////////
//////////////     OpenWeather          //////////////////////
////////////////////////////////////////////////////////////////////

function queryOpenWeather() {
  const parameters = {
    lat: appState.markerLocation.lat,
    lon: appState.markerLocation.lng,
  };
  
  $.getJSON('https://api.openweathermap.org/data/2.5/weather?APPID=4902823442c59be1e82130ed0fb15339', parameters, response => {
    console.log(response);
  });
}




/////////////////////////////////////////////////////////////////////
//////////////     Render functions          //////////////////////
////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////
///////////          CALLBACK FUNCTIONS        /////////////
///////////////////////////////////////////////////////////


$(function(){

})


//////////////////////////////////////////////////////////////
///////////          Google Stuff              /////////////
///////////////////////////////////////////////////////////

//Google Maps Javascript API
function initMap() {
  var uluru = {lat: -25.363, lng: 131.044};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru,
  });

  setMap(map,appState);
  const infoWindow = new google.maps.InfoWindow;
  getYourCoords(infoWindow, appState);
  google.maps.event.addDomListener(map, 'click', function(response) {
    appState.markerLocation.lat = response.latLng.lat();
    appState.markerLocation.lng = response.latLng.lng();
    queryOpenWeather();
  });
}
function getYourCoords(infoWindow,state){
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

