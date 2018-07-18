import { Pair } from './pair';
import { Member } from './member';

export interface Exchange {
    name: string;
    pairs: Pair[];
    members: Member[];
}
