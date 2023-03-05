import { Injectable, ApplicationRef } from '@angular/core';

import { concat, interval, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClientConfigService {

  constructor(
    private appRef: ApplicationRef,
    private apiService: ApiService
  ) {
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everyHour$ = interval(1 * 60 * 60 * 1000);
    const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$);
  }

  getClientConfig(params: any): Observable<any> {
    return this.apiService.getClientConfig(params);
  }
}
