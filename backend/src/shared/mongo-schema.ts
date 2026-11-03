import type { Document } from 'mongodb';

export const collectionValidators: Record<string, Document> = {
  products: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name', 'sku', 'description', 'price', 'category', 'stock', 'minStock', 'image'],
      properties: {
        id: { bsonType: 'string' },
        name: { bsonType: 'string', minLength: 1 },
        sku: { bsonType: 'string', minLength: 1 },
        description: { bsonType: 'string' },
        price: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        category: { bsonType: 'string' },
        stock: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        minStock: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        image: { bsonType: 'string' }
      }
    }
  },
  users: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name', 'email', 'role'],
      properties: {
        id: { bsonType: 'string' },
        name: { bsonType: 'string', minLength: 1 },
        email: { bsonType: 'string', minLength: 3 },
        role: { enum: ['admin', 'operator', 'b2b_client', 'customer'] },
        institution: { bsonType: 'string' },
        password: { bsonType: 'string' }
      }
    }
  },
  orders: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'customerId', 'items', 'status', 'total', 'createdAt', 'type'],
      properties: {
        id: { bsonType: 'string' },
        customerId: { bsonType: 'string' },
        items: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['productId', 'quantity', 'price'],
            properties: {
              productId: { bsonType: 'string' },
              quantity: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 1 },
              price: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 }
            }
          }
        },
        status: {
          enum: ['pending', 'paid', 'processing', 'preparing', 'shipped', 'delivered']
        },
        total: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        createdAt: { bsonType: 'string' },
        type: { enum: ['B2C', 'B2B'] },
        metadata: {
          bsonType: 'object',
          properties: {
            paymentMethod: { bsonType: 'string' },
            transactionId: { bsonType: 'string' },
            paidAt: { bsonType: 'string' }
          }
        }
      }
    }
  },
  bank_accounts: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['accountId', 'balance', 'currency'],
      properties: {
        accountId: { bsonType: 'string' },
        balance: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        currency: { bsonType: 'string', minLength: 3, maxLength: 3 }
      }
    }
  },
  bank_transactions: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'accountId', 'type', 'amount', 'description', 'timestamp', 'status'],
      properties: {
        id: { bsonType: 'string' },
        accountId: { bsonType: 'string' },
        type: { enum: ['debit', 'credit'] },
        amount: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        description: { bsonType: 'string' },
        timestamp: { bsonType: 'string' },
        status: { enum: ['success', 'failed'] }
      }
    }
  },
  stock_alerts: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['productId', 'sku', 'productName', 'stock', 'minStock', 'status', 'createdAt', 'updatedAt'],
      properties: {
        productId: { bsonType: 'string' },
        sku: { bsonType: 'string' },
        productName: { bsonType: 'string' },
        stock: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        minStock: { bsonType: ['int', 'long', 'double', 'decimal'], minimum: 0 },
        status: { enum: ['open', 'resolved'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  oracle_sync_outbox: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventId', 'entity', 'entityId', 'createdAt'],
      properties: {
        eventId: { bsonType: 'string' },
        entity: {
          enum: [
            'products',
            'users',
            'orders',
            'bank_accounts',
            'bank_transactions',
            'stock_alerts'
          ]
        },
        entityId: { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
};
