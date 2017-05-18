const appState={
    yourLoc:{lat: -25.363, lng: 131.044},
    map:null,
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
//   var marker = new google.maps.Marker({
//     position: uluru,
//     map: map
//   });
  setMap(map,appState);
  const infoWindow = new google.maps.InfoWindow;
  getYourCoords(infoWindow, appState);
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
            handleLocationError(true, infoWindow, state.map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, state.map.getCenter());
        }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

