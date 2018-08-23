import { Response } from 'request';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { ApiService } from './api.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
})
export class UserService {
  dataUser: any;
  constructor(private apiService: ApiService) { }

  getData<T>(url: string) {
    return this.apiService.get<T>(url);
  }

  private extractUserData(response: Response) {
    console.log('response :', response);
  }
  private handleError(error: any, caught: Observable<any>): any {
    let message = '';

    if (error instanceof Response) {
      const errorData = error.json() || JSON.stringify(error.json());
      message = `${error.status} - ${error.statusText || ''} ${errorData}`;
    } else {
      message = error.message ? error.message : error.toString();
    }
    console.error(message);
    return Observable.throw(message);
  }
  startTcp() {
    return this.apiService.getT('sever-tcp/start-server');
  }
  stopTcp() {
    return this.apiService.getT('sever-tcp/stop-server');
  }
}
