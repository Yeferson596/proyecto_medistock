import cors from 'cors';
import express from 'express';
import { productsRouter } from './modules/products/routes';
import { ordersRouter } from './modules/orders/routes';
import { usersRouter } from './modules/users/routes';
import { bankRouter } from './modules/bank/routes';
import { mercadoPagoRouter } from './modules/mercadopago/routes';
import { authRouter } from './modules/auth/routes';
import { exchangeRouter } from './modules/exchange/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.json';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/bank', bankRouter);
app.use('/api/v1/mercadopago', mercadoPagoRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/exchange', exchangeRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: 'Error interno', detail: err.message });
});
