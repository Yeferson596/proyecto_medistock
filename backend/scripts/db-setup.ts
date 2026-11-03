import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { collectionValidators } from '../src/shared/mongo-schema';

const uri = process.env.MONGODB_SCHEMA_URI;
const databaseName = process.env.MONGODB_DB_NAME ?? 'medistock';

const setupDatabase = async () => {
  if (!uri) {
    throw new Error('Define MONGODB_SCHEMA_URI con un usuario que pueda crear/modificar validadores.');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(databaseName);

    for (const [collectionName, validator] of Object.entries(collectionValidators)) {
      const collectionExists = await database
        .listCollections({ name: collectionName }, { nameOnly: true })
        .hasNext();

      if (collectionExists) {
        await database.command({
          collMod: collectionName,
          validator,
          validationLevel: 'strict',
          validationAction: 'error'
        });
      } else {
        await database.createCollection(collectionName, {
          validator,
          validationLevel: 'strict',
          validationAction: 'error'
        });
      }
    }

    console.log(`Validadores NoSQL aplicados a ${Object.keys(collectionValidators).length} colecciones de "${databaseName}".`);
  } finally {
    await client.close();
  }
};

setupDatabase().catch((error: unknown) => {
  console.error('No se pudo configurar el esquema MongoDB:', error);
  process.exitCode = 1;
});
