import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor() { }
  
  argon2 = require('node_modules/argon2-browser/dist/argon2-bundled.min.js')

  logIn(payload: any) {

  }
}
