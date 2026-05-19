import 'dotenv/config';
import { app } from './app';

const PORT = Number(process.env.API_PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`Medistock API running on http://localhost:${PORT}`);
});
