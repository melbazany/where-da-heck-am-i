'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const renderError = function (message) {
    countriesContainer.insertAdjacentText('beforeend', message);
  };
  const renderCountry = function (data, className = '') {
    const html = `
        <article class="country ${className}">
        <img class="country__img" src="${data.flags.svg}" />
        <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
            +data.population / 1000000
            ).toFixed(1)} million people</p>
            <p class="country__row"><span>🗣️</span>${
            Object.values(data.languages)[0]
            }</p>
            <p class="country__row"><span>💰</span>${
            Object.values(data.currencies).at(0).name
            }</p>
        </div>
        </article>`;
  
    countriesContainer.insertAdjacentHTML('beforeEnd', html);
    countriesContainer.style.opacity = 1;
  };
  
  const whereAmI = async function () {
    // Geolocation retrieval
    try {
      const pos = await getPosition();
      const { latitude: lat, longitude: lng } = pos.coords;
  
      // Reverse geocode location
      const resGeo = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
      if (!resGeo.ok) {
        throw new Error('Problem getting location data');
      }
      const dataGeo = await resGeo.json();
  
      // Country data
      const res = await fetch(
        `https://restcountries.com/v3.1/name/${dataGeo.country}`
      );
      if (!res.ok) {
        throw new Error('Problem getting country data');
      }
  
      // Get the JSON data and display on page
      const data = await res.json();
      renderCountry(data[0]);
      return data;

  
    } catch (err) {
      console.log(`${err.message}`);
      renderError(`ERROR: ${err.message}`);
  
      //Reject the 'fulfilled' promise returned from async function MANUALLY
      throw err;
    }
  };
  
  // Pasted from above & rebuilt
  const getPosition = function () {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        function (posObj) {
          resolve(posObj);
        },
        function (err) {
          reject(err);
        }
      );
    });
  };

  const checkForNeighbours = async function(neighbours) {
    for (let neighbour of neighbours) {
      try {
        const neighbourDataRes = await fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`);
        let neighbourData = await neighbourDataRes.json();
        neighbourData = neighbourData[0];
        renderCountry(neighbourData, 'neighbour');
      } catch(err) {
        console.log(`${err.message}`);
      }
    }
  }
  
  
  btn.addEventListener('click', async function() {
      btn.disabled = true;
      const responseData = await whereAmI();
      btn.style.opacity = 0;
      let neighbours = responseData[0].borders;

      if (!neighbours) return;
      checkForNeighbours(neighbours);

  });