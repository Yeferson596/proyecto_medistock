import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as service from './products.service';
import * as repo from './products.repository';

vi.mock('./products.repository', () => ({
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn()
}));

describe('Products Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listProducts transforma correctamente la respuesta del repositorio', async () => {
    vi.mocked(repo.getAllProducts).mockResolvedValue({ rows: [{ id: 'p001', name: 'A', sku: 'A1', description: 'X', price: '100', category: 'Med', stock: '10', min_stock: '0', image: 'img' }], rowCount: 1 } as any);

    const products = await service.listProducts();

    expect(products[0].id).toBe('p001');
    expect(products[0].price).toBe(100);
  });

  it('getProduct retorna null cuando no existe', async () => {
    vi.mocked(repo.getProductById).mockResolvedValue({ rows: [], rowCount: 0 } as any);

    const result = await service.getProduct('missing');

    expect(result).toBeNull();
  });

  it('createNewProduct valida precio negativo', async () => {
    await expect(service.createNewProduct({ name: 'Test', sku: 'TST', price: -1 } as any)).rejects.toThrow('price debe ser >= 0');
  });

  it('createNewProduct crea producto con datos válidos', async () => {
    const created = { id: 'p002', name: 'New', sku: 'NEW', description: '', price: 50, category: 'General', stock: 5, min_stock: 0, image: 'img' };
    vi.mocked(repo.createProduct).mockResolvedValue({ rows: [created], rowCount: 1 } as any);

    const result = await service.createNewProduct({ name: 'New', sku: 'NEW', price: 50, stock: 5 } as any);

    expect(result.id).toBe('p002');
    expect(result.price).toBe(50);
  });

  it('updateExistingProduct retorna null si no existe', async () => {
    vi.spyOn(service, 'getProduct').mockResolvedValue(null as any);

    const result = await service.updateExistingProduct('p999', { name: 'No Existe' } as any);

    expect(result).toBeNull();
  });
});