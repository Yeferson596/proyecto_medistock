import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
  find: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  findOneAndDelete: vi.fn()
}));

vi.mock('../../shared/db', () => ({
  getCollection: mocks.getCollection,
  dbResult: (rows: unknown[]) => ({ rows, rowCount: rows.length })
}));

import * as repo from './products.repository';

describe('Products Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCollection.mockReturnValue({
      find: mocks.find,
      findOne: mocks.findOne,
      insertOne: mocks.insertOne,
      findOneAndUpdate: mocks.findOneAndUpdate,
      findOneAndDelete: mocks.findOneAndDelete
    });
  });

  it('lista productos ordenados por nombre', async () => {
    const products = [{ id: 'p001', name: 'Producto' }];
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ toArray: mocks.toArray });
    mocks.toArray.mockResolvedValue(products);

    const result = await repo.getAllProducts();

    expect(mocks.getCollection).toHaveBeenCalledWith('products');
    expect(mocks.find).toHaveBeenCalledWith({}, { projection: { _id: 0 } });
    expect(mocks.sort).toHaveBeenCalledWith({ name: 1 });
    expect(result.rows).toEqual(products);
  });

  it('busca producto por id', async () => {
    const product = { id: 'p002', name: 'Otro' };
    mocks.findOne.mockResolvedValue(product);

    const result = await repo.getProductById('p002');

    expect(mocks.findOne).toHaveBeenCalledWith({ id: 'p002' }, { projection: { _id: 0 } });
    expect(result.rows[0]).toEqual(product);
  });

  it('crea producto', async () => {
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

    const result = await repo.createProduct(product);

    expect(mocks.insertOne).toHaveBeenCalledWith(product);
    expect(result.rows[0]).toEqual(product);
  });

  it('actualiza solo los campos definidos', async () => {
    const product = { id: 'p010', name: 'Cambiado' };
    mocks.findOneAndUpdate.mockResolvedValue(product);

    const result = await repo.updateProduct('p010', { name: 'Cambiado', sku: undefined });

    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'p010' },
      { $set: { name: 'Cambiado' } },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    expect(result.rows[0]).toEqual(product);
  });

  it('elimina producto por id', async () => {
    const product = { id: 'p010' };
    mocks.findOneAndDelete.mockResolvedValue(product);

    const result = await repo.deleteProduct('p010');

    expect(mocks.findOneAndDelete).toHaveBeenCalledWith({ id: 'p010' }, { projection: { _id: 0 } });
    expect(result.rows[0]).toEqual(product);
  });
});
