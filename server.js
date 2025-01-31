const express = require('express');
const cors = require('cors');
const path = require('path');
const webPush = require('web-push');
require('dotenv').config();

const app = express();

webPush.setVapidDetails("mailto:janbadrov5@gmail.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
let subscribers = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscribers.push(subscription);
  res.status(201).json({ message: "Subscribed!" });
});

app.post("/send-notification", (req, res) => {
  const notificationPayload = JSON.stringify({ title: "QR Scan", body: req.body.message });

  const sendPromises = subscribers.map(sub => webPush.sendNotification(sub, notificationPayload));
  
  Promise.all(sendPromises)
    .then(() => res.status(200).json({ message: "Push Sent!" }))
    .catch(err => {
      console.error("Error sending notification:", err);
      res.sendStatus(500);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server pokrenut na http://localhost:${PORT}`);
});