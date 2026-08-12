const http = require('http');

const data = JSON.stringify({
  items: [
    {
      id: "MI0035",
      name: "Royal Kundan Choker",
      price: "₹3,400",
      quantity: 1
    }
  ],
  contact: { email: "test@example.com", phone: "1234567890" },
  shipping: {
    fullName: "Test User",
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    zip: "123456",
    country: "IN"
  },
  payment: "COD"
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/checkout',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
