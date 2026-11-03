import 'dotenv/config';
import { app } from './app';
import { connectToDatabase } from './shared/db';
import { connectToOracleSync } from './shared/oracle-sync';

const PORT = Number(process.env.API_PORT ?? 4000);

const startServer = async () => {
  await connectToDatabase();
  await connectToOracleSync();
  app.listen(PORT, () => {
    console.log(`Medistock API running on http://localhost:${PORT}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('No se pudo iniciar Medistock:', error);
  process.exitCode = 1;
});
