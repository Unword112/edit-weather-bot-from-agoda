const { reply, send } = require("./messageSender");
const { dailyReport } = require("./schedules");

const {
  createUser,
  updateUser,
  deleteUser,
  getCurrentProvinceNameOfUser,
  searchProvinceByName,
} = require("../data/db");

/**
 * จัดการกับเหตุการณ์ที่เข้ามา ตรวจสอบประเภทของเหตุการณ์ และส่งไปยังฟังก์ชันที่เหมาะสม
 * @param {object} event - อ็อบเจ็กต์เหตุการณ์
 */
function handleEvent(event) {
  switch (event.type) {
    case "follow":
      handleFollow(event);
      break;
    case "unfollow":
      handleUnfollow(event);
      break;
    case "message":
      handleMessage(event);
      break;
    default:
      break;
  }
}

/**
 * จัดการกับเหตุการณ์ 'follow'
 * @param {object} event - อ็อบเจ็กต์เหตุการณ์
 */
function handleFollow(event) {
  reply(
    event,
    "สวัสดีครับ ผมคือ Weather Bot คุณสามารถเลือกจังหวัดที่ต้องการรับข้อมูลอากาศได้เลยครับ",
    "คุณพี่อยู่จังหวัดอะไรครับ?",
  );
}

/**
 * จัดการกับเหตุการณ์ 'unfollow'
 * @param {object} event - อ็อบเจ็กต์เหตุการณ์
 */
function handleUnfollow(event) {
  deleteUser(event.source.userId);
}

/**
 * จัดการกับเหตุการณ์ 'message'
 * @param {object} event - อ็อบเจ็กต์เหตุการณ์
 */
function handleMessage(event) {
  if (event.message.type !== "text") {
    reply(event, "ขอโทษครับ ผมไม่เข้าใจข้อความที่คุณส่งมา");
  }

  const newProvince = searchProvinceByName(event.message.text);
  const currentProvince = getCurrentProvinceNameOfUser(event.source.userId);

  if (newProvince) {
    if (currentProvince.name === newProvince.name) {
      reply(event, `จังหวัด${newProvince.name}เป็นจังหวัดที่เลือกไว้อยู่แล้ว`);
      console.log(currentProvince.name);
    } else if (currentProvince != newProvince) {
      updateUser(event.source.userId, newProvince.id);
      reply(
        event,
        `เปลี่ยนจากจังหวัด${currentProvince.name}เป็นจังหวัด${newProvince.name}เรียบร้อย ผมจะส่งข้อมูลอากาศให้คุณทุกวันครับ`,
      );
    } else {
      createUser(event.source.userId, newProvince.id);
      reply(
        event,
        `เลือกจังหวัด${newProvince.name}เรียบร้อย ผมจะส่งข้อมูลอากาศให้คุณทุกวันครับ`,
      );
    }
  } else if (event.message.text === "สภาพอากาศวันนี้") {
    reply(event, `จังหวัด${currentProvince.name}`);
    dailyReport();
  } else if (event.message.text === "help") {
    reply(
      event,
      "อากาศ bot จะรายงานสภาพอากาศให้คุณทุกวันครับ",
      "พิมพ์จังหวัดที่ต้องการรับข้อมูล เช่น `กรุงเทพมหานคร` ",
      "พิมพ์ `สภาพอากาศวันนี้` เพื่อดูอากาศในวันนี้",
      "หรือ พิมพ์ `help` เพื่อดูวิธีใช้งาน",
    );
  } else {
    reply(event, "ขอโทษครับ ผมไม่พบข้อมูลจังหวัดที่คุณส่งมา");
  }
}
module.exports = { handleEvent };
