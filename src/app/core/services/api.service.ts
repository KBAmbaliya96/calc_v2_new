import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  getClientConfig(params: any): Observable<any> {
    return this.http.get(environment.baseUrl + '?type=1599470545', { params: params });
  }

  sendFormsData(data: any): Observable<any> {
    return this.http.post(environment.baseUrl + '?type=1599479875', data);
  }
}
