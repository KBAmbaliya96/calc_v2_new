import { Injectable } from '@angular/core';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  online$: Observable<boolean>;
  installed$: Observable<boolean>;

  constructor() {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
    );
    this.installed$ = merge(
      of(window.matchMedia('(display-mode: standalone)').matches)
    )
  }
}
