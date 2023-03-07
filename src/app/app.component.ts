import { Component } from '@angular/core';

import { PwaService } from './core/services/pwa.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ApiService } from './core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientConfigService } from './core/services/client-config.service';
import { StorageService } from './core/services/storage.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'calc_v2';

  // UI Rendering configurations
  isOnline: boolean = false; // Application's online/offline status
  isShowParamError: boolean = false; // URL's GET parameters status
  isAppInstalled: boolean = false; // Application's PWA installation status
  isIframeOpened: boolean = false; // iFrame hide/shows
  btnlabel = 'Finanzierungsrechner'; /* label for calc button  */

  constructor(
    private pwaService: PwaService,
    private indexDBService: NgxIndexedDBService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private clientConfigService: ClientConfigService,
    private storageService: StorageService
  ) {
    // Check internet connection
    this.pwaService.online$.subscribe((evnt) => {
      this.isOnline = evnt
      if (!this.isOnline) {
        return;
      }
      // Check if forms are stored into indexedDB
      this.indexDBService.getAll('form').subscribe((forms) => {
        console.log('How many forms are stored in IndexedDB: ', forms.length);
        if (forms.length == 0) {
          return;
        }
        // Send forms to API, if forms stored into indexedDB
        this.apiService.sendFormsData(forms).subscribe((res) => {
          if (res) {
            this.toastr.success('Offline submitted forms are submitted successfully', 'Data sent to the server')
          }
        })
      }, (error) => {
        this.toastr.error(error, 'Error')
      })
    });

    // Check PWA is installed
    this.pwaService.installed$.subscribe((evnt) => {
      this.isAppInstalled = evnt;
      // FIXME: add /?c_name=client_name when PWA starts
      if (this.isAppInstalled === true) {
        // Check if URL params and client configuration is stored in local storage
        this.queryParams = this.storageService.get(environment.clientParamsName);
        this.clientConfig = this.storageService.get(environment.clientConfigName);
        if (!this.queryParams || !this.clientConfig) {
          this.isShowParamError = true;
        } else {
          this.router.navigate([''], { queryParams: this.queryParams })
          // console.log('pwa service installed: ', this.queryParams);
          // FIXME: Check if feUsers are configured
          let feUsers: any[] = [];
          if (this.clientConfig['objectfeUser']) {
            feUsers = this.clientConfig['objectfeUser'];
          }
        }
      }
    })

    // Check parameters are passed to get client configuration
    this.activatedRouter.queryParams.subscribe((param) => {
      console.log('activatedRoute param: ', param);
      if (Object.keys(param).length == 0) {
        this.isShowParamError = true;
      } else {
        this.isShowParamError = false;
        // Store URL params for PWA
        this.storageService.set(environment.clientParamsName, param);

        // Get client configuration
        this.getLatestClientConfiguration(param);
      }
    })

  }

  gotoURL() {
    console.log('queryParams: ', this.queryParams);
  }

  queryParams: Object;
  clientConfig: Object;

  getLatestClientConfiguration(params: Object): void {
    this.clientConfigService.getClientConfig(params).subscribe((res) => {
      if (!res) {
        this.toastr.error("Network error occured!", 'Network Error');
        return;
      }
      this.storageService.set(environment.clientConfigName, res);
      let clientConfig = res;
      let feUsers: any[] = [];
      if (clientConfig['objectfeUser']) {
        feUsers = clientConfig['objectfeUser'];
      }

      if (feUsers.length > 0) {
        if (this.storageService.get(environment.feUserLoggedInKey)) {
          if (this.isAppInstalled) {
            this.router.navigate(['private/dashboard'], { queryParams: this.queryParams, queryParamsHandling: 'preserve' });
          } else {
            this.router.navigate(['private/calculator'], { queryParamsHandling: 'preserve' });
          }
        } else {
          this.router.navigate(['public'], { queryParamsHandling: 'preserve' })
        }
      } else {
        if (this.isAppInstalled) {
          this.router.navigate(['private/dashboard'], { queryParams: this.queryParams, queryParamsHandling: 'preserve' });
        } else {
          this.router.navigate(['private/calculator'], { queryParamsHandling: 'preserve' });
        }
      }
    })
  }

  openIframe() {
    this.isIframeOpened = !this.isIframeOpened;
    // console.log("OpenIframe is called: ", this.isIframeOpened);
  }
}
