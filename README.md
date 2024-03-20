# Weather Bot

รายงานสภาพอากาศประจำวัน และแจ้งเตือนอากาศอันตรายผ่าน LINE bot
โดยใช้บริการ API ของ [Open-Meteo](https://open-meteo.com/)

## การ Setup สำหรับการพัฒนาบน Codesandbox

1. กดปุ่ม "Fork" ที่มุมขวาบนของหน้า
2. หลังจาก Fork แล้ว โปรเจคที่เห็นในจอจะเปลี่ยนเป็นโปรเจคที่เป็นของคุณเอง 
3. กดปุ่ม "Share" ที่มุมขวาบนของหน้า
4. กดปุ่ม "Move out of Drafts"
5. ที่ "Change permissions" ให้เลือก "Unlisted" เพื่อทำให้โปรเจคสามารถเข้าถึงได้
6. สร้างไลน์บอทใหม่ที่ [LINE Developers Console](https://developers.line.biz/console/)
7. จากนั้นตั้ง token และ secret ใน Codesandbox โดย
  - กดเมนู Codesandbox (กล่องสี่เหลี่ยมมุมซ้ายบน) > Settings > Env Variables
  - กดปุ่ม Plain text
  - ใส่ค่า 
    - `LINE_CHANNEL_ACCESS_TOKEN` - แทนที่ `xxx` ด้วย channel access token ที่ได้จาก LINE Developers Console
    - `LINE_CHANNEL_SECRET` - แทนที่ `yyy` ด้วย channel secret ที่ได้จาก LINE Developers Console
  - กด Save แล้วกด Restart microVM
8. ใน Codesandbox จอครึ่งขวาจะเป็น Browser ที่มีลิงค์อยู่ด้านบน ให้เติม `/webhook/line` ต่อท้ายแล้วนำทั้งหมดนั้นไปวางในหน้า "Messaging API" ของบอต ในช่อง "Webhook URL" _(ตัวอย่าง: สมมุติ URL ในหน้า Codesandbox คือ `https://blablabla.codesandbox.io`; แก้ไขให้เป็น `https://blablabla.codesandbox.io/webhook/line` แล้วนำไปใส่ใน Webhook URL)_
9. กดเปิด "Use webhook" ถ้าหากยังไม่ได้เปิด

## โครงสร้างโปรเจค

เนื่องจากเป็นโปรเจคที่ซับซ้อนขึ้น จึงมีการแบ่งโค้ดออกเป็นไฟล์หลายไฟล์และโฟล์เดอร์ดังนี้

- `src/`
  - `index.js` - ไฟล์หลักของแอปพลิเคชัน
  - `data/` - เกี่ยวกับการจัดเก็บข้อมูล
    - `db.js` - เชื่อมต่อฐานข้อมูล + ฟังก์ชันสำหรับการจัดการข้อมูล
    - `provinces.json` - ข้อมูลจังหวัด และพิกัดที่ตั้งของจังหวัด
  - `line/` - เกี่ยวกับการส่งข้อความผ่าน LINE
    - `messageHandler.js` - ตัวรับข้อความจาก LINE, ประมวลผล, และส่งกลับ
    - `messageSender.js` - ตัวช่วยส่งข้อความตอบกลับไปยัง LINE ให้ง่ายขึ้น
    - `schedules.js` - ตัวจัดการกับการส่งข้อความตามเวลาที่กำหนด
  - `routes/` - เกี่ยวกับการรับ request ของ server chatbot
    - `line-webhook.js` - ตัวจัดการกับ request ที่เกี่ยวกับ LINE
  - `weather/` - เกี่ยวกับการดึงข้อมูลสภาพอากาศ
    - `openmeteo.js` - ตัวช่วยสำหรับการดึงข้อมูลสภาพอากาศจาก API OpenMeteo
    - `weatherCodes.json` - คำอธิบายของรหัสสภาพอากาศที่ได้จาก API OpenMeteo
