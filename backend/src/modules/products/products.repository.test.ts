import { describe, it, expect, vi, beforeEach } from 'vitest';
import { query } from '../../shared/db';
import * as repo from './products.repository';

vi.mock('../../shared/db', () => ({
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  pool: { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }), connect: vi.fn() }
}));

describe('Products Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllProducts ejecuta la consulta correcta', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p001', name: 'Teste', sku: 'TST', description: 'desc', price: 10, category: 'cat', stock: 5, min_stock: 0, image: 'img' }], rowCount: 1 } as any);

    const result = await repo.getAllProducts();

    expect(query).toHaveBeenCalledWith('SELECT * FROM products ORDER BY name');
    expect(result.rows[0].id).toBe('p001');
  });

  it('getProductById consulta por id', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p002', name: 'Otro', sku: 'OTR' }], rowCount: 1 } as any);

    const result = await repo.getProductById('p002');

    expect(query).toHaveBeenCalledWith('SELECT * FROM products WHERE id = $1', ['p002']);
    expect(result.rows[0].name).toBe('Otro');
  });

  it('createProduct inserta producto en BD', async () => {
    const product = {
      id: 'p010',
      name: 'Nuevo',
      sku: 'NEW',
      description: 'desc',
      price: 100,
      category: 'General',
      stock: 12,
      minStock: 1,
      image: 'img'
    };
    vi.mocked(query).mockResolvedValue({ rows: [product], rowCount: 1 } as any);

    const result = await repo.createProduct(product as any);

    expect(query).toHaveBeenCalledWith(
      'INSERT INTO products (id, name, sku, description, price, category, stock, min_stock, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [product.id, product.name, product.sku, product.description, product.price, product.category, product.stock, product.minStock, product.image]
    );
    expect(result.rows[0].id).toBe('p010');
  });

  it('updateProduct actualiza el registro', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p010', name: 'Cambiado' }], rowCount: 1 } as any);

    const result = await repo.updateProduct('p010', { name: 'Cambiado' } as any);

    expect(query).toHaveBeenCalledWith(
      'UPDATE products SET name = $1, sku = $2, description = $3, price = $4, category = $5, stock = $6, min_stock = $7, image = $8 WHERE id = $9 RETURNING *',
      ['Cambiado', undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'p010']
    );
    expect(result.rows[0].name).toBe('Cambiado');
  });

  it('deleteProduct borra el producto', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p010' }], rowCount: 1 } as any);

    const result = await repo.deleteProduct('p010');

    expect(query).toHaveBeenCalledWith('DELETE FROM products WHERE id = $1 RETURNING *', ['p010']);
    expect(result.rows[0].id).toBe('p010');
  });

  it('decreaseProductStock decrementa stock correctamente', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p010', stock: 8 }], rowCount: 1 } as any);

    const result = await repo.decreaseProductStock('p010', 2);

    expect(query).toHaveBeenCalledWith('UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING *', [2, 'p010']);
    expect(result.rows[0].stock).toBe(8);
  });

  it('increaseProductStock incrementa stock correctamente', async () => {
    vi.mocked(query).mockResolvedValue({ rows: [{ id: 'p010', stock: 12 }], rowCount: 1 } as any);

    const result = await repo.increaseProductStock('p010', 2);

    expect(query).toHaveBeenCalledWith('UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *', [2, 'p010']);
    expect(result.rows[0].stock).toBe(12);
  });
});