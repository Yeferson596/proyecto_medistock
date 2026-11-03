(async function () {
  const demoProducts = [
    {
      id: 'demo-product-mask',
      name: 'Mascarillas demo',
      sku: 'DEMO-MSK-001',
      description: 'Producto de ejemplo para demostrar MongoDB.',
      price: 4990,
      category: 'Insumos clinicos',
      stock: 12,
      minStock: 5,
      image: 'https://picsum.photos/seed/demo-mask/400/400'
    },
    {
      id: 'demo-product-gloves',
      name: 'Guantes demo',
      sku: 'DEMO-GLV-001',
      description: 'Producto de ejemplo con stock bajo.',
      price: 8500,
      category: 'Insumos clinicos',
      stock: 2,
      minStock: 5,
      image: 'https://picsum.photos/seed/demo-gloves/400/400'
    }
  ];

  for (const product of demoProducts) {
    await db.collection('products').updateOne(
      { sku: product.sku },
      { $setOnInsert: product },
      { upsert: true }
    );
  }

  const lowStockCursor = db.collection('products').find({
    $expr: { $lte: ['$stock', '$minStock'] }
  });

  for await (const product of lowStockCursor) {
    printjson({
      sku: product.sku,
      name: product.name,
      stock: product.stock,
      minStock: product.minStock
    });
  }
})().catch((error) => {
  print(`Error ejecutando el bloque de ejemplo: ${error.message}`);
  throw error;
});
