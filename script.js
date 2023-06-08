'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// DOM Variables
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

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
    const map = L.map('map').setView(coords, 16);
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
  },
  // Callback Error
  function () {
    alert('Location Access Denied');
  }
);
