require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = process.env.DB_FILE || './inventory.db';
const db = new sqlite3.Database(DB_FILE);

// init tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT,
    image TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    old_stock INTEGER,
    new_stock INTEGER,
    changed_by TEXT,
    timestamp TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );`);
});

// Multer for uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Helpers
const toCSV = (rows, headers) => {
  const head = headers.join(',') + '\n';
  const lines = rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  return head + lines;
};

/* ---------- Routes ---------- */

// GET all products (optionally support ?category, pagination later)
app.get('/api/products', (req, res) => {
  const q = `SELECT * FROM products ORDER BY id DESC`;
  db.all(q, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Search by name (partial, case-insensitive)
app.get('/api/products/search', (req, res) => {
  const name = req.query.name || '';
  const q = `SELECT * FROM products WHERE LOWER(name) LIKE ? ORDER BY id DESC`;
  db.all(q, [`%${name.toLowerCase()}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Export CSV
app.get('/api/products/export', (req, res) => {
  db.all('SELECT name, unit, category, brand, stock, status, image FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const csvData = toCSV(rows, ['name','unit','category','brand','stock','status','image']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.send(csvData);
  });
});

// Import CSV - only insert new by name (case-insensitive)
app.post('/api/products/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const filePath = req.file.path;
  const added = [];
  const skipped = [];
  const duplicates = [];

  const stream = fs.createReadStream(filePath)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }));

  stream.on('data', (row) => {
    stream.pause();
    // expected headers: name,unit,category,brand,stock,status,image
    const name = (row.name || '').trim();
    if (!name) { stream.resume(); return; }
    const unit = row.unit || '';
    const category = row.category || '';
    const brand = row.brand || '';
    const stock = Number(row.stock || 0);
    const status = row.status || '';
    const image = row.image || '';

    db.get('SELECT id FROM products WHERE LOWER(name)=?', [name.toLowerCase()], (err, existing) => {
      if (err) { stream.resume(); return; }
      if (existing) {
        skipped.push(name);
        duplicates.push({ name, existingId: existing.id });
        stream.resume();
      } else {
        db.run(`INSERT INTO products (name,unit,category,brand,stock,status,image) VALUES (?,?,?,?,?,?,?)`,
          [name,unit,category,brand,stock,status,image], function(err2) {
            if (!err2) added.push({ name, id: this.lastID });
            stream.resume();
        });
      }
    });
  });

  stream.on('end', () => {
    // remove file
    fs.unlinkSync(filePath);
    res.json({ added: added.length, skipped: skipped.length, duplicates });
  });

  stream.on('error', (e) => {
    res.status(500).json({ error: e.message });
  });
});

// Update product (PUT /api/products/:id)
app.put('/api/products/:id',
  body('name').notEmpty(),
  body('stock').isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number(req.params.id);
    const { name, unit, category, brand, stock, status, image, changedBy } = req.body;

    db.get('SELECT * FROM products WHERE id=?', [id], (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product) return res.status(404).json({ error: 'Product not found' });

      db.get('SELECT id FROM products WHERE LOWER(name)=? AND id<>?', [name.toLowerCase(), id], (err2, dup) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (dup) return res.status(400).json({ error: 'Name already used by another product' });

        const oldStock = product.stock;
        const q = `UPDATE products SET name=?,unit=?,category=?,brand=?,stock=?,status=?,image=? WHERE id=?`;
        db.run(q, [name,unit,category,brand,stock,status,image,id], function(uerr) {
          if (uerr) return res.status(500).json({ error: uerr.message });

          if (Number(oldStock) !== Number(stock)) {
            db.run(`INSERT INTO inventory_logs (product_id, old_stock, new_stock, changed_by, timestamp)
                    VALUES (?,?,?,?,?)`, [id, oldStock, stock, changedBy || 'admin', new Date().toISOString()]);
          }

          db.get('SELECT * FROM products WHERE id=?', [id], (e, updated) => {
            res.json(updated);
          });
        });
      });
    });
  });

// Get inventory history
app.get('/api/products/:id/history', (req, res) => {
  const id = Number(req.params.id);
  db.all('SELECT old_stock AS oldStock, new_stock AS newStock, changed_by AS changedBy, timestamp FROM inventory_logs WHERE product_id=? ORDER BY timestamp DESC', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM products WHERE id=?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
