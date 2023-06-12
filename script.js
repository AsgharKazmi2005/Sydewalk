'use strict';

// prettier-ignore

// DOM Variables
const form = document.querySelector('.form');
const containerEvents = document.querySelector('.event');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCost = document.querySelector('.form__input--cost');
const inputCalories = document.querySelector('.form__input--calories');
const sortDivider = document.querySelector('.sort__divider');
const showSortBtns = document.querySelector('.show__sort__btns');
const validationMsg = document.querySelector('.validation__msg');
const clearAllBtn = document.querySelector('.clr__all__btn');
const sortContainer = document.querySelector('.sort__buttons__container');

let map, mapEvent;

//Create a class that will be the parent of Shopping and Excercising
class Event {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _createDesc() {
    //prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    console.log(this);
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

//Child Class
class Shopping extends Event {
  type = 'shopping';
  constructor(coords, distance, duration, cost) {
    super(coords, distance, duration);
    this.cost = cost;
    this.calcCostPerHour;
    this._createDesc();
  }

  calcCostPerHour() {
    this.costph = this.cost / (this.duration / 60);
    return this.costph;
  }
}

// Child Class
class Excercising extends Event {
  type = 'excercising';
  constructor(coords, distance, duration, calories) {
    super(coords, distance, duration);
    this.calories = calories;
    this.calcCalPerHour;
    this._createDesc();
  }

  calcCalPerHour() {
    this.calph = this.calories / (this.duration / 60);
    return this.calph;
  }
}

// Create a class that holds and executes the functions of our app
class App {
  // Private Variables
  #map;
  #mapEvent;
  #markers = [];
  #zoom = 15;
  #events = [];

  constructor() {
    // ask user for location permission
    this._getPosition();
    // Get data from Local Storage
    this._getLocalStorage();
    // User clicks enter after creating an event, use .bind() to make this point to the instance
    form.addEventListener('submit', this._newEvent.bind(this));
    // Swap Cost and Calories fields when user switches from shopping to excercising
    inputType.addEventListener('change', this._toggleField);
    // If an element on the list is clicked, pan to that popup
    // containerEvents.addEventListener('click', this._moveToPopup.bind(this));
    // Display buttons
    showSortBtns.addEventListener('click', this._toggleSortBtns.bind(this));
    //Sort event listener
    sortContainer.addEventListener('click', this._sortAndRender.bind(this));
    //Clear event listener
    clearAllBtn.addEventListener('click', this._showDeleteMsg);
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
    this.#map = L.map('map').setView(coords, this.#zoom);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('Your approximate location')
      .openPopup();

    // Configure Map Clicks by adding event listener (.on()), use .bind to bind this to the instance
    this.#map.on('click', this._showForm.bind(this));

    // Loop over and render each event from the Local Storage
    this.#events.forEach(e => {
      // Re-render Markers
      this._renderMarker(e);
    });
  }
  // Display the event form once user clicks
  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // Hide the form after user submits
  _hideForm() {
    //Clear input fields
    inputDistance.value =
      inputCalories.value =
      inputDuration.value =
      inputCost.value =
        '';
    form.classList.add('hidden');
  }

