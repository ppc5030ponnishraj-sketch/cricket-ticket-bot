const https = require("https");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const BOOKING_URL = "https://in.bookmyshow.com/sports/super-8-match-8-icc-men-s-t20-wc-2026/ET00474264";

// STOP DATE
const STOP_DATE = new Date("2026-02-26T23:59:59");

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Missing Telegram credentials");
  process.exit(1);
}

function sendTelegram(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve());
    });

    req.on("error", err => reject(err));

    req.write(data);
    req.end();
  });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function checkCricketBooking() {

  const now = new Date();

  if (now > STOP_DATE) {
    console.log("Deadline passed. Stopping checks.");
    return;
  }

  try {
    const pageContent = await fetchPage(BOOKING_URL);

    const isOpen = pageContent.includes("Book") || pageContent.includes("BOOK");

    if (isOpen) {
      await sendTelegram(
`🏏 <b>BOOKING OPEN!</b>

🎟 Match: Super 8 Match 8 - ICC Men's T20 WC 2026
📍 Venue: Check BookMyShow
🔗 ${BOOKING_URL}

🔥 Hurry up!`
      );
    } else {
      await sendTelegram(
`🦁 CSK ku wait pannu 🦁

❌ Tickets not opened yet.

⏳ Bot checking every 5 minutes.`
      );
    }

  } catch (error) {
    console.error(error);
  }
}

checkCricketBooking();
