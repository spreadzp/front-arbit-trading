import { ArbitrageExchange } from './arbitrageExchange';

export class GroupArbitrage {
    membersArbitrage: ArbitrageExchange[];
    constructor(public idGroup: string) { }
}
