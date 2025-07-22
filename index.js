const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// 代理转发接口（示例: /proxy?url=https://api.deepinfra.com/endpoint）
app.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith('https://api.deepinfra.com')) {
    return res.status(400).send('Invalid or missing DeepInfra URL');
  }

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host // 修复 host 重写
      },
      data: req.body
    });
    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    const code = err.response?.status || 500;
    const msg = err.response?.data || err.message;
    res.status(code).send(msg);
  }
});

app.get('/', (req, res) => res.send('✅ DeepInfra Proxy is ready!'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
