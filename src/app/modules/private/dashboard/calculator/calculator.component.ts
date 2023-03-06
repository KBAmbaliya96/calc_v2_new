import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormFields } from 'src/app/core/interfaces/form-fields';
import { environment } from 'src/environments/environment.development';
import { StorageService } from 'src/app/core/services/storage.service';
import { CalculationsService } from 'src/app/core/services/calculations.service';
import { CalcActionsParams } from 'src/app/core/interfaces/calc-actions-params';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ApiService } from 'src/app/core/services/api.service';
import { TranslationService } from 'src/app/shared/services/translation.service';
import { CalcErrors } from 'src/app/core/interfaces/calc-errors';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private calculationsService: CalculationsService,
    private indexDBService: NgxIndexedDBService,
    private apiService: ApiService,
    private traslationService: TranslationService,
    private router: Router
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.params = params;
    })
    this.getCalcActions();
  }
  status: boolean = false;
  params: any;

  routerSnapshot = this.activatedRoute.snapshot.params

  isPageZeroActive: boolean = true;
  isPageOneActive: boolean = false;
  isPageTwoActive: boolean = false;

  isMonthDropdownFocused: boolean = false;

  isObjectname_inputFocused: boolean = false;
  isObjectname_inputFilled: boolean = false;

  objectname_input: FormFields = { isShow: false, isFocused: false, isFilled: false }
  purchase_amt_input: FormFields = { isShow: false, isFocused: false, isFilled: false }
  calc_field_167: FormFields = { isShow: false, isFocused: false, isFilled: false }
  duration_period: FormFields = { isShow: false, isFocused: false, isFilled: false }
  monthly_rate: FormFields = { isShow: false, isFocused: false, isFilled: false }
  insurareractive: FormFields = { isShow: false, isFocused: false, isFilled: false }
  fahrgebiet: FormFields = { isShow: false, isFocused: false, isFilled: false }
  insurareractiveNotValid: boolean = false;
  baujahrNotValid: boolean = false;
  datenschutzhinweiseNotValid: boolean = false;


  dataObject: Object = {};
  lableJson: any[] = [];
  noObjectName: boolean = true;
  noPrice: boolean = false;
  showObjGroupDropdown: boolean = false;
  showUsageDropdown: boolean = false;
  showSchemeDropdown: boolean = false;
  styleObject: any[] = [];
  activeSellingDetails: Object = {};
  formFields: any[] = [];

  selected: string = '';

  showFormOnError: boolean = false;
  validationResults: Object = {};
  calcErrors: CalcErrors = {
    invalidPartnerName: false,
    noTerms: false,
    noStartingMoney: false,
    noCalScheme: false,
    noObjectGroup: false,
    unauthorisedWebpage: false,
    unauthorisedIP: false
  };

  calculationForm: FormGroup = this.formBuilder.group({
    formToken: [''],
    udata: [''],
    link: [''],
    objId: [''],
    dataObjectUid: [''],
    obj_group: [''],
    cal_scheme: [''],
    usage: [''],
    dataTrack: [''],
    objectname_input: [''],
    purchase_amt_input: [''],
    objectname_hidden: [''],
    objectname: [''],
    objectid: [''],
    purchase_amt_hidden: [''],
    monthly_rate: [''],
    first_installment: [''],
    last_installment: [''],
    duration_period: ['36 Monate'],
    financing_amount: [''],
    total_financing_amt: [''],
    effective_rate: [''],
    nominal_rate: [''],
    insurareractive: [false],
    baujahr: [''],
    fahrgebiet: [''],
    datenschutzhinweise: [false],
  })

  stepZeroActivate() {
    this.isPageOneActive = false;
    this.isPageTwoActive = false;
    this.isPageZeroActive = true;
  }

  stepOneActivate() {
    this.isPageZeroActive = false;
    this.isPageTwoActive = false;
    this.isPageOneActive = true;
  }

  stepTwoActivate() {
    this.isPageZeroActive = false;
    this.isPageOneActive = false;
    this.isPageTwoActive = true;
  }

  isFieldFocused(eventType: string): boolean {
    if (eventType === 'blur') {
      return false;
    }
    return true;
  }

  isDatenschutzhinweiseValid(): boolean {
    return !this.calculationForm.value.datenschutzhinweise;
  }

  isFieldFilled(fieldName: string): boolean {
    if (this.calculationForm.get(fieldName)?.value == '') {
      if (fieldName == 'baujahr') {
        this.baujahrNotValid = true;
      }
      if (fieldName == 'fahrgebiet') {
        this.insurareractiveNotValid = true;
      }
      return false;
    }
    if (fieldName == 'baujahr') {
      this.baujahrNotValid = false;
    }
    if (fieldName == 'fahrgebiet') {
      this.insurareractiveNotValid = false;
    }
    return true;
  }

  onDuratinPeriodChange() {

    this.activatedRoute.queryParams.subscribe((params) => {
      this.routerSnapshot = params;
    })
    let price: number = this.routerSnapshot['price'] ? this.routerSnapshot['price'] : 0;
    let firstInstallmentAmt: number = 0.0;
    let lastInstallmentAmt: number = 0.0;
    let durationPeriod: number = this.calculationForm.value.duration_period;
    let dataObj: Object = this.storageService.get(environment.clientConfigName) ? this.storageService.get(environment.clientConfigName) : {};
    let calculationScheme: Object = Object.values(dataObj['objectGroup'])[0];
    let defaultCalScheme: Object = Object.values(calculationScheme['calculationScheme'])[0];
    let startingMoneyObj: Object = this.calculationsService.getStartingMoneyObj(price, defaultCalScheme);
    let calculations = this.calculationsService.calculation(price, firstInstallmentAmt, lastInstallmentAmt, durationPeriod, dataObj, defaultCalScheme, startingMoneyObj);
    this.dataObject['calculatedData'] = calculations;
    
    this.calculationForm.patchValue({
      monthly_rate: this.dataObject['calculatedData']['monthlyRate'],
      first_installment: this.dataObject['calculatedData']['firstInstallmentAmt'],
      last_installment: this.dataObject['calculatedData']['lastInstallmentAmt'],
      financing_amount: this.dataObject['calculatedData']['amountToBeFinanced'],
      total_financing_amt: this.dataObject['calculatedData']['totalFinancingAmt'],
      effective_rate: this.dataObject['calculatedData']['effectiveRate'],
      nominal_rate: this.dataObject['calculatedData']['nominalRate'],
    })
  }

  getCalcActions() {
    // let params: CalcActionsParams = {
    //   c_name: this.params['c_name'] ? this.params['c_name'] : '',
    //   o_name: this.params['o_name'] ? this.params['o_name'] : '',
    //   price: this.params['price'] ? this.params['price'] : 0,
    //   obj_id: this.params['obj_id'] ? this.params['obj_id'] : 0,
    //   activesale: this.params['activesale'] ? this.params['activesale'] : '',
    //   loggedin: this.params['loggedin'] ? this.params['loggedin'] : '',
    //   saveLoginSession: this.params['saveLoginSession'] ? this.params['saveLoginSession'] : 0,
    //   style: this.params['style'] ? this.params['style'] : ''
    // }
    this.calculationsService.calcAction(this.params).subscribe((res) => {
      if (res) {
        this.dataObject = res;
      }
    });

    if (this.dataObject['noObjectName'] === true || this.dataObject['noPrice'] === true || this.dataObject['showObjGroupDropdown'] === true || this.dataObject['showUsageDropdown'] === true || this.dataObject['showSchemeDropdown'] == true) {
      this.isPageZeroActive = true;
    } else {
      this.isPageOneActive = true;
    }

    if (this.dataObject.hasOwnProperty("dataObject")) {
      if (this.dataObject['dataObject'].hasOwnProperty("objectGroup")) {
        this.dataObject['dataObject']['objectGroup'] = Object.values(this.dataObject['dataObject']['objectGroup'])
      }
      if (this.dataObject['dataObject'].hasOwnProperty("form")) {
        if (this.dataObject['dataObject']['form'].hasOwnProperty("fields")) {
          this.dataObject['dataObject']['form']['fields'] = Object.values(this.dataObject['dataObject']['form']['fields']);
          for (let i = 0; i < this.dataObject['dataObject']['form']['fields'].length; i++) {
            this.calculationForm.addControl(this.dataObject['dataObject']['form']['fields'][i]['marker'], new FormControl());
            this.dataObject['dataObject']['form']['fields'][i]['options'] = this.dataObject['dataObject']['form']['fields'][i]['options'].split("\r\n");
          }
        }
      }
    }

    if (this.dataObject.hasOwnProperty("defaultObjectGroup")) {
      if (this.dataObject["defaultObjectGroup"].hasOwnProperty("calculationScheme")) {
        this.dataObject['defaultObjectGroup']['calculationScheme'] = Object.values(this.dataObject['defaultObjectGroup']['calculationScheme']);
      }
    }

    if ('calcErrors' in this.dataObject) {
      // this.calcErrors = this.dataObject['calcErrors'];
    }
    if (this.dataObject.hasOwnProperty('showObjGroupDropdown')) {
      this.showObjGroupDropdown = this.dataObject['showObjGroupDropdown'];
    }
    if (this.dataObject.hasOwnProperty('showSchemeDropdown')) {
      this.showSchemeDropdown = this.dataObject['showSchemeDropdown'];
    }
    if (this.dataObject.hasOwnProperty("showUsageDropdown")) {
      this.showUsageDropdown = this.dataObject['showUsageDropdown'];
    }
    if (this.dataObject.hasOwnProperty('noObjectName')) {
      this.objectname_input.isShow = this.dataObject['noObjectName'];
    }

    console.log('Does dataObject containes lableJson: ', this.dataObject.hasOwnProperty("lableJson"))

    if (this.dataObject.hasOwnProperty("lableJson")) {
      this.lableJson = JSON.parse(this.dataObject['lableJson']);
      this.traslationService.lableJson = this.dataObject['lableJson'];
    }

    this.calculationForm.patchValue({
      formToken: this.dataObject['formToken'],
      udata: this.dataObject['userData'],
      link: this.dataObject['link'],
      objId: this.dataObject['objectId'],
      dataObjectUid: this.dataObject['dataObject']['uid'],
      obj_group: this.dataObject['defaultObjectGroup']['uid'],
      cal_scheme: this.dataObject['defaultCalScheme']['uid'],
      usage: this.dataObject['defaultTypeOfUsage'],
      dataTrack: 111,
      objectname_input: this.dataObject['objectName'],
      purchase_amt_input: this.dataObject['price'],
      objectname_hidden: this.dataObject['objectName']['objectId'],
      objectname: this.dataObject['objectName'],
      objectid: this.dataObject['objectId'],
      purchase_amt_hidden: this.dataObject['price'],
      monthly_rate: this.dataObject['calculatedData']['monthlyRate'],
      first_installment: this.dataObject['calculatedData']['firstInstallmentAmt'],
      last_installment: this.dataObject['calculatedData']['lastInstallmentAmt'],
      duration_period: 36,
      financing_amount: this.dataObject['calculatedData']['amountToBeFinanced'],
      total_financing_amt: this.dataObject['calculatedData']['totalFinancingAmt'],
      effective_rate: this.dataObject['calculatedData']['effectiveRate'],
      nominal_rate: this.dataObject['calculatedData']['nominalRate'],
      anrede: 'Herr',
      name: ''
    })
    this.duration_period.isFilled = true;
    this.calc_field_167.isFilled = true; // Anrede

  }

  formSubmit() {
    let form: Object = {};
    if (this.calculationForm.value.datenschutzhinweise == false) {
      this.datenschutzhinweiseNotValid = true;
      return;
    } else {
      this.datenschutzhinweiseNotValid = false;
    }
    if (this.status) {
      form['form'] = this.calculationForm.value;
      form['formToken'] = this.calculationForm.value['formToken'];
      form['udata'] = this.calculationForm.value['udata'];
      delete form['form']['formToken'];
      delete form['form']['udata'];
      console.log("You are online!", form)
      this.apiService.sendFormsData(form).subscribe((res) => {
        console.log(res);
      })
    }
    else {
      form['form'] = this.calculationForm.value;
      form['formToken'] = this.calculationForm.value['formToken'];
      form['udata'] = this.calculationForm.value['udata'];
      delete form['form']['formToken'];
      delete form['form']['udata'];
      console.log("You are offline!", form);
      this.indexDBService.add('form', form).subscribe((key) => { console.log('Key: ', key) })
      this.indexDBService.getAll('form').subscribe(
        (forms) => {
          console.log(forms)
        },
        (error) => {
          console.error(error)
        }
      )
    }
  }

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

    for (let i = 0; i <= transUnit.length; i++) {
      if (transUnit[i]['@attributes']['id'] === key) {
        return transUnit[i]['source'];
      }
    }

    return "";
  }
}
