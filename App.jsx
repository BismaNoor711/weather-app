import { useState, useEffect } from "react";
import "./App.css";

const weatherInfo = {
  0: { text: "Clear Sky", icon: "☀️" },
  1: { text: "Mainly Clear", icon: "🌤️" },
  2: { text: "Partly Cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Foggy", icon: "🌫️" },
  48: { text: "Foggy", icon: "🌫️" },
  51: { text: "Light Drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy Drizzle", icon: "🌧️" },
  61: { text: "Light Rain", icon: "🌦️" },
  63: { text: "Rainy", icon: "🌧️" },
  65: { text: "Heavy Rain", icon: "🌧️" },
  71: { text: "Light Snow", icon: "🌨️" },
  73: { text: "Snowy", icon: "❄️" },
  75: { text: "Heavy Snow", icon: "❄️" },
  80: { text: "Rain Showers", icon: "🌦️" },
  81: { text: "Rain Showers", icon: "🌧️" },
  82: { text: "Heavy Showers", icon: "⛈️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm", icon: "⛈️" },
  99: { text: "Heavy Thunderstorm", icon: "⛈️" },
};

function getWeather(code) {
  return weatherInfo[code] || { text: "Cloudy", icon: "🌥️" };
}

function formatTime(value) {
  if (!value) return "--:--";

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function App() {
  const [city, setCity] = useState("Lahore");
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchWeather(cityName) {
    const searchCity = cityName.trim();

    if (!searchCity) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchCity
        )}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for this city.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Try another name.");
      }

      const place = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to load weather data.");
      }

      const data = await weatherResponse.json();

      setWeather({
        city: place.name,
        country: place.country || "",
        current: data.current,
        daily: data.daily,
      });

      setForecast(
        data.daily.time.map((day, index) => ({
          date: day,
          code: data.daily.weather_code[index],
          max: data.daily.temperature_2m_max[index],
          min: data.daily.temperature_2m_min[index],
        }))
      );

      setCity(place.name);
      setInput("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchWeather("Lahore");
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    searchWeather(input);
  }

  function formatDay(date, index) {
    if (index === 0) return "Today";

    return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
    });
  }

  const current = weather?.current;
  const condition = current ? getWeather(current.weather_code) : null;

  return (
    <main className="app">
      <div className="weather-container">
        <header className="header">
          <div className="brand">
            <div className="brand-icon">🌦️</div>
            <div>
              <h1>WeatherVerse</h1>
              <p>Your world, your weather</p>
            </div>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search city..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Search city"
            />
            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>
        </header>

        <nav className="city-buttons" aria-label="Popular cities">
          {["Lahore", "Karachi", "Islamabad", "London"].map((name) => (
            <button
              key={name}
              className={city === name ? "city-button active" : "city-button"}
              onClick={() => searchWeather(name)}
              disabled={loading}
              type="button"
            >
              {name}
            </button>
          ))}
        </nav>

        {error && <div className="error-message">{error}</div>}

        {loading && !weather && (
          <div className="loading-message">Loading weather...</div>
        )}

        {weather && (
          <>
            <section className="top-grid">
              <div className="current-card panel">
                <div className="current-top">
                  <div>
                    <p className="eyebrow">CURRENT WEATHER</p>
                    <h2>
                      {weather.city}
                      <span className="country">
                        {weather.country ? `, ${weather.country}` : ""}
                      </span>
                    </h2>
                    <p className="current-date">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="weather-illustration">
                    {condition?.icon || "🌤️"}
                  </div>
                </div>

                <div className="temperature-row">
                  <div className="temperature">
                    {Math.round(current.temperature_2m)}°
                  </div>

                  <div className="condition-info">
                    <h3>{condition?.text}</h3>
                    <p>
                      Feels like{" "}
                      {Math.round(current.apparent_temperature)}°C
                    </p>
                  </div>
                </div>

                <div className="current-bottom">
                  <span>🌡️ Live temperature</span>
                  <span>
                    {current.is_day ? "☀️ Daytime" : "🌙 Nighttime"}
                  </span>
                </div>
              </div>

              <div className="sun-panel panel">
                <div className="section-heading">
                  <span>🌅</span>
                  <h3>Sunrise & Sunset</h3>
                </div>

                <div className="sun-grid">
                  <div className="sun-item sunrise">
                    <span className="sun-emoji">🌄</span>
                    <p>Sunrise</p>
                    <h4>{formatTime(weather.daily.sunrise[0])}</h4>
                  </div>

                  <div className="sun-item sunset">
                    <span className="sun-emoji">🌇</span>
                    <p>Sunset</p>
                    <h4>{formatTime(weather.daily.sunset[0])}</h4>
                  </div>
                </div>

                <div className="sun-note">
                  ✨ Stay updated with your local weather
                </div>
              </div>
            </section>

            <section className="details-grid">
              <div className="detail-card panel">
                <div className="detail-top">
                  <span>💧</span>
                  <span className="detail-label">HUMIDITY</span>
                </div>
                <h3>{current.relative_humidity_2m}%</h3>
                <p>Relative humidity</p>
              </div>

              <div className="detail-card panel">
                <div className="detail-top">
                  <span>💨</span>
                  <span className="detail-label">WIND SPEED</span>
                </div>
                <h3>{Math.round(current.wind_speed_10m)} <small>km/h</small></h3>
                <p>Wind conditions</p>
              </div>

              <div className="detail-card panel">
                <div className="detail-top">
                  <span>🌧️</span>
                  <span className="detail-label">PRECIPITATION</span>
                </div>
                <h3>{current.precipitation} <small>mm</small></h3>
                <p>Current precipitation</p>
              </div>
            </section>

            <section className="forecast-panel panel">
              <div className="forecast-title">
                <div>
                  <p className="eyebrow">PLAN AHEAD</p>
                  <h3>5-Day Forecast</h3>
                </div>
                <span className="forecast-badge">📅 Next 5 days</span>
              </div>

              <div className="forecast-grid">
                {forecast.map((day, index) => {
                  const info = getWeather(day.code);

                  return (
                    <article className="forecast-card" key={day.date}>
                      <p className="forecast-day">
                        {formatDay(day.date, index)}
                      </p>
                      <span className="forecast-icon">{info.icon}</span>
                      <p className="forecast-condition">{info.text}</p>
                      <div className="forecast-temperatures">
                        <strong>{Math.round(day.max)}°</strong>
                        <span>{Math.round(day.min)}°</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <footer className="footer">
              <span>🌐 WeatherVerse</span>
              <span>Weather data by Open-Meteo</span>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

export default App;