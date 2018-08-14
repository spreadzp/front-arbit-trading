import { EventEmitter, Injectable } from '@angular/core';
import { Ingredient } from '../shared/components/ingredient/ingredient.component';
import { Rate } from '../shared/models/rate';
import { ApiService } from './api.service';
@Injectable()
export class RateService {
    public rateCreated: EventEmitter<Rate> = new EventEmitter();
    //public ingredientsChanged: EventEmitter<Ingredient[]> = new EventEmitter();

    private rates: Rate[] = [
        new Rate('Bitfinex', 0.2, 0.1),
        new Rate('Bittrex', 0.25, 0.2),
        new Rate('HitBtc', 0.2, 0.1)
    ];

    constructor(private apiService: ApiService) { }

    getRates<T>(url: string) {
      return this.apiService.get<T>(url);
    }

   /*  public getRates(): Promise<Rate[]> {
        return new Promise<Rate[]>((resolve, reject) => {
            resolve(this.rates);
        });
    } */

    public addRate(rate: Rate) {
        this.apiService.post('rates/save' , rate);
        //this.rates.push(rate);
        //this.ingredientsChanged.emit(this.ingredients.slice());
    }

    public removeRate(rate: Rate) {
        this.apiService.delete('rates/delete', rate);
        //this.rates.splice(index, 1);
        //this.ingredientsChanged.emit(this.ingredients.slice());
    }

    public addRates(rates: Rate[]): void {
        this.rates.push(...rates);
        //this.ingredientsChanged.emit(this.ingredients.slice());
    }
}
