/**
 * The JavaScript code fetches weather data using the OpenWeatherMap API, displays current weather and
 * forecast, updates weather charts, and includes a placeholder chatbot functionality.
 * @param city - The JavaScript code you provided is a weather application that fetches weather data
 * using the OpenWeatherMap API. It includes functions to display current weather, forecast, update
 * weather charts, and a placeholder chatbot functionality.
 */
const GEMINI_API_KEY = 'AIzaSyCcy75e0DdUTXy4IdpB33wYPtIP2zQZjeo';
const API_KEY = "7f409fd818d39e848367459b5c58147b";
let forecastData = [];
let currentPage = 1;
const itemsPerPage = 10;
let tempBarChartInstance;
let weatherDoughnutChartInstance;
let tempLineChartInstance;

function fetchWeather(city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
    method: "GET",
    success: function (data) {
      updateCurrentWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    },
    error: function () {
      alert("City not found. Please try again.");
    },
  });
}
// Initial fetch for a default city
fetchWeather("Lahore");
function fetchForecast(lat, lon) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
    method: "GET",
    success: function (data) {
      forecastData = data.list;
      updateForecastTable();
      updateCharts();
    },
    error: function () {
      alert("Failed to fetch forecast data.");
    },
  });
}

function updateForecastTable() {
  const tableBody = $("#forecast-table tbody");
  tableBody.empty();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = forecastData.slice(startIndex, endIndex);

  pageData.forEach((item) => {
    const row = `<tr>
            <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
            <td>${Math.round(item.main.temp)}°C</td>
            <td>${item.weather[0].description}</td>
        </tr>`;
    tableBody.append(row);
  });

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(forecastData.length / itemsPerPage);
  const paginationElement = $("#pagination");
  paginationElement.empty();

  for (let i = 1; i <= totalPages; i++) {
    const button = `<button onclick="changePage(${i})">${i}</button>`;
    paginationElement.append(button);
  }
}

function changePage(page) {
  currentPage = page;
  updateForecastTable();
}

