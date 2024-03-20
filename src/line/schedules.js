const cron = require("node-cron");
const { DateTime } = require("luxon");

const { sendMulticast } = require("./messageSender");
const { getProvincesThatHasUser, getUserByProvinceId } = require("../data/db");
const {
  getDailyWeatherByLatLon,
  getTodaysHourlyWeatherCodeByLatLon,
} = require("../weather/openmeteo");

const weatherCodeDescr = require("../weather/weatherCodes");

async function getWeatherCodeDescription() {
  const { weatherCode } = await getDailyWeatherByLatLon(latitude, longitude);
  const description = weatherCodeDescr[weatherCode];
  return description;
}

/**
 * ส่งการแจ้งเตือนสภาพอากาศให้กับผู้ใช้ในจังหวัดที่กำหนดตามเงื่อนไขของสภาพอากาศ
 * ดึงรหัสสภาพอากาศและโอกาสฝนตกสำหรับแต่ละจังหวัด
 * และส่งการแจ้งเตือนให้กับผู้ใช้หากสภาพอากาศคาดว่าจะแย่ลงในชั่วโมงถัดไป
 *
 * @returns {Promise<void>} Promise ที่ resolve เมื่อส่งการแจ้งเตือนทั้งหมดเสร็จสิ้น
 */
async function alertBadWeather() {
  console.log("alertBadWeather started!");
  const provinces = getProvincesThatHasUser();

  for (const province of provinces) {
    const { weatherCodes, precipitationProbabilities } =
      await getTodaysHourlyWeatherCodeByLatLon(
        province.latitude,
        province.longitude,
      );

    const currentHour = DateTime.now().setZone("Asia/Bangkok").hour;

    if (
      !isWeatherCodeBad(weatherCodes[currentHour]) &&
      isWeatherCodeBad(weatherCodes[currentHour + 1])
    ) {
      const lineUserIds = getUserByProvinceId(province.id).map(
        (user) => user.lineUserId,
      );

      sendMulticast(
        lineUserIds,
        `!!! เตือนภัยอากาศ !!!
${weatherCodeDescr[weatherCodes[currentHour + 1]]}ในอีก 1 ชั่วโมงข้างหน้า, โอกาสฝนตก ${precipitationProbabilities[currentHour + 1]}%`,
      );
    }
  }
}

async function WeatherGonnaBeGood() {
  const provinces = getProvincesThatHasUser();

  for (const province of provinces) {
    const { weatherCodes } = await getTodaysHourlyWeatherCodeByLatLon(
      province.latitude,
      province.longitude,
    );

    const currentHour = DateTime.now().setZone("Asia/Bangkok").hour;

    if (
      !isWeatherCodeGood(weatherCodes[currentHour]) &&
      isWeatherCodeGood(weatherCodes[currentHour + 1])
    ) {
      const lineUserIds = getUserByProvinceId(province.id).map(
        (user) => user.lineUserId,
      );

      sendMulticast(lineUserIds, `//ฝนกำลังหยุดตก// ในอีก 1 ชั่วโมงข้างหน้า`);
    }
  }
}

/**
 * ตรวจสอบว่ารหัสสภาพอากาศแสดงถึงสภาพอากาศที่ไม่ดีหรือไม่
 * @param {number} weatherCode - รหัสสภาพอากาศที่ต้องการตรวจสอบ
 * @returns {boolean} - คืนค่า true ถ้ารหัสสภาพอากาศแสดงถึงสภาพอากาศที่ไม่ดี มิฉะนั้นคืนค่า false
 */

function isWeatherCodeBad(weatherCode) {
  return weatherCode === 9 || weatherCode === 17 || weatherCode >= 20;
}

function isWeatherCodeGood(weatherCode) {
  return weatherCode === 0 || weatherCode === 1;
}

cron.schedule("15 * * * *", alertBadWeather, { timezone: "Asia/Bangkok" });
cron.schedule("15 * * * *", WeatherGonnaBeGood, { timezone: "Asia/Bangkok" });

/**
 * สร้างรายงานสภาพอากาศประจำวันสำหรับแต่ละจังหวัดและส่งไปยังผู้ใช้ Line ที่เกี่ยวข้อง
 * @returns {Promise<void>} Promise ที่ resolve เมื่อส่งรายงานสภาพอากาศเสร็จสิ้น
 */
async function dailyReport() {
  console.log("dailyReport started!");
  const provinces = getProvincesThatHasUser();

  for await (const province of provinces) {
    const {
      weatherCode,
      temperature2mMax,
      temperature2mMin,
      precipitationProbability,
    } = await getDailyWeatherByLatLon(province.latitude, province.longitude);

    const lineUserIds = getUserByProvinceId(province.id).map(
      (user) => user.lineUserId,
    );

    sendMulticast(
      lineUserIds,
      "รายงานสภาพอากาศประจำวัน",
      `สภาพอากาศวันนี้: ${weatherCodeDescr[weatherCode]}
อุณหภูมิสูงสุด: ${Math.round(temperature2mMax)}°C
อุณหภูมิต่ำสุด: ${Math.round(temperature2mMin)}°C
โอกาสฝนตก: ${Math.round(precipitationProbability)}%`,
    );
  }
}

cron.schedule("30 8 * * *", dailyReport, { timezone: "Asia/Bangkok" });

module.exports = { dailyReport };
