// api/server.js

const items = [
  { id: 1, name: 'Item 1', price: 120, weight: 200 },
  { id: 2, name: 'Item 2', price: 90,  weight: 300 },
  { id: 3, name: 'Item 3', price: 80,  weight: 250 },
  { id: 4, name: 'Item 4', price: 60,  weight: 280 },
  { id: 5, name: 'Item 5', price: 150, weight: 180 },
  { id: 6, name: 'Item 6', price: 110, weight: 220 },
  { id: 7, name: 'Item 7', price: 200, weight: 350 },
  { id: 8, name: 'Item 8', price: 50,  weight: 100 },
  { id: 9, name: 'Item 9', price: 75,  weight: 120 },
  { id: 10, name: 'Item 10', price: 95, weight: 210 }
];

const courierPrices = [
  { min: 0, max: 500, price: 10 },
  { min: 501, max: 1000, price: 15 },
  { min: 1001, max: 2000, price: 20 }
];

module.exports = (req, res) => {

  if (req.url === '/items' && req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(items));
    return;
  }

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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(packages));
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
};
