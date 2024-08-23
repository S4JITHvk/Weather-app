"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeatherData {
  hour: string;
  temp: number;
  wind_speed: number;
  rh: number;
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<string>("Kolkata");
  const [searchLocation, setSearchLocation] = useState<string>("Kolkata");
  const [highestTemp, setHighestTemp] = useState<number | null>(null);
  const [lowestTemp, setLowestTemp] = useState<number | null>(null);
  const [avgHumidity, setAvgHumidity] = useState<string | null>(null);
  const [avgWindSpeed, setAvgWindSpeed] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    if (!location) {
      alert("Please add Location!");
      return;
    }
    setLoading(true);
    try {
      const geocodeResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );
      const { lat, lon } = geocodeResponse.data[0];
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
      );
      const data = response.data;
      const maxHours = 24;
      const formattedDate: WeatherData[] = data.hourly.time
        .slice(0, maxHours)
        .map((time: string, index: number) => ({
          hour: new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temp: data.hourly.temperature_2m[index],
          wind_speed: data.hourly.wind_speed_10m[index],
          rh: data.hourly.relative_humidity_2m[index],
        }));

      setWeatherData(formattedDate);

      const temps = formattedDate.map((item) => item.temp);
      const windSpeed = formattedDate.map((item) => item.wind_speed);
      const humidity = formattedDate.map((item) => item.rh);
      setHighestTemp(Math.max(...temps));
      setLowestTemp(Math.min(...temps));
      setAvgWindSpeed(
        (windSpeed.reduce((a, b) => a + b, 0) / windSpeed.length).toFixed(2)
      );
      setAvgHumidity(
        (humidity.reduce((a, b) => a + b, 0) / humidity.length).toFixed(2)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(searchLocation);
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundImage: `url('https://wallpapers.com/images/featured/weather-xqhs9axpy8btfd3y.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div className="overlay bg-black bg-opacity-60 min-h-screen p-4 max-w-5xl mx-auto grid place-items-center">
        <div className="flex flex-col md:flex-row justify-between w-full items-center mb-4">
          <h1 className="text-3xl font-bold text-center text-white mb-4 md:mb-0">
            Weather Forecast
          </h1>
          <form onSubmit={handleSearch} className="flex justify-center">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="shadow text-black rounded-md outline-none px-4 py-2 focus:ring-1 focus:ring-purple-300"
              placeholder="Enter location"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Search
            </button>
          </form>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-start max-w-4xl mx-auto w-full gap-6">
            <div className="text-white overlay p-4 bg-black bg-opacity-50 flex flex-col md:flex-row justify-between max-w-2xl mx-auto items-start w-full gap-8 leading-normal tracking-wider text-sm">
              <div className="space-y-2">
                <p>Date: {moment().format("LL")}</p>
                <p>Location: {location}</p>
                <p>Relative Humidity: {avgHumidity} %</p>
              </div>
              <div className="space-y-2">
                <p>Highest Temperature: {highestTemp}°C</p>
                <p>Lowest Temperature: {lowestTemp}°C</p>
                <p>Average Wind Speed: {avgWindSpeed} m/s</p>
              </div>
            </div>
            <div className="w-full">
              <h2 className="text-lg font-bold mb-2 text-white">
                Temperature
              </h2>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData}>
                    <XAxis dataKey="hour" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="wind_speed"
                      stroke="#8884d8"
                    />
                    <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="rh" stroke="#dc34ac" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
