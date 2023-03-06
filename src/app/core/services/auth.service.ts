import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment.development';
import { PwaService } from './pwa.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storageSerivce: StorageService,
    private pwaService: PwaService,
    private router: Router
  ) { }

  argon2 = require('node_modules/argon2-browser/dist/argon2-bundled.min.js');

  logIn(payload: any) {
    let clientName = payload['clientName'];
    let userName = payload['userName'];
    let password = payload['password'];

    let clientConfig = this.storageSerivce.get(environment.clientConfigName);
    let feUsers: any[] = [];
    if (clientConfig['objectfeUser']) {
      feUsers = clientConfig['objectfeUser'];
    }

    feUsers.forEach((feUser) => {
      if (clientConfig['companyName'] == clientName && feUser['username'] == userName) {
        if (feUser['password'] != '') {
          let feUserPassword = feUser['password'];
          // FIXME: argon2i hash verify code cose here
          this.storageSerivce.set(environment.feUserLoggedInKey, true);
          this.pwaService.installed$.subscribe((event) => {
            if (event) {
              this.router.navigate(['private/dashboard'], { queryParamsHandling: 'preserve' })
            } else {
              this.router.navigate(['private/calculator'], { queryParamsHandling: 'preserve' })
            }
          })
        }
      }
    })
  }
}
