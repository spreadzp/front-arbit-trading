import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { OrderBook } from '../shared/models/orderBook.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
@Injectable()
export class ApiService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: Http, private authService: AuthService) { }

  get<T>(url: string): Observable<T> {
    return this.request(url, RequestMethod.Get);
  }

  getOrderBook() {

  }

  getT(url: string): Observable<any> {
    console.log('url :', this.baseUrl + url);
    return this.request(url, RequestMethod.Get);
  }

  post(url: string, body: Object): Observable<any> {
    console.log('url :', url, body);
    return this.request(url, RequestMethod.Post, body);
  }

  put(url: string, body: Object): Observable<any> {
    return this.request(url, RequestMethod.Put, body);
  }

  delete(url: string, body: Object): Observable<any> {
    return this.request(url, RequestMethod.Delete, body);
  }

  request(url: string, method: RequestMethod, body?: Object): Observable<any> {
    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', `Bearer ${this.authService.getToken()}`);
    const requestOptions = new RequestOptions({
      url: `${this.baseUrl}/${url}`,
      headers: headers,
      method: method
    });

    if (body) {
      requestOptions.body = body;
    }
    const req = new Request(requestOptions);
    return this.http.request(req)
      .map((res: Response) => res.json())
      .catch((error: Response) => this.onRequestError(error));
  }

  onRequestError(err: Response): any {
    const statusCode = err.status;
    //const body = err.json();
    const error = {
      statusCode,
      err
    };

    return Observable.of(error);
  }
}
