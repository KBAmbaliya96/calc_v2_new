import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/core/services/storage.service';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private storageService: StorageService) {
    this.clientConfig = this.storageService.get(environment.clientConfigName);
    this.lableJson = this.clientConfig['labelJson'];
  }
  clientConfig = {}
  lableJson: any[] = []; // data will be assigned from calculator component

  /**
   * It will return translated word into selected language
   * @param word which you want to translate
   * @param language language name
   * @returns translated word into selected language
   */
  getLabel(key: string): string {
    let file: Object;
    let body: Object;
    let transUnit: Array<Object>;

    if ('file' in this.lableJson) {
      file = this.lableJson['file'];
    }

    if (file.hasOwnProperty('body')) {
      body = file['body'];
    }

    if (body.hasOwnProperty('trans-unit')) {
      transUnit = body['trans-unit'];
    }

    for (let i = 0; i < transUnit.length; i++) {
      if (transUnit[i]['@attributes']['id'] === key) {
        return transUnit[i]['source'];
      }
    }

    return "";
  }
}
