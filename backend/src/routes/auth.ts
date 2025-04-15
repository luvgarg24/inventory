import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
  const { passkey } = req.body;
  if (passkey === process.env.DASHBOARD_PASSKEY) {
    res.json({ success: true, token: 'valid-session' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid passkey' });
  }
});

export default router;
