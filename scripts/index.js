let map;
let markers = [];
let canAddMarker = true;

function initMap() {
   map = new google.maps.Map(document.querySelector('#map'), {
      center: {
         lat: 49.233083,
         lng: 28.4682169
      },
      zoom: 12
   });

   map.addListener('click', function(e) {
      if (!canAddMarker) return;
      canAddMarker = false;

      let lat = e.latLng.lat();
      let lng = e.latLng.lng();

      axios.post(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=be95eef5116cba6e82cb7be224025d7c`)
         .then(function(res) {
            addMarker(res.data);
         });
   });
}

let form = document.querySelector('#place-name');
form.onsubmit = function(e) {
   e.preventDefault();

   if (!canAddMarker) return;
   canAddMarker = false;

   let placeName = this.elements.name.value;
   if (placeName === '') return;
   
   canAddMarker = false;
   axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=be95eef5116cba6e82cb7be224025d7c`)
      .then(res => {
         addMarker(res.data, true);
      })
      .catch(function(err) {
         if (err.response.status === 404) {
            let error = document.createElement('div');
            error.className = 'msg-error-404';
            error.innerHTML = 'Place not found! Please restart this page!';
            form.appendChild(error);
         }
      })
};

function addMarker(obj, moveMap = false) {
   let center = new google.maps.LatLng(obj['coord']['lat'], obj['coord']['lon']);

   if (moveMap) {
      map.panTo(center);
   }
   
   let infowindow = new google.maps.InfoWindow({
      content: `
         <div id="content">
            <div><strong>City</strong>: ${obj.name}</div>
            <div><strong>Country</strong>: ${obj.sys.country}</div>
            <div><strong>Temperature</strong>: ${(obj.main.temp - 273.15).toFixed(0)}&deg;</div>
            <div><strong>Wind speed</strong>: ${obj.wind.speed} meter/sec</div>
         </div>
      `
   });

   let marker = new google.maps.Marker({
      map,
      position: center,
      animation: google.maps.Animation.DROP,
      icon: `./images/${obj.weather[0].icon}.png`
   });

   markers.push(marker);

   marker.addListener('click', function() {
      infowindow.open(map, marker);
   });

   canAddMarker = true;
}