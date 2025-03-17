const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());  // For parsing JSON requests

// Load Service Account from Vercel Environment Variables
const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS;
const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Root Route
app.get('/', (req, res) => {
  res.send('FCM Express API is up and running!');
});

// Send Notification to a Topic
app.post('/sendTopicNotification', async (req, res) => {
  const message = {
    topic: 'all',
    data: {
      type: 'alarm',
      title: 'Fire Detected!',
      body: 'Fire Detected in PUP Sta. Mesa Room 101',
    },
    android: {
      priority: 'high'
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (err) {
    console.error('Error sending topic notification:', err);
    res.status(500).json({ error: 'Failed to send topic notification' });
  }
});

// Send Notification to Specific Device
app.post('/sendDeviceNotification', async (req, res) => {
  const { topic, title, body } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'topic is required!' });
  }

  const message = {
    topic: topic,
    data: {
      type: 'alarm',
      title: title,
      body: body,
    },
    android: {
      priority: 'high'
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (err) {
    console.error('Error sending topic notification:', err);
    res.status(500).json({ error: 'Failed to send topic notification' });
  }
});

// Export for Vercel
module.exports = app;
