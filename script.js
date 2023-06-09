'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// DOM Variables
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.event');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCost = document.querySelector('.form__input--cost');
const inputCalories = document.querySelector('.form__input--calories');
let map, mapEvent;

//Derive User Location
navigator.geolocation.getCurrentPosition(
  // Callback
  function (pos) {
    // Deconstruct longitude and laditude from Geolocation API
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    // Create array for use as argument in the Leaflet API
    const coords = [latitude, longitude];

    // Fetch map for user coordinates from Leaflet via openstreetmap.org
    map = L.map('map').setView(coords, 16);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    L.marker(coords)
      .addTo(map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

    // Configure Map Clicks by adding event listener (.on())
    map.on('click', function (event) {
      mapEvent = event;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  },
  // Callback Error
  function () {
    alert('Location Access Denied');
  }
);

// User clicks enter after creating an event
form.addEventListener('submit', function (e) {
  e.preventDefault();
  //Clear input fields
  inputDistance.value =
    inputCalories.value =
    inputDuration.value =
    inputCost.value =
      '';
  // Deconstruct latitude/longitude from click event
  const { lat, lng } = mapEvent.latlng;
  // Display Marker
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      // Configure settings for marker pop-up
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'shopping-popup',
      })
    )
    .setPopupContent('Event')
    .openPopup();
});

// Swap Cost and Calories fields when user switches from shopping to excercising
inputType.addEventListener('change', function () {
  inputCalories.closest('.form__row').classList.toggle('form__row--hidden');
  inputCost.closest('.form__row').classList.toggle('form__row--hidden');
});
