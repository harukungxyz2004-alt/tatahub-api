const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// รายการ Key ที่อนุญาตใช้งาน
const VALID_KEYS = [
    "VIP_KEY_1234",
    "SPEED_HUB_8888",
    "MY_SECRET_KEY"
];

// ลิงก์ Raw สคริปต์หลักจาก GitHub Gist ของคุณ
const RAW_SCRIPT_URL = "https://gist.githubusercontent.com/harukungxyz2004-alt/64419a808b5f57b555fcc118368c6b97/raw/b66fb319324a9f3188abea8c5d152479e95b4af6/main_script.lua";

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
