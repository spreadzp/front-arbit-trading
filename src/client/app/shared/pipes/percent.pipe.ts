import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'spread-percent'
})
export class PercentPipe implements PipeTransform {

    transform(likes: any, term: any): any {

        for (let i = 0; i < likes.length; i++) {
            if (likes[i] === term) {
                return "liked";
            } else {
                return "";
            }
        }
    }
}
