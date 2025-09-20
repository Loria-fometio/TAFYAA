const {onRequest} = require("firebase-functions/v2/https");

// Simple test function
exports.helloWorld = onRequest((request, response) => {
  response.send("Hello, Tafyaa!");
});

// Test function without any external dependencies
exports.testSimple = onRequest((request, response) => {
  response.json({
    message: "Simple test function working",
    timestamp: new Date().toISOString(),
    data: request.body || {}
  });
});

