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

// 2. Endpoint สำหรับแจกตัว Loader (ดักไม่ให้เปิดผ่านเบราว์เซอร์ + ไม่แสดงข้อความแจ้งเตือน)
app.get('/loader.lua', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';

    // บล็อกถ้าเปิดจากเว็บเบราว์เซอร์ทั่วไป
    if (!userAgent.includes('Roblox') && !userAgent.includes('ROBLOX')) {
        return res.status(403).send("Access Denied");
    }

    const loaderCode = `
local userKey = script_key or ""
local apiUrl = "https://tatahub-api.onrender.com/get_script?script_key=" .. tostring(userKey)

local success, response = pcall(function()
    return game:HttpGet(apiUrl)
end)

if success and response and #response > 0 then
    local func = loadstring(response)
    if func then
        func()
    end
end
    `;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(loaderCode.trim());
});

// 3. Endpoint ตรวจสอบ Key และส่งคืนสคริปต์หลัก (ดักจับป้องกันการเข้าผ่านเบราว์เซอร์)
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;
    const userAgent = req.headers['user-agent'] || '';

    // 🛑 บล็อกการเข้าผ่านเบราว์เซอร์ทั่วไป (Chrome, Edge, Safari ฯลฯ)
    if (!userAgent.includes('Roblox') && !userAgent.includes('ROBLOX')) {
        return res.status(403).send("Access Denied");
    }

    if (!userKey) {
        return res.status(400).send("");
    }

    const scriptUrl = SCRIPT_KEYS[userKey];

    if (scriptUrl) {
        try {
            const response = await axios.get(scriptUrl);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(200).send(response.data);
        } catch (error) {
            return res.status(500).send("");
        }
    }

    return res.status(403).send("");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,
