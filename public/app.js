let lastScannedQR = "";

if ("BarcodeDetector" in window) {
  const video = document.getElementById("video");
  const result = document.getElementById("result");

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;

      const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });

      setInterval(async () => {
        try {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes.length > 0) {
            onScanSuccess(barcodes[0].rawValue);
            result.textContent = `QR Code Content: ${barcodes[0].rawValue}`;
          }
        } catch (err) {
          console.error("Error detecting QR code:", err);
        }
      }, 500);
    })
    .catch((err) => console.error("Camera error:", err));
} else {
  alert("Barcode Detector API is not supported in your browser.");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker registered."))
    .catch((err) => console.error("Service Worker registration failed:", err));
}

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BM1duI_I2tpVhTuk6WjcGK9nUUt0qwKq0k02uXyKE5tS0r7PTpaBkW3gWrjdPVXlJnNRX4Eb_AqNUf3t0gb5tI8"
    })
    .then((subscription) => {
      console.log("Push subscription:", subscription);

      fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });
    })
    .catch(err => console.error("Push subscription failed:", err));
  });
}

async function sendPushNotification(qrData) {
  await fetch("/send-notification", {
    method: "POST",
    body: JSON.stringify({ message: `Skeniran QR kod: ${qrData}` }),
    headers: { "Content-Type": "application/json" }
  });
}

async function onScanSuccess(qrData) {
  if (qrData !== lastScannedQR) {
    lastScannedQR = qrData;
    result.textContent = `QR Code Content: ${qrData}`;

    await sendPushNotification(qrData);
  }
}

function requestNotificationPermission() {
  if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
              console.log("Notifikacije su omogućene.");
          }
      });
  }
}

requestNotificationPermission();