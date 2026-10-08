const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// โครงสร้างข้อมูล Key และ URL
const SCRIPT_KEYS = {
    "tatahublootfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/30fa30abb040696ebfbee23f354a2c57/raw/893caef4bc16f70b90843b7f34ffc3c0eb5b192b/main_script.lua",
    "tatahubantfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/658495f079b4fbbe4b66e3b8705fa920/raw/28192bc8d58bca12beaea97ea9430edf8a325008/main_script.lua"
};

// ฟังก์ชันเช็คว่ามาจาก Executor หรือไม่ (ขยายการตรวจรองรับ Mobile Executors)
function isRobloxExecutor(req) {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    // Executor บนมือถือบางตัวใช้ User-Agent เฉพาะ หรือไม่ใส่ User-Agent มาเลย
    return ua.includes('roblox') || ua.includes('delta') || ua.includes('hydro') || ua.includes('arceus') || ua === '';
}

// Endpoint สำหรับ Loader
app.get('/loader.lua', (req, res) => {
    if (!isRobloxExecutor(req)) {
        return res.status(403).send("Access Denied");
    }

    const loaderCode = `
local userKey = script_key or ""
local apiUrl = "https://tatahub-api.onrender.com/get_script?script_key=" .. tostring(userKey) .. "&nocache=" .. tostring(os.time())

local success, response = pcall(function()
    return game:HttpGet(apiUrl)
end)

if success and response and #response > 0 then
    if response:sub(1, 12) == "INVALID_KEY" then
        warn("❌ TaTa Hub: Key ไม่ถูกต้อง!")
        return
    end

    local func, err = loadstring(response)
    if func then
        task.spawn(func)
    else
        warn("❌ TaTa Hub Syntax Error: " .. tostring(err))
    end
else
    warn("❌ TaTa Hub: ไม่สามารถเชื่อมต่อกับ Server ได้")
end
    `;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(loaderCode.trim());
});

// Endpoint ดึงสคริปต์
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;

    if (!isRobloxExecutor(req)) {
        return res.status(403).send("Access Denied");
    }

    if (!userKey) {
        return res.status(200).send("INVALID_KEY");
    }

    const scriptUrl = SCRIPT_KEYS[userKey];

    if (scriptUrl) {
        try {
            const response = await axios.get(scriptUrl, {
                headers: { 'User-Agent': 'Roblox/WinInet' },
                timeout: 8000 // กำหนด Timeout 8 วินาที
            });
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send(response.data);
        } catch (error) {
            console.error("Fetch Gist Error:", error.message);
            return res.status(500).send("SERVER_ERROR");
        }
    }

    return res.status(200).send("INVALID_KEY");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
