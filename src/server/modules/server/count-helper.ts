export class CountHelper {
    constructor() {}

    getMaxBid(arr: any) {
        let len = arr.length, max = -Infinity;
        while (len--) {
            if (Number(arr[len].bids) > max) {
                max = Number(arr[len].bids);
            }
        }
        return max;
    }

    getMinAsk(arr: any) {
        let len = arr.length, min = Infinity;
        while (len--) {
            if (Number(arr[len].asks) < min) {
                min = Number(arr[len].asks);
            }
        }
        return min;
    }
}