exports = async function (changeEvent) {
  const product = changeEvent.fullDocument;
  if (!product || !product.id || !product.sku) return;

  const stock = Number(product.stock);
  const minStock = Number(product.minStock);
  if (!Number.isFinite(stock) || !Number.isFinite(minStock)) return;

  const alerts = context.services
    .get('mongodb-atlas')
    .db('medistock')
    .collection('stock_alerts');
  const now = new Date();

  if (stock <= minStock) {
    await alerts.updateOne(
      { productId: product.id, status: 'open' },
      {
        $set: {
          sku: product.sku,
          productName: product.name,
          stock,
          minStock,
          updatedAt: now
        },
        $setOnInsert: {
          productId: product.id,
          status: 'open',
          createdAt: now
        }
      },
      { upsert: true }
    );
    return;
  }

  await alerts.updateMany(
    { productId: product.id, status: 'open' },
    { $set: { status: 'resolved', stock, updatedAt: now } }
  );
};
