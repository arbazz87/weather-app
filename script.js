const apiKey = "2ad32b27d2088448619f214990426659"; // Replace with your OpenWeatherMap API key

const datetimeEl = document.getElementById("datetime");
const inputEl = document.getElementById("city-input");
const suggestionsEl = document.getElementById("suggestions");
const citySubmitBtn = document.getElementById("city-submit");

const weatherCard = document.getElementById("weather-card");
const locationEl = document.getElementById("location");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const humidityEl = document.getElementById("humidity");
const localTimeEl = document.getElementById("local-time");
const forecastContainer = document.getElementById("forecast");

function updateTime() {
  const now = new Date();
  datetimeEl.textContent = now.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }); 
}
setInterval(updateTime, 1000);
updateTime();

// City search suggestions using Geocoding API
inputEl.addEventListener("input", () => {
  const query = inputEl.value.trim();
  if (query.length < 2) {
    suggestionsEl.style.display = "none";
    return;
  }

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      suggestionsEl.innerHTML = "";
      if (data.length === 0) {
        suggestionsEl.style.display = "none";
        return;
      }
      data.forEach(place => {
        const li = document.createElement("li");
        li.textContent = `${place.name}, ${place.country}`;
        li.addEventListener("click", () => {
          inputEl.value = `${place.name}`;
          suggestionsEl.style.display = "none";
          getWeather(place.lat, place.lon, place.name, place.country);
        });
        suggestionsEl.appendChild(li);
      });
      suggestionsEl.style.display = "block";
    });
});

citySubmitBtn.addEventListener("click", () => {
  const city = inputEl.value.trim();
  if (!city) return;

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert("City not found!");
        return;
      }
      const loc = data[0];
      getWeather(loc.lat, loc.lon, loc.name, loc.country);
    });
});

function getWeather(lat, lon, cityName, countryCode) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      weatherCard.classList.remove("hidden");
      locationEl.textContent = `${cityName}, ${countryCode}`;
      iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      tempEl.textContent = `${Math.round(data.main.temp)}°C`;
      descEl.textContent = data.weather[0].description;
      humidityEl.textContent = `Humidity: ${data.main.humidity}%`;

      const timezoneOffset = data.timezone;
      const cityTime = new Date(Date.now() + timezoneOffset * 1000);
      localTimeEl.textContent = `Local Time: ${cityTime.toUTCString().slice(17, 25)}`;
    });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const forecast = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecast[date]) forecast[date] = [];
        forecast[date].push(item);
      });

      forecastContainer.innerHTML = "";
      Object.keys(forecast).slice(0, 5).forEach(date => {
        const dayData = forecast[date];
        const temps = dayData.map(d => d.main.temp);
        const icon = dayData[4].weather[0].icon;
        const dayEl = document.createElement("div");
        dayEl.classList.add("forecast-day");
        dayEl.innerHTML = `
          <h4>${new Date(date).toDateString().slice(0, 10)}</h4>
          <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
          <p>${Math.round(Math.min(...temps))}°C - ${Math.round(Math.max(...temps))}°C</p>
        `;
        forecastContainer.appendChild(dayEl);
      });
    });
}