  // Swap Cost and Calories fields when user switches from shopping to excercising
  _toggleField() {
    inputCalories.closest('.form__row').classList.toggle('form__row--hidden');
    inputCost.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // Create a new marker
  _newEvent(e) {
    const guardClauseNum = (...inputs) =>
      inputs.every(input => Number.isFinite(input));

    const positive = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    // Store Data
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let event;
    // Filter between shopping and excercising, check validity of data, and create a new object

    // Shopping
    if (type === 'shopping') {
      const cost = +inputCost.value;
      // Guard Clause
      if (
        !guardClauseNum(distance, duration, cost) ||
        !positive(distance, duration, cost)
      )
        return alert('Inputs must be Positive, please check your inputs.');

      // Create Object
      event = new Shopping([lat, lng], distance, duration, cost);
    }

    // Excercising
    if (type === 'excercising') {
      const calories = +inputCalories.value;
      if (
        !guardClauseNum(distance, duration, calories) ||
        !positive(distance, duration, calories)
      )
        return alert('Inputs must be Positive, please check your inputs.');

      // Create Object
      event = new Excercising([lat, lng], distance, duration, calories);
    }

    // Add Event to Array
    this.#events.push(event);

    //Add Marker
    this._renderMarker(event);

    // Add Event
    this._renderEvent(event);

    //Hide Form
    this._hideForm();

    //Add events to local storage
    this._setLocalStorage();
  }

  // Render Marker onto map
  _renderMarker(event) {
    // Display Marker
    L.marker(event.coords)
      .addTo(this.#map)
      .bindPopup(
        // Configure settings for marker pop-up
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${event.type}-popup`,
        })
      )
      .setPopupContent(
        `${event.type === 'shopping' ? '🛒' : '🏃‍♂️'} ${event.description}`
      )
      .openPopup();
  }

  // Render event onto UI List
  _renderEvent(event) {
    // Add metrics to an HTML String
    let html = `         
    <li class="workout event--${event.type}" data-id="${event.id}">
      <h2 class="workout__title">${event.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          event.type === 'shopping' ? '🛒' : '🏃‍♂️'
        }</span>
        <span class="workout__value">${event.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${event.duration}</span>
       <span class="workout__unit">min</span>
      </div>`;

    // If shopping, add shopping metrics to the list
    console.log(event);
    if (event.type === 'shopping') {
      html += `          
      <div class="workout__details">
        <span class="workout__icon">💵</span>
        <span class="workout__value">${event.cost}</span>
        <span class="workout__unit">usd</span>
      </div>
     <div class="workout__details">
        <span class="workout__icon">💰</span>
        <span class="workout__value">${event
          .calcCostPerHour()
          .toFixed(2)}</span>
        <span class="workout__unit">$/hr</span>
      </div>
      <button class="remove__btn">×</button>
    </li>`;
    }

    // If excercising, add the excercising metrics to the list
    if (event.type === 'excercising') {
      html += `          
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${event.calories}</span>
        <span class="workout__unit">cal</span>
     </div>
      <div class="workout__details">
        <span class="workout__icon">🏋️‍♂️</span>
        <span class="workout__value">${event.calcCalPerHour().toFixed(2)}</span>
        <span class="workout__unit">cal/hr</span>
      </div>
      <button class="remove__btn">×</button>
    </li>`;
    }

    // Append to the end
    form.insertAdjacentHTML('afterend', html);
  }

  // Pan to Popup when UI List Element is clicked
  // _moveToPopup(e) {
  //   // Recieve the porent element of the list item
  //   const eventEl = e.target.closest('.event');
  //   // Guard Clause
  //   if (!eventEl) return;

  //   //use .find() to return the marker with the same id
  //   const event = this.#events.find(event => event.id === eventEl.dataset.id);

  //   // Pan UI to the marker using leaflet library tools
  //   this.#map.setView(event.coords, this.#zoom + 1, {
  //     animate: true,
  //     pan: {
  //       duration: 1.5,
  //     },
  //   });
  // }

  // Save the events into the local storage
  _setLocalStorage() {
    localStorage.setItem('events', JSON.stringify(this.#events));
  }

  //Retrieve the events from local storage
  _getLocalStorage() {
    // Recieve parsed data
    const data = JSON.parse(localStorage.getItem('events'));
    // Guard Clause
    if (!data) return;

    // Put local storage into the events array
    this.#events = data;

    // Loop over and render each event
    this.#events.forEach(e => {
      // Re-attach Prototype
      e.__proto__ =
        e.type === 'shopping' ? Shopping.prototype : Excercising.prototype;
      // Re-render event
      this._renderEvent(e);
    });
  }

  //Delete all events
  reset() {
    localStorage.removeItem('events');
    location.reload;
  }

  //Sets marker into view
  _setIntoView(foundWorkout) {
    this.#map.setView(foundWorkout.coords, 13);
  }
  // Helper Sort function
  _sortArray(array, currentDirection, type) {
    // sort opposite to the currentDirection
    if (currentDirection === 'ascending') {
      array.sort(function (a, b) {
        return b[type] - a[type];
      });
    }
    if (currentDirection === 'descending') {
      array.sort(function (a, b) {
        return a[type] - b[type];
      });
    }
  }
  // Sort Array and Render it to UI
  _sortAndRender(e) {
    const element = e.target.closest('.sort__button');
    let currentDirection = 'descending'; //default
    if (!element) return;
    const arrow = element.querySelector('.arrow');
    const type = element.dataset.type;

    // Set all arrows to default state (down)
    sortContainer
      .querySelectorAll('.arrow')
      .forEach(e => e.classList.remove('arrow__up'));

    // Get sort direction
    const typeValues = this.#events.map(workout => {
      return workout[type];
    });
    const sortedAscending = typeValues
      .slice()
      .sort(function (a, b) {
        return a - b;
      })
      .join('');
    const sortedDescending = typeValues
      .slice()
      .sort(function (a, b) {
        return b - a;
      })
      .join('');

    // Compare sortedAscending array with values from #event array to check how are they sorted
    // Ascending
    if (typeValues.join('') === sortedAscending) {
      currentDirection = 'ascending';

      arrow.classList.add('arrow__up');
    }
    // Descending
    if (typeValues.join('') === sortedDescending) {
      currentDirection = 'descending';

      arrow.classList.remove('arrow__up');
    }

    // Sort main event array
    this._sortArray(this.#events, currentDirection, type);

    // Clear rendered event from DOM
    containerEvents
      .querySelectorAll('.workout')
      .forEach(event => event.remove());
    // Clear events from map
    this.#markers.forEach(marker => marker.remove());
    //Clear array
    this.#markers = [];
    // Render list all again sorted
    this.#events.forEach(event => {
      this._renderEvent(event);
      // Create new markers and render them on map
      this._renderMarker(event);
    });
    // Center map on the last item in array
    const lastEvent = this.#events[this.#events.length - 1];
    this._setIntoView(lastEvent);
  }
  // Toggle Sort Buttons
  _toggleSortBtns() {
    sortContainer.classList.toggle('zero__height');
  }
  // Display Delete Msg as Modal
  _showDeleteMsg() {
    confMsg.classList.remove('msg__hidden');
  }
  // Clear all events
  _clearAll() {
    localStorage.clear();
    location.reload();
    confMsg.classList.add('msg__hidden');
  }
}

// Create an instance for our application
const app = new App();

// workout
