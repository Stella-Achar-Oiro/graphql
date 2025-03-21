const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy API requests to your school's domain
app.use('/api', createProxyMiddleware({
  target: 'https://learn.zone01kisumu.ke',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // no rewrite needed in this case
  },
}));

// Serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});