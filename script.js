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
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
  },
  // Callback Error
  function () {
    alert('Location Access Denied');
  }
);
