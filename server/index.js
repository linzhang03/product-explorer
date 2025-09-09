import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8088; // fixed typo (was POST)
const DATA_PATH = path.join(__dirname, 'products.json');

const app = express();
app.use(cors());
app.use(express.json());

function loadProducts() {
	try {
		const buf = fs.readFileSync(DATA_PATH, 'utf-8');
		return JSON.parse(buf);
	} catch (err) {
		console.error('Failed to load products:', err.message);
		return [];
	}
}

function writeProducts(list) {
	fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
}
function nextId(list) {
	return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
}
function skuLookup(list, sku) {
	const key = String(sku || '').trim().toLowerCase();
	return list.find(p => (p.sku || '').toLowerCase() === key);
}

// Simple health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// GET /categories
app.get('/categories', (req, res) => {
	const items = loadProducts();
	const categories = [...new Set(items.map(p => p.category))].sort();
	res.json(categories);
});

// --- SKU existence
// GET /sku/exists?sku=SKU-123
app.get('/sku/exists', (req, res) => {
	const { sku } = req.query;
	const items = loadProducts();
	const found = skuLookup(items, sku);
	res.json(found ? { exists: true, id: found.id } : { exists: false });
});

// GET /products (search/filter/sort/paginate)
// Query: q, category (csv), inStock (true/false), sort (price|name|id), order (asc|desc), page, pageSize
app.get('/products', (req, res) => {
	let { q = '', category = '', inStock, sort = 'id', order = 'asc', page = '1', pageSize = '20' } = req.query;
	const qlc = String(q).trim().toLowerCase();
	const categories = String(category).split(',').filter(Boolean);
	const stockFilter = typeof inStock === 'string' ? inStock.toLowerCase() : undefined; // 'true'|'false'|undefined
	const pageNum = Math.max(parseInt(page, 10) || 1, 1);
	const size = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);

	let items = loadProducts();

	if (qlc) {
		items = items.filter(p =>
			p.name.toLowerCase().includes(qlc) ||
			p.category.toLowerCase().includes(qlc)
		);
	}

	if (categories.length) {
		const set = new Set(categories.map(c => c.toLowerCase()));
		items = items.filter(p => set.has(p.category.toLowerCase()));
	}

	if (stockFilter === 'true') {
		items = items.filter(p => p.stock > 0);
	} else if (stockFilter === 'false') {
		items = items.filter(p => p.stock === 0);
	}

	const compare = (a, b, key, dir) => {
		const va = a[key];
		const vb = b[key];
		if (typeof va === 'string' && typeof vb === 'string') {
			const r = va.localeCompare(vb);
			return dir === 'asc' ? r : -r;
		}
		if (va < vb) return dir === 'asc' ? -1 : 1;
		if (va > vb) return dir === 'asc' ? 1 : -1;
		return 0;
	};

	const sortable = new Set(['price', 'name', 'id']);
	if (!sortable.has(sort)) sort = 'id';
	order = order === 'desc' ? 'desc' : 'asc';
	items.sort((a, b) => compare(a, b, sort, order));

	const total = items.length;
	const start = (pageNum - 1) * size;
	const paged = items.slice(start, start + size);

	res.json({ total, page: pageNum, pageSize: size, items: paged });
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
	const items = loadProducts();
	const found = items.find(p => p.id === id);
	if (!found) return res.status(404).json({ message: 'Not found' });
	const related = items.filter(p => p.category === found.category && p.id !== found.id).slice(0, 6);
	res.json({ product: found, related });
});

// --- Update product
app.put('/products/:id', (req, res) => {
	const id = Number(req.params.id);
	const payload = req.body || {};
	const list = loadProducts();
	const idx = list.findIndex(p => p.id === id);
	if (idx === -1) return res.status(404).json({ message: 'Not found' });


	if (payload.sku) {
		const dupe = skuLookup(list, payload.sku);
		if (dupe && dupe.id !== id) {
		return res.status(409).json({ message: 'SKU already exists', id: dupe.id });
		}
	}

	const existing = list[idx];
	const updated = {
		...existing,
		name: payload.name ?? existing.name,
		category: payload.category ?? existing.category,
		price: payload.price != null ? Number(payload.price) : existing.price,
		stock: payload.inStock != null
		? (payload.inStock ? Math.max(1, Number(payload.stock ?? existing.stock ?? 1)) : 0)
		: (payload.stock != null ? Number(payload.stock) : existing.stock),
		sku: payload.sku ?? existing.sku,
		tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : (existing.tags || []),
		};
		if ((updated.category === 'Lighting') && (payload.lumens != null)) {
		updated.lumens = Number(payload.lumens);
		}
		if (updated.category !== 'Lighting') {
		delete updated.lumens;
	}

	list[idx] = updated;
	writeProducts(list);
	res.json(updated);
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));