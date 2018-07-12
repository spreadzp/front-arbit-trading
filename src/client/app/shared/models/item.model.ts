import { Document } from 'mongoose';

export class Item extends Document {
    readonly name: string;
    readonly price: number;
}
