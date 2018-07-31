const request = require('request');
import * as dotenv from 'dotenv';
import { SERVER_CONFIG } from './../../server.constants';
dotenv.config();

export class ForexLoader {
    constructor() { }
    getNewFiatPrice(fiatNames: any) {
        console.log('process.env.FOREX_API_KEY :', SERVER_CONFIG.forexApiKey);
        const pairs = fiatNames.toString();
        const urlForexPrices = `https://forex.1forge.com/1.0.3/quotes?pairs=${pairs}&api_key=${SERVER_CONFIG.forexApiKey}`;
        return this.requestToResource(urlForexPrices);
    }
    requestToResource(url: string) {
        return request(url, (error: any, response: any, body: any) => {
        });
    }
    fiatParser(data: any) {
        let forexPrices: any[] = [];
        data = JSON.parse(data);
        for (const iterator in data) {
            forexPrices[data[iterator].symbol] = [data[iterator].bid,
            data[iterator].ask, data[iterator].price];
        }
        // console.log('forexPrices :', forexPrices);
        return forexPrices;
    }
}
