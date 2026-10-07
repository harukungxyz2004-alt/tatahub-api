const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// โครงสร้างข้อมูล Key และ URL
const SCRIPT_KEYS = {
    "tatahublootfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/a6088e51a4ebbbfee2d99a8b49f6592a/raw/953a75b2361c85fc96efd0f6df5bcaf3f42a39be/main_script.lua",
    "tatahubantfree": "https://gist.githubusercontent.com/harukungxyz2004-alt/658495f079b4fbbe4b66e3b8705fa920/raw/28192bc8d58bca12beaea97ea9430edf8a325008/main_script.lua"
};

// Endpoint สำหรับ Loader
app.get('/loader.lua', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';

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

// Endpoint ดึงสคริปต์
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;
    const userAgent = req.headers['user-agent'] || '';

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
