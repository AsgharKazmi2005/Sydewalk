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

// Create a class that will hold all our data and functions
class App {
  // Private Variables
  #map;
  #mapEvent;

  constructor() {
    // ask user for location permission
    this._getPosition();
    // User clicks enter after creating an event, use .bind() to make this point to the instance
    form.addEventListener('submit', this._newEvent.bind(this));
    // Swap Cost and Calories fields when user switches from shopping to excercising
    inputType.addEventListener('change', this._toggleField);
  }

  // Ask the user for location permissions and then perform callback functions
  _getPosition() {
    if (navigator.geolocation)
      //Derive User Location
      navigator.geolocation.getCurrentPosition(
        // Callback, use .bind() to avoid undefined in class functions
        this._loadMap.bind(this),
        // Error Callback
        function () {
          alert('Location Access Denied');
        }
      );
  }
  // Once coordinate location is recieved (user allows permission), load the map
  _loadMap(pos) {
    // Deconstruct longitude and laditude from Geolocation API
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    // Create array for use as argument in the Leaflet API
    const coords = [latitude, longitude];

    // Fetch map for user coordinates from Leaflet via openstreetmap.org
    this.#map = L.map('map').setView(coords, 16);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

    // Configure Map Clicks by adding event listener (.on()), use .bind to bind this to the instance
    this.#map.on('click', this._showForm.bind(this));
  }
  // Display the event form once user clicks
  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // Swap Cost and Calories fields when user switches from shopping to excercising
  _toggleField() {
    inputCalories.closest('.form__row').classList.toggle('form__row--hidden');
    inputCost.closest('.form__row').classList.toggle('form__row--hidden');
  }
  // Create a new marker
  _newEvent(e) {
    e.preventDefault();
    //Clear input fields
    inputDistance.value =
      inputCalories.value =
      inputDuration.value =
      inputCost.value =
        '';
    // Deconstruct latitude/longitude from click event
    const { lat, lng } = this.#mapEvent.latlng;
    // Display Marker
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}

// Create an instance for our application
const app = new App();
