import { EventEmitter, Injectable } from '@angular/core'; 
import { Exchange } from '../shared/models/exchange';

@Injectable()
export class ExchangeService {
    public exchangeCreated: EventEmitter<Exchange> = new EventEmitter();
    // public ingredientsChanged: EventEmitter<Ingredient[]> = new EventEmitter();

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

    public addGroup(group: Exchange) {
        this.exchanges.push(group);
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
