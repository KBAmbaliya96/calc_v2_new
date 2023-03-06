import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment.development';
import { CalcActionsParams } from '../interfaces/calc-actions-params';
import { CalcErrors } from '../interfaces/calc-errors';

import * as crypto from 'crypto-js';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(private storageService: StorageService) { }

  settings: any = {};
  controllerExtensionName: string = 'calc';
  controllerName: string = 'Calculator';

  calcAction(params: CalcActionsParams): Observable<any> {
    let companyName: string = params?.c_name;
    let objectName: string = params?.o_name;
    let price: number = params?.price;
    var objectId: number = params?.obj_id;
    let objStyle: string = params?.style;
    let activeSale: string = params?.activesale;
    let userLoggedIn: string = params?.loggedin;
    let dataObjects = this.storageService.get(environment.clientConfigName);
    let lableJson = dataObjects['labelJson'] ? dataObjects['labelJson'] : {};
    let dataObj: Object | null;
    let formToken: string;
    let ajaxUriForCalc: string;
    let ajaxUriForObjGroup: string;
    let ajaxUriForDurationPeriod: string;
    let noObjectName: boolean;
    let noPrice: boolean;
    let showObjGroupDropdown: boolean;
    let showSchemeDropdown: boolean;
    let showUsageDropdown: boolean;
    let typeOfUsagePrivate: boolean;
    let defaultObjectGroup: Object;
    let defaultCalScheme: Object;
    let defaultTypeOfUsage;
    let allTerms: Object;
    let minPurchaseAmt: number | unknown;
    let maxPurchaseAmt: number | unknown;
    let activate_insurance;
    let insurer_name: string;
    let insurer_email: string;
    let styleObject: {} = {};
    let disagioRate: string = '';
    let activeSellingDetails: Object = {};
    let calculatedData: any;

    if (dataObjects) {
      dataObj = dataObjects;
    } else {
      dataObj = null;
    }

    let userData: CalcActionsParams = {
      c_name: companyName,
      o_name: objectName,
      price: price,
      obj_id: objectId,
      style: objStyle,
      activesale: activeSale,
      saveLoginSession: 1,
      loggedin: userLoggedIn
    }

    let userDataStr = JSON.stringify(userData);
    let calcErrors: CalcErrors = {
      invalidPartnerName: false,
      noTerms: false,
      noStartingMoney: false,
      noCalScheme: false,
      noObjectGroup: false,
      unauthorisedWebpage: false,
      unauthorisedIP: false
    }
    if (!dataObj) {
      calcErrors.invalidPartnerName = true;
      companyName = 'Unknown';
    } else {
      let authorisedUsers: string = dataObj['feUser'] ? dataObj['feUser'] : [];
      // TODO: Need to implement session expiry here along with Client IP and so on.
      if (authorisedUsers) {
        if (userData['saveLoginSession'] == 1) {
          let session_id: number = 0;
          if (!session_id) {
            let maxlifetime: number = 1440;
            // let secure: boolean = true; // if you only want to receive the cookie over HTTPS
            // let httponly: boolean = true; // prevent JavaScript access to session cookie
            // let samesite: string = 'None';
          }
        }
      }

      noObjectName = (objectName == 'undefined' || objectName == '') ? true : false;
      noPrice = (!price || price == 0) ? true : false;

      if (activeSale == 'yes' && !noPrice && !authorisedUsers) {
        activeSellingDetails = this.activeSellingCalculation(dataObj, price);
      }

      if (objStyle != 'undefined' && objStyle != '') {
        let styleObjects: Array<any> = dataObj['newStyle'] ? Object.values(dataObj['newStyle']) : [];
        styleObjects.forEach((Obj) => {
          if (Obj?.name == objStyle) {
            styleObject = Obj
          }
        })
      } else {
        styleObject = Object.values(dataObj['newStyle'])[0];
      }

      if (styleObject) {
        let disagio: number = dataObj['disagio'] ? dataObj['disagio'] : 0;
        disagioRate = this.changeNumberFormat(100 - disagio);
      }

      ajaxUriForCalc = environment.baseUrl + '?type=1599470208';
      ajaxUriForObjGroup = environment.baseUrl + '?type=1599470209';
      ajaxUriForDurationPeriod = environment.baseUrl + '?type=1599470210';

      formToken = this.generateToken(this.controllerExtensionName, this.controllerName, dataObj['uid']);

      typeOfUsagePrivate = (dataObj['typeOfUsage'] == 1) ? false : true;
      showUsageDropdown = (dataObj['typeOfUsage'] > 2 || dataObj['typeOfUsage'] == 0) ? true : false;
      defaultTypeOfUsage = (dataObj['typeOfUsage'] > 2 || dataObj['typeOfUsage'] == 0) ? 1 : dataObj['typeOfUsage'];

      showObjGroupDropdown = false;
      showSchemeDropdown = false;
      
      defaultObjectGroup = Object.values(dataObj['objectGroup'])[0];
      
      if (defaultObjectGroup) {
        
        defaultCalScheme = Object.values(defaultObjectGroup['calculationScheme'])[0];

        if (dataObj['objectGroup'].length > 1) {
          showObjGroupDropdown = true;
          showSchemeDropdown = true;
        } else {
          if (defaultObjectGroup['calculationScheme'].length > 1) {
            showSchemeDropdown = true;
          }
        }
        if (defaultCalScheme) {
          if (!price) {
            price = 100000.0;
          }

          let startingMoneyObj = this.getStartingMoneyObj(price, defaultCalScheme);

          if (startingMoneyObj) {
            let startingMoneyUid = startingMoneyObj['uid'];
            allTerms = Object.values(startingMoneyObj['terms']);
            // FIXME: Need to check terms repository and their function to find by starting money and terms.
            // let allTerms = this.termsRepository.findByStartingMoneyAndTerms(startingMoneyUid, 0);

            if (Object.keys(allTerms).length > 0) {
              let firstInstallmentAmt: number = 0.0;
              let lastInstallmentAmt: number = 0.0;
              let durationPeriod: number = 0;
              calculatedData = this.calculation(price, firstInstallmentAmt, lastInstallmentAmt, durationPeriod, dataObj, defaultCalScheme, startingMoneyObj);
            } else {
              calcErrors.noTerms = true;
            }

          } else {
            calcErrors.noStartingMoney = true;
          }

          minPurchaseAmt = 'minAmount' in defaultCalScheme ? defaultCalScheme['minAmount'] : 0;
          maxPurchaseAmt = 'maxAmount' in defaultCalScheme ? defaultCalScheme['maxAmount'] : 0;

        } else {
          calcErrors.noCalScheme = true;
        }
      } else {
        calcErrors.noObjectGroup = true;
      }

      companyName = (companyName != '' ? companyName : 'Unknown');
    }

    let result = {
      settings: this.settings,
      formToken: formToken,
      activeSellingDetails: activeSellingDetails,
      ajaxUriForCalc: ajaxUriForCalc,
      ajaxUriForObjGroup: ajaxUriForObjGroup,
      ajaxUriForDurationPeriod: ajaxUriForDurationPeriod,
      lableJson: lableJson,
      calculatedData: calculatedData,
      // link: link,
      userData: JSON.parse(userDataStr),
      calcErrors: calcErrors,
      styleObject: styleObject,
      disagioRate: disagioRate,
      noObjectName: noObjectName,
      noPrice: noPrice,
      showObjGroupDropdown: showObjGroupDropdown,
      showSchemeDropdown: showSchemeDropdown,
      showUsageDropdown: showUsageDropdown,
      typeOfUsagePrivate: typeOfUsagePrivate,
      objectName: objectName,
      objectId: objectId,
      price: price,
      dataObject: dataObj,
      defaultObjectGroup: defaultObjectGroup,
      defaultCalScheme: defaultCalScheme,
      defaultTypeOfUsage: defaultTypeOfUsage,
      allTerms: allTerms,
      activate_insurance: dataObj['activateInsurance'],
      insurer_name: dataObj['insurerName'],
      insurer_email: dataObj['insurerEmail'],
    }
    return of(result);
  }

  /**
      * Get appropriate starting money object based on price
      * 
      * @return array
      */
  activeSellingCalculation(dataObj, price): Object {
    // Active selling calculation
    let acFinancingAmt = price;
    let acFirstInstallmentAmt: number = ((dataObj['activeSellingFirstInstallment'] ? dataObj['activeSellingFirstInstallment'] : 0 * price) / 100);
    let acFinalInstallmentAmt: number = ((dataObj['acSellingFinalInstallmentPer'] ? dataObj['acSellingFinalInstallmentPer'] : 0 * price) / 100);

    let acAmountToBeFinanced: number = (price - acFirstInstallmentAmt);

    let acDurationPeriod: number = dataObj['activeSellingTerms'] ? dataObj['activeSellingTerms'] : 0;
    let acBaseRate = dataObj['baseRate'] ? dataObj['baseRate'] : 0;
    let acInstallmentRatePerAnnum = dataObj['activeSellingInstallment'] ? dataObj['activeSellingInstallment'] : 0;
    let acNominalRate: number = (acInstallmentRatePerAnnum + acBaseRate);
    let acEffectiveRate = this.Nom2AIBD(acNominalRate, 12);

    let acInstallmentRatePerMonth: number = ((acInstallmentRatePerAnnum + acBaseRate) / 1200);
    let acMaturity = (dataObj?.calcSchemeAs == 0) ? 1 : 0;

    let acMonthlyRate = this.PMT(acInstallmentRatePerMonth, acDurationPeriod, acAmountToBeFinanced, acFinalInstallmentAmt, acMaturity);

    let activeSellingDetails: Object = {
      acMonthlyRate: acMonthlyRate,
      acFinancingAmt: acFinancingAmt,
      acFirstInstallmentAmt: acFirstInstallmentAmt,
      acFinalInstallmentAmt: acFinalInstallmentAmt,
      acDurationPeriod: acDurationPeriod,
      acNominalRate: acNominalRate,
      acEffectiveRate: acEffectiveRate
    };

    return activeSellingDetails;
  }

  /**
       * Effective Annual Rate Calulation formula
       * 
       * @param float $effective_int
       * @param float $ppy
       * @return float
       */
  Nom2AIBD(effective_int, ppy) {
    let tmpcalc = ((Math.pow((1 + (effective_int / (100 * ppy))), ppy)) - 1) * 100;
    return Math.round(tmpcalc * 100) / 100;
  }

  /**
     * PMT Calulation formula
     * 
     * @param float $instalment_rate
     * @param float $duration
     * @param float $finanacial_amt
     * @param float $salvage
     * @param float $maturity
     * @return float
     */
  PMT(instalment_rate, duration, finanacial_amt, salvage, maturity) {
    let q: number = 1 + instalment_rate;
    let xp: number = Math.pow(q, duration);
    let A: number = (finanacial_amt * xp) - salvage;
    let B: number = (xp - 1) * Math.pow(q, maturity);
    let C: number = (q - 1);

    let monthly_rate: number;
    if (B == 0) {
      monthly_rate = 0;
    } else {
      monthly_rate = (A / B) * C;
    }

    return Math.round(monthly_rate * 100) / 100;
  }

  /**
     * Change number format
     * 
     * @param string $number
     * @return string
     */
  changeNumberFormat(number): string {
    // setlocale(LC_MONETARY, 'de_DE');
    if ((!number || number == "")) {
      number = 0;
    }
    // $formatted = money_format('%.2n', (float) $number);
    // return trim(str_replace("EUR", "", $formatted));
    // let fmt = numfmt_create('de_DE', NumberFormatter:: CURRENCY);
    // return formatted = str_replace("€", "", numfmt_format_currency($fmt, $number, 'EUR'));
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
  }

  generateToken(formName, action = '', formInstanceName = '') {
    if (formName == '') {
      // FIXME: Implement InvalidArgumentException error
      // throw new \InvalidArgumentException('formName must not be empty.', 1294586643);
    }
    let tokenId: string = crypto.HmacSHA1(formName, action, formInstanceName);
    return tokenId;
  }

  /**
     * Get appropriate starting money object based on price
     *
     * @return StartingMoney
     */
  getStartingMoneyObj(price, calScheme) {
    let calSchemeUid: number = 0;
    if ('uid' in calScheme) {
      calSchemeUid = calScheme['uid'];
    }

    let startingMoneyArray = calScheme['startingAmount'] ? calScheme['startingAmount'] : [];
    let startingMoneyCount: number = Object.keys(startingMoneyArray).length;
    startingMoneyArray = Object.values(startingMoneyArray);

    let startingMoneyObj;
    if (startingMoneyCount > 1) {
      for (let i = 0; i < startingMoneyCount; i++) {
        if (price > startingMoneyArray[i]['startingMoney']) {
          if (startingMoneyArray[i + 1]) {
            if (price <= startingMoneyArray[i + 1]['startingMoney']) {
              if (price == startingMoneyArray[i + 1]['startingMoney']) {
                startingMoneyObj = startingMoneyArray[i + 1];
                break;
              } else {
                startingMoneyObj = startingMoneyArray[i];
                break;
              }
            }
            if (price > startingMoneyArray[i + 1]['startingMoney'] &&
              startingMoneyArray[i + 1]['startingMoney'] == startingMoneyArray[startingMoneyCount - 1]['startingMoney']
            ) {
              startingMoneyObj = startingMoneyArray[i + 1];
              break;
            }
          }
        }
        if (price >= startingMoneyArray[i]['startingMoney']) {
          startingMoneyObj = startingMoneyArray[i];
          break;
        } else {
          startingMoneyObj = null;
        }
      }
    } else {
      startingMoneyObj = startingMoneyArray[0];
    }

    return startingMoneyObj;
  }

  /**
     * Calulation
     * 
     * @return array
     */
  calculation(price, firstInstallmentAmt, lastInstallmentAmt, durationPeriod, dataObj, calScheme, startingMoneyObj) {
    let startingMoneyUid: number = null;
    if (startingMoneyObj && startingMoneyObj != '') {
      startingMoneyUid = startingMoneyObj['uid'] ? startingMoneyObj['uid'] : null;
    }

    let allTerms = Object.values(startingMoneyObj['terms']);
    let termsObj = allTerms[0];
    allTerms.forEach((term) => {
      if (term['terms'] == durationPeriod) {
        termsObj = term;
      }
    })

    let baseRate: number = 'baseRate' in dataObj ? dataObj['baseRate'] : 0;
    let calSchemeName = 'name' in calScheme ? calScheme['name'] : 0;
    let maturity = (calSchemeName == 0) ? 1 : 0;

    let showFirstInstallment: boolean = 'showFirstInstallment' in calScheme ? calScheme['showFirstInstallment'] : false;
    let minFirstInstallment: number = ((calScheme['minFirstInstallment'] * price) / 100);
    let maxFirstInstallment: number = ((calScheme['maxFirstInstallment'] * price) / 100);
    let actFirstInstallment = calScheme['firstInstallment'];

    let showLastInstallment: boolean = calScheme['showLastInstallment'];
    let maxLastInstallment: number = ((calScheme['maxLastInstallment'] * price) / 100);
    let actFinalInstallment = calScheme['finalInstallment'];

    let installmentCheck: boolean = calScheme['installmentCheck'];

    firstInstallmentAmt = (firstInstallmentAmt == 0) ? minFirstInstallment : firstInstallmentAmt;

    let installmentRatePerAnnum: number;

    if (termsObj) {
      durationPeriod = termsObj['terms'];

      installmentRatePerAnnum = termsObj['installment'];

      if (actFirstInstallment == 1) {
        let firstInstallmentBasedOnDuration: number = termsObj['firstinstallmentAmt'];
        firstInstallmentAmt = ((price * firstInstallmentBasedOnDuration) / 100);
      }

      if (actFinalInstallment == 1) {
        let finalInstallmentBasedOnDuration: number = termsObj['finalinstallmentAmt'];
        lastInstallmentAmt = ((price * finalInstallmentBasedOnDuration) / 100);
      }
    }

    let amountToBeFinanced: number = (price - firstInstallmentAmt);

    let nominalRate: number = (installmentRatePerAnnum + baseRate);
    let effectiveRate: number = this.Nom2AIBD(nominalRate, 12);

    let installmentRatePerMonth: number = ((installmentRatePerAnnum + baseRate) / 1200);

    let monthlyRate: number = this.PMT(installmentRatePerMonth, durationPeriod, amountToBeFinanced, lastInstallmentAmt, maturity);

    let totalFinancingAmt: number = (durationPeriod * monthlyRate) + lastInstallmentAmt;

    let noOfInstallments: number = durationPeriod;
    if (lastInstallmentAmt > 0) {
      noOfInstallments = (durationPeriod + 1);
    }
    let array_to_return = {
      showFirstInstallment: showFirstInstallment,
      minFirstInstallment: minFirstInstallment,
      maxFirstInstallment: maxFirstInstallment,
      actFirstInstallment: actFirstInstallment,
      showLastInstallment: showLastInstallment,
      maxLastInstallment: maxLastInstallment,
      actFinalInstallment: actFinalInstallment,
      installmentCheck: installmentCheck,
      monthlyRate: monthlyRate,
      firstInstallmentAmt: firstInstallmentAmt,
      lastInstallmentAmt: lastInstallmentAmt,
      amountToBeFinanced: amountToBeFinanced,
      totalFinancingAmt: totalFinancingAmt,
      nominalRate: nominalRate,
      effectiveRate: effectiveRate,
      noOfInstallments: noOfInstallments
    }
    return array_to_return;
  }

}
