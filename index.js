const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. โครงสร้างข้อมูล Key (รวมระบบจำ HWID)
const SCRIPT_GROUPS = [
    {
        // กลุ่มที่ 1 (10 Key แรก)
        keys: {
            "rPT9WPTu": { hwid: null },
            "sEVe64Lf": { hwid: null },
            "5fP23HzN": { hwid: null },
            "pMkDdK5d": { hwid: null },
            "DAwU643c": { hwid: null },
            "WQzcp7bB": { hwid: null },
            "ZW4ULRa2": { hwid: null },
            "QWkU3tf9": { hwid: null },
            "hbKR8Zsr": { hwid: null },
            "wZu7zgA7": { hwid: null }
        },
        url: "https://gist.githubusercontent.com/harukungxyz2004-alt/d5486ef28fc2e5f6036ad7f720f01c14/raw/5ef916a901dbf2d69c24c99beb6761acf5f03a68/main_script.lua"
    },
    {
        // กลุ่มที่ 2 (10 Key หลัง)
        keys: {
            "Cf5TcNQU": { hwid: null },
            "nrKpk3GG": { hwid: null },
            "s888yfWH": { hwid: null },
            "8p8DyTEg": { hwid: null },
            "9VT9EXCw": { hwid: null },
            "KYRS5dAY": { hwid: null },
            "2z7rXwAf": { hwid: null },
            "GB88YGYm": { hwid: null },
            "424CeBuk": { hwid: null },
            "uh2Cf23b": { hwid: null }
        },
        url: "https://gist.githubusercontent.com/harukungxyz2004-alt/f982a1f11ccc426e2be4827341ef95fe/raw/704efbb7197dd25a565999700cfb8b4ec9e8facd/main_script.lua"
    }
];

// 2. Endpoint สำหรับแจกตัว Loader
app.get('/loader.lua', (req, res) => {
    const loaderCode = `
local userKey = script_key or ""

-- ดึง Hardware ID ของเครื่องผู้ใช้ (รองรับ Executor หลักๆ เช่น Delta, Fluxus, Wave, Solara, etc.)
local userHWID = (gethwid and gethwid()) 
    or (get_hwid and get_hwid()) 
    or (getgenv and getgenv().gethwid and getgenv().gethwid())
    or game:GetService("RbxAnalyticsService"):GetClientId()

local apiUrl = "https://tatahub-api.onrender.com/get_script?script_key=" .. tostring(userKey) .. "&hwid=" .. tostring(userHWID)

print("1. กำลังตรวจสอบ Key และ Hardware ID...")

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

// 3. Endpoint ตรวจสอบ Key + HWID
app.get('/get_script', async (req, res) => {
    const userKey = req.query.script_key;
    const userHWID = req.query.hwid;

    if (!userKey || !userHWID) {
        return res.status(400).send("warn('❌ ข้อมูล Request ไม่สมบูรณ์ (ขาด Key หรือ HWID)')");
    }

    // ค้นหา Key จากกลุ่มสคริปต์
    for (const group of SCRIPT_GROUPS) {
        if (group.keys[userKey]) {
            const keyData = group.keys[userKey];

            // เคสที่ 1: ใส่ใช้งานครั้งแรก (ยังไม่มี HWID ผูกไว้)
            if (keyData.hwid === null) {
                keyData.hwid = userHWID; // ลงทะเบียนผูก HWID เครื่องนี้ทันที
                console.log(`[HWID Registered] Key: ${userKey} -> HWID: ${userHWID}`);
            }

            // เคสที่ 2: เช็คว่า HWID ตรงกับเครื่องที่ลงทะเบียนไว้หรือไม่
            if (keyData.hwid === userHWID) {
                try {
                    const response = await axios.get(group.url);
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    return res.status(200).send(response.data);
                } catch (error) {
                    return res.status(500).send("warn('❌ เกิดข้อผิดพลาดในการดึงสคริปต์หลัก')");
                }
            } else {
                // ถ้า HWID ไม่ตรง (นำไปรันเครื่องอื่น)
                return res.status(403).send("warn('❌ Key นี้ถูกล็อกไว้กับเครื่องอื่นแล้ว! ไม่สามารถใช้ข้ามเครื่องได้')");
            }
        }
    }

    return res.status(403).send("warn('❌ Key ไม่ถูกต้อง หรือ Key หมดอายุ!')");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
