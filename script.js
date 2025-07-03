const apiKey = '6254f3be9069456ac369bf50ca4b06f3';

async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  showSpinner(true);
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) throw new Error("City not found");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayWeather(currentData);
    displayForecast(forecastData.list);
    displayHourly(forecastData.list);
    updateBackground(currentData.weather[0].main.toLowerCase());
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    showSpinner(false);
  }
}

function displayWeather(data) {
  const weather = data.weather[0].main.toLowerCase();
  document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('temp').textContent = `Temperature: ${data.main.temp}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('weatherIconText').innerHTML = getEmojiIcon(weather);
  document.getElementById('weatherResult').classList.remove('hidden');
}

function displayForecast(list) {
  const forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = '';

  const daily = list.filter((_, idx) => idx % 8 === 0);
  daily.forEach(entry => {
    const weather = entry.weather[0].main.toLowerCase();
    const date = new Date(entry.dt_txt);
    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
      <div>${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
      <div>${getEmojiIcon(weather)}</div>
      <div>${Math.round(entry.main.temp)}°C</div>
    `;
    forecastContainer.appendChild(item);
  });
}

function displayHourly(list) {
  const hourlyContainer = document.getElementById('hourly');
  hourlyContainer.innerHTML = '';

  const next12Hours = list.slice(0, 4);
  next12Hours.forEach(entry => {
    const weather = entry.weather[0].main.toLowerCase();
    const date = new Date(entry.dt_txt);
    const item = document.createElement('div');
    item.className = 'hourly-item';
    item.innerHTML = `
      <div>${date.getHours()}:00</div>
      <div>${getEmojiIcon(weather)}</div>
      <div>${Math.round(entry.main.temp)}°C</div>
    `;
    hourlyContainer.appendChild(item);
  });
}

function updateBackground(weather) {
  document.body.classList.remove(
    'weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-mist'
  );

  if (weather.includes('clear')) document.body.classList.add('weather-clear');
  else if (weather.includes('cloud')) document.body.classList.add('weather-clouds');
  else if (weather.includes('rain') || weather.includes('drizzle') || weather.includes('thunderstorm')) document.body.classList.add('weather-rain');
  else if (weather.includes('snow')) document.body.classList.add('weather-snow');
  else if (weather.includes('mist') || weather.includes('fog') || weather.includes('haze')) document.body.classList.add('weather-mist');
}

function getEmojiIcon(weather) {
  if (weather.includes('clear')) return '☀️';
  if (weather.includes('cloud')) return '☁️';
  if (weather.includes('rain')) return '🌧️';
  if (weather.includes('drizzle')) return '🌦️';
  if (weather.includes('thunderstorm')) return '⛈️';
  if (weather.includes('snow')) return '❄️';
  if (weather.includes('mist') || weather.includes('fog') || weather.includes('haze')) return '🌫️';
  return '🌡️';
}

function showSpinner(show) {
  document.getElementById('spinner').classList.toggle('hidden', !show);
  document.getElementById('weatherResult').classList.toggle('hidden', show);
}

const toggleBtn = document.getElementById('toggleModeBtn');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

window.onload = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        console.warn("Geolocation denied or unavailable.");
      }
    );
  }
};

async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    showSpinner(true);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location weather unavailable");
    const data = await response.json();
    displayWeather(data);
    updateBackground(data.weather[0].main.toLowerCase());
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    showSpinner(false);
  }
}
