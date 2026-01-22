const http = require('http');
const fs = require('fs');
const items = require('./items'); // import items.js
// const items = [
//   { id: 1, name: 'Item 1', price: 120, weight: 200 },
//   { id: 2, name: 'Item 2', price: 90,  weight: 300 },
//   { id: 3, name: 'Item 3', price: 80,  weight: 250 },
//   { id: 4, name: 'Item 4', price: 60,  weight: 280 }
// ];

const courierPrices = [
  { min: 0, max: 500, price: 10 },
  { min: 501, max: 1000, price: 15 },
  { min: 1001, max: 2000, price: 20 }
];

const server = http.createServer((req, res) => {

  // Serve frontend
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('index.html', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Get items
  if (req.url === '/items' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
    return;
  }

  // Place order
  if (req.url === '/place-order' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const selectedItems = JSON.parse(body);

      let packages = [];
      let currentItems = [];
      let currentPrice = 0;
      let currentWeight = 0;

      selectedItems.forEach(item => {
        if (currentPrice + item.price >= 250) {
          packages.push({
            items: currentItems,
            totalPrice: currentPrice,
            totalWeight: currentWeight
          });
          currentItems = [];
          currentPrice = 0;
          currentWeight = 0;
        }
        currentItems.push(item);
        currentPrice += item.price;
        currentWeight += item.weight;
      });

      if (currentItems.length > 0) {
        packages.push({
          items: currentItems,
          totalPrice: currentPrice,
          totalWeight: currentWeight
        });
      }

      packages.forEach(pkg => {
        const courier = courierPrices.find(
          c => pkg.totalWeight >= c.min && pkg.totalWeight <= c.max
        );
        pkg.courierPrice = courier ? courier.price : 0;
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(packages));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
