import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CheckComponent } from './partials/check/check.component';
import { DateComponent } from './partials/date/date.component';
import { InputComponent } from './partials/input/input.component';
import { RadioComponent } from './partials/radio/radio.component';
import { SelectComponent } from './partials/select/select.component';
import { SubmitComponent } from './partials/submit/submit.component';
import { TextareaComponent } from './partials/textarea/textarea.component';

import { ReactiveFormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    CheckComponent,
    DateComponent,
    InputComponent,
    RadioComponent,
    SelectComponent,
    SubmitComponent,
    TextareaComponent
  ],
  imports: [
    CommonModule,
    // BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    ReactiveFormsModule,
    ToastrModule,
    HttpClientModule
  ]
})
export class SharedModule { }
