const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. โครงสร้างข้อมูล Key และ URL สคริปต์ปลายทาง
const SCRIPT_KEYS = {
    "tatahublootfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/d5486ef28fc2e5f6036ad7f720f01c14/raw/5ef916a901dbf2d69c24c99beb6761acf5f03a68/main_script.lua",
    "tatahubantfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/f982a1f11ccc426e2be4827341ef95fe/raw/704efbb7197dd25a565999700cfb8b4ec9e8facd/main_script.lua"
};

// 2. Endpoint สำหรับแจกตัว Loader
app.get('/loader.lua', (req, res) => {
    const loaderCode = `
local userKey = script_key or ""
local apiUrl = "https://tatahub-api.onrender.com/get_script?script_key=" .. tostring(userKey)

print("1. กำลังตรวจสอบ Key...")

local success, response = pcall(function()
    return game:HttpGet(apiUrl)
end)

if not success then
    warn("❌ ไม่สามารถเชื่อมต่อ Render API ได้!")
    return
end

if response and #response > 0 then
    local func, err = loadstring(response)
    if func then
        print("2. ยืนยันสิทธิ์สำเร็จ! กำลังเริ่มรันสคริปต์...")
        func()
    else
        warn("❌ เกิด Syntax Error ในสคริปต์: " .. tostring(err))
    end
else
    warn("❌ ไม่พบข้อมูลตอบกลับจาก API")
end
    `;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(loaderCode);
});

// 3. Endpoint ตรวจสอบ Key และส่งคืนสคริปต์หลัก
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;

    if (!userKey) {
        return res.status(400).send("warn('❌ กรุณาใส่ script_key ในการเรียกใช้งาน')");
    }

    const scriptUrl = SCRIPT_KEYS[userKey];

    if (scriptUrl) {
        try {
            const response = await axios.get(scriptUrl);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(200).send(response.data);
        } catch (error) {
            return res.status(500).send("warn('❌ เกิดข้อผิดพลาดในการดึงสคริปต์หลักจาก GitHub Gist')");
        }
    }

    return res.status(403).send("warn('❌ Key ไม่ถูกต้อง หรือ Key หมดอายุ!')");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
