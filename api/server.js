const express = require('express');
const serverless = require('serverless-http');
const items = require('../items'); // items.js in root
const app = express();

app.use(express.json());

// Get all items
app.get('/items', (req, res) => {
  res.json(items);
});

// Place order
app.post('/place-order', (req, res) => {
  try {
    const selectedItems = req.body;

    const courierPrices = [
      { min: 0, max: 500, price: 10 },
      { min: 501, max: 1000, price: 15 },
      { min: 1001, max: 2000, price: 20 }
    ];

    let packages = [];
    let currentItems = [];
    let currentPrice = 0;
    let currentWeight = 0;

    selectedItems.forEach(item => {
      if (currentPrice + item.price >= 250) {
        packages.push({ items: currentItems, totalPrice: currentPrice, totalWeight: currentWeight });
        currentItems = [];
        currentPrice = 0;
        currentWeight = 0;
      }
      currentItems.push(item);
      currentPrice += item.price;
      currentWeight += item.weight;
    });

    if (currentItems.length > 0) {
      packages.push({ items: currentItems, totalPrice: currentPrice, totalWeight: currentWeight });
    }

    packages.forEach(pkg => {
      const courier = courierPrices.find(c => pkg.totalWeight >= c.min && pkg.totalWeight <= c.max);
      pkg.courierPrice = courier ? courier.price : 0;
    });

    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export as serverless handler
module.exports.handler = serverless(app);
