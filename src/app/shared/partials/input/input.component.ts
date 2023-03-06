import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ControlContainer, FormControl } from '@angular/forms';
import { FormFields } from 'src/app/core/interfaces/form-fields';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputComponent,
      multi: true
    }
  ]
})
export class InputComponent implements OnInit, ControlValueAccessor {
  constructor(
    private controlContainer: ControlContainer,
    private translationService: TranslationService
  ) { }

  @Input() formControlName: string = '';
  @Input() isNotValid: boolean = false;
  @Input() mandatory: boolean = false;
  @Input() marker: string = '';
  @Input() multiselect: boolean = false;
  @Input() multiselectForField: string = '';
  @Input() name: string = '';
  @Input() options: any[] = [];
  @Input() pdfRef: string = '';
  @Input() pid: number = 0;
  @Input() senderEmail: boolean = false;
  @Input() senderName: boolean = false;
  @Input() senderSalutation: boolean = false;
  @Input() uid: number = 0;
  @Input() validation: 0 | 1 = 0;
  @Input() validationConfiguration: string = '';
  @Input() parentValue: string = '';
  @Output('keyupEvent') keyupEvent = new EventEmitter();

  field: FormFields = { isShow: false, isFocused: false, isFilled: false }

  control!: FormControl;
  onChange: any = () => { };
  onTouched: any = () => { };

  @Input('value') _value = "";
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }
  get value() {
    return this._value;
  }

  ngOnInit(): void {
    if (this.controlContainer.control) {
      this.control = this.controlContainer.control.get(this.marker) as FormControl;
    }
    // this.field.isFilled = this.isFieldFilled('some_name');
  }

  writeValue(event: Event) {
    if (event) {
      if (typeof event === "string") {
        this.value = event;
        // this.value.trim();
      } else {
        const element = event.currentTarget as HTMLInputElement
        this.value = element?.value;
      }
      this.keyupEvent.emit(event);
    }
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  isFieldFocused(eventType: string): boolean {
    if (eventType === 'blur') {
      return false;
    }
    return true;
  }

  isFieldFilled(): boolean {
    if (this.value == '') {
      this.isNotValid = true;
      return false;
    }
    this.isNotValid = false;
    return true;
  }

  getLabel(key: string): string {
    return this.translationService.getLabel(key);
  }
}
