import * as mongoose from 'mongoose';
import { SERVER_CONFIG } from '../../server.constants';
require('dotenv').config();
const DB_PROVIDER = 'DbConnectionToken';

export const databaseProviders = [
    {
        provide: DB_PROVIDER,
        useFactory: async () => {
            (mongoose as any).Promise = global.Promise;
            return await mongoose.connect(SERVER_CONFIG.db);
        },
    },
];