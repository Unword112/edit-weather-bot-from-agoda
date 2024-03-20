const { fetchWeatherApi } = require("openmeteo");

/**
 * ดึงข้อมูลสภาพอากาศรายวันสำหรับละติจูดและลองจิจูดที่กำหนด
 *
 * @param {number} latitude - ละติจูดของสถานที่
 * @param {number} longitude - ลองจิจูดของสถานที่
 * @returns {Object} ออบเจ็กต์ที่มีข้อมูลสภาพอากาศรายวัน
 * @property {number} weatherCode - รหัสสภาพอากาศ
 * @property {number} temperature2mMax - อุณหภูมิสูงสุดที่ 2 เมตรเหนือระดับพื้นดิน
 * @property {number} temperature2mMin - อุณหภูมิต่ำสุดที่ 2 เมตรเหนือระดับพื้นดิน
 * @property {number} precipitationProbability - ความน่าจะเป็นของการตกฝน
 */
async function getDailyWeatherByLatLon(latitude, longitude) {
  const params = {
    latitude: latitude,
    longitude: longitude,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ],
    timezone: "Asia/Bangkok",
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const daily = response.daily();

  const weatherCode = daily.variables(0).valuesArray()[0];
  const temperature2mMax = daily.variables(1).valuesArray()[0];
  const temperature2mMin = daily.variables(2).valuesArray()[0];
  const precipitationProbability = daily.variables(2).valuesArray()[0];

  return {
    weatherCode,
    temperature2mMax,
    temperature2mMin,
    precipitationProbability,
  };
}

/**
 * ดึงรหัสสภาพอากาศรายชั่วโมงและความน่าจะเป็นของการตกฝนในวันนี้ตามละติจูดและลองจิจูด
 * @param {number} latitude - ละติจูดของสถานที่
 * @param {number} longitude - ลองจิจูดของสถานที่
 * @returns {Object} ออบเจ็กต์ที่มีรหัสสภาพอากาศและความน่าจะเป็นของการตกฝน
 */
async function getTodaysHourlyWeatherCodeByLatLon(latitude, longitude) {
  const params = {
    latitude: latitude,
    longitude: longitude,
    hourly: ["precipitation_probability", "weather_code"],
    timezone: "Asia/Bangkok",
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const hourly = response.hourly();

  const weatherCodes = hourly.variables(1).valuesArray();
  const precipitationProbabilities = hourly.variables(0).valuesArray();

  return {
    weatherCodes,
    precipitationProbabilities,
  };
}

module.exports = {
  getDailyWeatherByLatLon,
  getTodaysHourlyWeatherCodeByLatLon,
};
