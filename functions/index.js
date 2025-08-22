// v2-style imports (recommended)
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const QRCode = require("qrcode");

// Keep functions in the same region as your data to reduce latency
setGlobalOptions({region: "africa-south1", maxInstances: 10});

// Returns a simple HTML page with the QR image
exports.generateQRCode = onRequest(async (req, res) => {
  try {
    // Accept ?text=... or { "text": "..." } via POST
    let text = "";
    if (req.method === "POST") {
      text = req.body && req.body.text ? req.body.text : "";
    } else {
      text = req.query && req.query.text ? req.query.text : "";
    }
    if (!text) text = "Hello, Tafyaa QR!";

    const dataUrl = await QRCode.toDataURL(String(text));
    res.set("Cache-Control", "no-store");
    res.status(200).send(`
      <h1>QR Code Generator</h1>
      <p>Text: ${String(text)}</p>
      <img alt="QR" src="${dataUrl}" />
    `);
  } catch (err) {
    logger.error("Error generating QR code", err);
    res.status(500).send("Failed to generate QR code");
  }
});

// Optional JSON version for frontend consumption
exports.generateQRCodeJson = onRequest({cors: true}, async (req, res) => {
  try {
    let text = "";
    if (req.method === "POST") {
      text = req.body && req.body.text ? req.body.text : "";
    } else {
      text = req.query && req.query.text ? req.query.text : "";
    }

    if (!text) return res.status(400).json({error: "text is required"});

    const dataUrl = await QRCode.toDataURL(String(text));
    res.set("Cache-Control", "no-store");
    res.status(200).json({dataUrl});
  } catch (err) {
    logger.error("Error generating QR code (JSON)", err);
    res.status(500).json({error: "Failed to generate QR code"});
  }
});
