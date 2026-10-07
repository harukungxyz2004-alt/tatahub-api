const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. จัดกลุ่ม Key และผูกกับ URL สคริปต์ (กลุ่มละ 10 Key)
const SCRIPT_GROUPS = [
    {
        // กลุ่มที่ 1 (10 Key แรก)
        keys: [
            "HxLE9vKk",
            "sEVe64Lf",
            "5fP23HzN",
            "pMkDdK5d",
            "DAwU643c",
            "WQzcp7bB",
            "ZW4ULRa2",
            "QWkU3tf9",
            "hbKR8Zsr",
            "wZu7zgA7"
        ],
        url: "https://gist.githubusercontent.com/harukungxyz2004-alt/247e1a1929a3dd501f0baaa1ec7802e2/raw/main_script.lua"
    },
    {
        // กลุ่มที่ 2 (10 Key หลัง)
        keys: [
            "Cf5TcNQU",
            "nrKpk3GG",
            "s888yfWH",
            "8p8DyTEg",
            "9VT9EXCw",
            "KYRS5dAY",
            "2z7rXwAf",
            "GB88YGYm",
            "424CeBuk",
            "uh2Cf23b"
        ],
        url: "https://gist.githubusercontent.com/harukungxyz2004-alt/afbaaad08488041fc9aee9e7ddb30d10/raw/main_script.lua"
    }
];

// ฟังก์ชันค้นหา URL จาก Key ที่ผู้ใช้ส่งมา
function getScriptUrlByKey(userKey) {
    for (const group of SCRIPT_GROUPS) {
        if (group.keys.includes(userKey)) {
            return group.url;
        }
    }
    return null;
}

// 2. Endpoint สำหรับส่งตัว Loader
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
        warn("❌ เกิด Syntax Error ในสคริปต์ของคุณ: " .. tostring(err))
    end
else
    warn("❌ ไม่พบข้อมูลสคริปต์ตอบกลับจาก API")
end
    `;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(loaderCode);
});

// 3. Endpoint ตรวจสอบ Key และส่งสคริปต์กลับ
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;
    const targetUrl = getScriptUrlByKey(userKey);

    if (targetUrl) {
        try {
            const response = await axios.get(targetUrl);
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
