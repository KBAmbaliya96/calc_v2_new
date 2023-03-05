import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';

const dbConfig: DBConfig = {
  name: 'calc_v2',
  version: 1,
  objectStoresMeta: [
    {
      store: 'form',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'address', keypath: 'address', options: { unique: false } },
        { name: 'anrede', keypath: 'anrede', options: { unique: false } },
        { name: 'baujahr', keypath: 'baujahr', options: { unique: false } },
        { name: 'cal_scheme', keypath: 'cal_scheme', options: { unique: false } },
        { name: 'dataObjectUid', keypath: 'dataObjectUid', options: { unique: false } },
        { name: 'dataTrack', keypath: 'dataTrack', options: { unique: false } },
        { name: 'datenschutzhinweise', keypath: 'datenschutzhinweise', options: { unique: false } },
        { name: 'duration_period', keypath: 'duration_period', options: { unique: false } },
        { name: 'e_mail', keypath: 'e_mail', options: { unique: false } },
        { name: 'effective_rate', keypath: 'effective_rate', options: { unique: false } },
        { name: 'fahrgebiet', keypath: 'fahrgebiet', options: { unique: false } },
        { name: 'financing_amount', keypath: 'financing_amount', options: { unique: false } },
        { name: 'first_installment', keypath: 'first_installment', options: { unique: false } },
        { name: 'formToken', keypath: 'formToken', options: { unique: false } },
        { name: 'insurareractive', keypath: 'insurareractive', options: { unique: false } },
        { name: 'land', keypath: 'land', options: { unique: false } },
        { name: 'last_installment', keypath: 'last_installment', options: { unique: false } },
        { name: 'link', keypath: 'link', options: { unique: false } },
        { name: 'monthly_rate', keypath: 'monthly_rate', options: { unique: false } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'nominal_rate', keypath: 'nominal_rate', options: { unique: false } },
        { name: 'objId', keypath: 'objId', options: { unique: false } },
        { name: 'obj_group', keypath: 'obj_group', options: { unique: false } },
        { name: 'objectid', keypath: 'objectid', options: { unique: false } },
        { name: 'objectname', keypath: 'objectname', options: { unique: false } },
        { name: 'objectname_hidden', keypath: 'objectname_hidden', options: { unique: false } },
        { name: 'objectname_input', keypath: 'objectname_input', options: { unique: false } },
        { name: 'plzort', keypath: 'plzort', options: { unique: false } },
        { name: 'purchase_amt_hidden', keypath: 'purchase_amt_hidden', options: { unique: false } },
        { name: 'purchase_amt_input', keypath: 'purchase_amt_input', options: { unique: false } },
        { name: 'telefon', keypath: 'telefon', options: { unique: false } },
        { name: 'total_financing_amt', keypath: 'total_financing_amt', options: { unique: false } },
        { name: 'udata', keypath: 'udata', options: { unique: false } },
        { name: 'usage', keypath: 'usage', options: { unique: false } },
      ]
    }
  ]
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  exports: [
    NgxIndexedDBModule
  ]
})
export class IndexedDbModule { }
