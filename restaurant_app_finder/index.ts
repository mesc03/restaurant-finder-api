const express = require('express');
const app = express();
const port = 3000;

app.get('/api/execute', async (req, res) => {
  const {message, code } = req.query;

  if (code !== 'pionnerdevai') {
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message parameter is required' })
  }

  try {
    res.json({message: 'route is working!', received: message });
  } catch (error) {
    res.status(500).json({error: 'internal service error' });
  }
});