function updateCharts() {
  updateTemperatureBarChart();
  updateWeatherDoughnutChart();
  updateTemperatureLineChart();
}
function updateTemperatureBarChart() {
  const ctx = document.getElementById("tempBarChart").getContext("2d");
  const dailyTemps = forecastData
    .filter((item, index) => index % 8 === 0)
    .slice(0, 5);

  // Destroy existing chart instance if it exists
  if (tempBarChartInstance) {
    tempBarChartInstance.destroy();
  }

  tempBarChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dailyTemps.map((item) =>
        new Date(item.dt * 1000).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Temperature (°C)",
          data: dailyTemps.map((item) => Math.round(item.main.temp)),
          backgroundColor: "rgba(52, 152, 219, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        delay: 500,
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

function updateWeatherDoughnutChart() {
  const ctx = document.getElementById("weatherDoughnutChart").getContext("2d");
  const weatherCounts = {};
  forecastData.forEach((item) => {
    const weather = item.weather[0].main;
    weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
  });

  // Destroy existing chart instance if it exists
  if (weatherDoughnutChartInstance) {
    weatherDoughnutChartInstance.destroy();
  }

  weatherDoughnutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(weatherCounts),
      datasets: [
        {
          data: Object.values(weatherCounts),
          backgroundColor: [
            "rgba(52, 152, 219, 0.6)",
            "rgba(46, 204, 113, 0.6)",
            "rgba(155, 89, 182, 0.6)",
            "rgba(241, 196, 15, 0.6)",
            "rgba(231, 76, 60, 0.6)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        delay: 500,
      },
    },
  });
}

function updateTemperatureLineChart() {
  const ctx = document.getElementById("tempLineChart").getContext("2d");
  const dailyTemps = forecastData
    .filter((item, index) => index % 8 === 0)
    .slice(0, 5);

  // Destroy existing chart instance if it exists
  if (tempLineChartInstance) {
    tempLineChartInstance.destroy();
  }

  tempLineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyTemps.map((item) =>
        new Date(item.dt * 1000).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Temperature (°C)",
          data: dailyTemps.map((item) => Math.round(item.main.temp)),
          borderColor: "rgba(52, 152, 219, 1)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 2000,
        easing: "easeOutBounce",
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
function updateCurrentWeather(data) {
  $("#city").text(data.name);
  $("#temperature").text(`${Math.round(data.main.temp)}°C`);
  $("#weather-description").text(data.weather[0].description);
  updateWeatherBackground(data.weather[0].main);
}

function updateWeatherBackground(weatherCondition) {
  const widget = document.getElementById("weather-widget");
  let color;
  switch (weatherCondition.toLowerCase()) {
    case "clear":
      color = "#4a90e2";
      break;
    case "clouds":
      color = "#54717a";
      break;
    case "rain":
      color = "#57575d";
      break;
    default:
      color = "#3498db";
  }
  widget.style.backgroundColor = color;
}

$("#search-btn").click(function () {
  const city = $("#city-input").val();
  if (city.trim() !== "") {
    fetchWeather(city);
  }
});

function toggleDropdown(event) {
  var dropdown = document.getElementById("filterDropdown");
  if (dropdown.classList.contains("show")) {
    dropdown.classList.remove("show");
  } else {
    dropdown.classList.add("show");
  }
}
// Placeholder functions for filter actions
function showTemperaturesAscending() {
  const sortedData = [...forecastData].sort(
    (a, b) => a.main.temp - b.main.temp
  );
  updateForecastTableWithData(sortedData);
}

function showTemperaturesDescending() {
  const sortedData = [...forecastData].sort(
    (a, b) => b.main.temp - a.main.temp
  );
  updateForecastTableWithData(sortedData);
}

function filterRainyDays() {
  const filteredData = forecastData.filter((item) =>
    item.weather[0].main.toLowerCase().includes("rain")
  );
  updateForecastTableWithData(filteredData);
}

function showHighestTemperature() {
  const highestTempEntry = forecastData.reduce(
    (max, item) => (item.main.temp > max.main.temp ? item : max),
    forecastData[0]
  );
  updateForecastTableWithData([highestTempEntry]);
}

/**
 * Updates the forecast table with the provided weather data.
 *
 * @param {Array} data - An array of weather forecast objects. Each object should contain
 *                       a timestamp (dt), main temperature (main.temp), and weather description (weather[0].description).
 */
function updateForecastTableWithData(data) {
  const tableBody = $("#forecast-table tbody");
  tableBody.empty();

  data.forEach((item) => {
    const row = `<tr>
          <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
          <td>${Math.round(item.main.temp)}°C</td>
          <td>${item.weather[0].description}</td>
      </tr>`;
    tableBody.append(row);
  });
}
const $chatbotWidget = $('#chatbot-widget');
const $chatbotToggle = $('#chatbot-toggle');
const $chatbotContent = $('#chatbot-content');
const $chatbotForm = $('#chatbot-form');
const $chatbotInput = $('#chatbot-input');
const $chatbotMessages = $('#chatbot-messages');

let isOpen = false;

$chatbotToggle.on('click', function () {
  isOpen = !isOpen;
  $chatbotWidget.toggleClass('open', isOpen);
  if (isOpen) {
    $chatbotContent.show();
    $chatbotToggle.hide();
    $chatbotInput.focus();
  } else {
    $chatbotContent.hide();
    $chatbotToggle.show();
  }
});
$('#chatbot-close').on('click', function () {
  isOpen = false;
  $chatbotWidget.removeClass('open');
  $chatbotToggle.show();
  $chatbotContent.hide();
});

$chatbotForm.on('submit', function (e) {
  e.preventDefault();
  const userMessage = $chatbotInput.val().trim();
  if (userMessage === '') return;

  addMessageToChatbot('user', userMessage);
  $chatbotInput.val('');

  if (userMessage.toLowerCase().includes('weather')) {
    handleWeatherQuery(userMessage);
  } else {
    handleGeneralQuery(userMessage);
  }
});

function handleWeatherQuery(userMessage) {
  const city = extractCityFromMessage(userMessage);
  console.log(city);
  if (city) {
    fetchweather(city);
  } else {
    addMessageToChatbot('bot', 'Please specify a city to get the weather information.');
  }
}
function extractCityFromMessage(message) {
  const lowerCaseMessage = message.toLowerCase();
  const regex = /in\s+([a-zA-Z\s]+)/;
  const match = lowerCaseMessage.match(regex);
  return match ? match[1].trim() : null;
}

function handleGeneralQuery(userMessage) {
  $.ajax({
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      contents: [{
        parts: [{
          text: userMessage
        }]
      }]
    }),
    success: function (response) {
      if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0]) {
        addMessageToChatbot('bot', response.candidates[0].content.parts[0].text);
      } else {
        addMessageToChtbot('bot', 'Sorry, I didn\'t understand that. Can you please rephrase?');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
      addMessageToChatbot('bot', 'Sorry, I\'m experiencing some technical difficulties. Please try again later.');
    }
  });
}

function addMessageToChatbot(type, message) {
  const $message = $('<div class="chatbot-message ' + type + '-message">' + message + '</div>');
  $chatbotMessages.append($message);
  $chatbotMessages.scrollTop($chatbotMessages.prop('scrollHeight'));
}

function fetchweather(city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
    method: 'GET',
    success: function (response) {
      if (response && response.weather && response.weather[0] && response.weather[0].description) {
        addMessageToChatbot('bot', `The weather in ${city} is ${response.weather[0].description}.`);
      } else {
        addMessageToChatbot('bot', 'Sorry, I couldn\'t find the weather information for that city.');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
      addMessageToChatbot('bot', 'Sorry, I\'m experiencing some technical difficulties. Please try again later.');
    }
  });
}



