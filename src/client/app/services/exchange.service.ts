import { subscribe } from 'graphql';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { EventEmitter, Injectable } from '@angular/core';
import { Exchange } from '../shared/models/exchange';
import { ArbitrageExchange } from '../shared/models/arbitrageExchange';

@Injectable()
export class ExchangeService {
    public exchangeCreated: EventEmitter<Exchange> = new EventEmitter();
    public arbitrageExchangeCreated: EventEmitter<ArbitrageExchange> = new EventEmitter();
    // public ingredientsChanged: EventEmitter<Ingredient[]> = new EventEmitter();
    [propName: string]: any;
    private tradeLines: ArbitrageExchange[] = [
        {
            IdGroupArbitrage: 'BTC',
            exchange: 'bitfinex',
            pair: 'BTC/USD',
            memberOfExchange: 'Vasya',
            tradeVolume: 0.01,
            fee: 0.2,
            deviation: 0.05,
            serverName: 'Seul',
            status: 'Connect',
        },
        {
            IdGroupArbitrage: 'BTC',
            exchange: 'bittrex',
            pair: 'BTC/USDT',
            memberOfExchange: 'Kolya',
            tradeVolume: 0.01,
            fee: 0.1,
            deviation: 0.04,
            serverName: 'EU',
            status: 'Connect',
        }
    ];
    percentTable = ['exchange', 'bid', 'ask'];
    headerTableNames = ['select', 'pair', 'exchange', 'memberOfExchange', 'tradeVolume', 'fee', 'deviation', 'serverName', 'status'];
    private exchanges: Exchange[] = [
        {
            name: 'bitfinex',
            pairs: [
                {
                namePair: 'BTC/USD',
                fee: 0.4
            },
            {
                namePair: 'ETH/USD',
                fee: 0.3
            },

        ],
            members: [
                {
                    name: 'name6',
                    login: 'login',
                    password: 'password',
                    key: 'key',
                    secret: 'secret',
                    email: 'email',
                },
                {
                    name: 'name5',
                    login: 'login',
                    password: 'password',
                    key: 'key',
                    secret: 'secret',
                    email: 'email',
                }
            ]
        },
        {
            name: 'bittrex',
            pairs: [
                {
                namePair: 'BTC/USDT',
                fee: 0.3
            },
            {
                namePair: 'ETH/USDT',
                fee: 0.2
            },
        ],
            members: [
                {
                    name: 'name1',
                    login: 'login1',
                    password: 'password1',
                    key: 'key1',
                    secret: 'secret1',
                    email: 'email1',
                },
                {
                    name: 'name2',
                    login: 'login',
                    password: 'password',
                    key: 'key',
                    secret: 'secret',
                    email: 'email',
                }
            ]
        }
    ];

    constructor() { }

    public getCurrrentGroup(): Promise<Exchange[]> {
        return new Promise<Exchange[]>((resolve, reject) => {
            resolve(this.exchanges);
        });
    }

    public getCurrrentTradeLines(): Observable<ArbitrageExchange[]> {
        return  Observable.of(this.tradeLines);
    }

    public getHeaderTableNames(nameTable: string): Observable<string[]> {
        return Observable.of(this[nameTable]);
    }

    public getHeaderTable(): Observable<string[]> {
        return Observable.of(this.headerTableNames);
    }

    public addTradeLine(group: ArbitrageExchange) {
        this.tradeLines.push(group);
        console.log('this.tradeLines :', this.tradeLines );
        // this.ingredientsChanged.emit(this.ingredients.slice());
    }

    public removeMemberArbitrage(index: number) {
        this.exchanges.splice(index, 1);
        // this.ingredientsChanged.emit(this.ingredients.slice());
    }

    public addMemberArbitrage(newGroup: Exchange[]): void {
        this.exchanges.push(...newGroup);
        // this.ingredientsChanged.emit(this.ingredients.slice());
    }

}
