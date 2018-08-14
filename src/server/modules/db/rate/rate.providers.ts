import { RateSchema } from './shemas/rate.shema';
import { Connection } from 'mongoose';
const DB_PROVIDER = 'DbConnectionToken';

export const ratesProviders = [
  {
    provide: 'RateModelToken',
    useFactory: (connection: Connection) => connection.model('Rate', RateSchema),
    inject: [DB_PROVIDER],
  },
];
