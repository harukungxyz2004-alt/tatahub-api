const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. รายการ Key ที่อนุญาตใช้งาน (แก้ไข/เพิ่ม/ลด ตรงนี้ได้ตามปกติ)
const VALID_KEYS = [
    "VIP_KEY_1234",
    "SPEED_HUB_8888",
    "MY_SECRET_KEY"
];

// 2. ลิงก์ Raw สคริปต์หลักจาก GitHub Gist (ใช้แบบไม่ติด Hash ยาวๆ เพื่อให้อัปเดต Real-time)
const RAW_SCRIPT_URL = "https://gist.githubusercontent.com/harukungxyz2004-alt/247e1a1929a3dd501f0baaa1ec7802e2/raw/main_script.lua";

// 3. Endpoint สำหรับแจกตัว Loader ให้คนนำไปรันสั้นๆ 2 บรรทัด
app.get('/loader.lua', (req, res) => {
    const loaderCode = `
local userKey = script_key or ""
local apiUrl = "https://tatahub-api.onrender.com/get_script?script_key=" .. tostring(userKey)

print("1. กำลังส่ง Request ไปที่ Render API...")

local success, response = pcall(function()
    return game:HttpGet(apiUrl)
end)

if not success then
    warn("❌ ไม่สามารถเชื่อมต่อ Render API ได้!")
    return
end

print("2. เชื่อมต่อสำเร็จ! กำลังตรวจสอบเนื้อหาสคริปต์...")

if response and #response > 0 then
    local func, err = loadstring(response)
    if func then
        print("3. โหลดสคริปต์สำเร็จ! กำลังเริ่มรันสคริปต์หลัก...")
        func()
    else
        warn("❌ เกิด Syntax Error ในไฟล์ Gist ของคุณ: " .. tostring(err))
    end
else
    warn("❌ ไม่พบข้อมูลสคริปต์ตอบกลับจาก API")
end
    `;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(loaderCode);
});

// 4. Endpoint สำหรับตรวจสอบ Key และส่งเนื้อหาสคริปต์หลักจาก Gist กลับไป
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;

    if (userKey && VALID_KEYS.includes(userKey)) {
        try {
            const response = await axios.get(RAW_SCRIPT_URL);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(200).send(response.data);
        } catch (error) {
            return res.status(500).send("warn('❌ เกิดข้อผิดพลาดในการดึงสคริปต์หลัก')");
        }
    } else {
        return res.status(403).send("warn('❌ Key ไม่ถูกต้อง หรือ Key หมดอายุ!')");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
