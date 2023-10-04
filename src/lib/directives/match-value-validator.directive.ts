import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/**
 * Implements Validator to be used on input fields in template forms
 * by adding the `matchValueValidator` attribute.
 * Internally uses `matchValueValidator`.
 */
@Directive({
   selector: '[matchValueValidator]',
   providers: [
      {
         provide: NG_VALIDATORS,
         useExisting: MatchValueValidatorDirective,
         multi: true
      }
   ]
})
export class MatchValueValidatorDirective implements Validator {
   @Input('matchValueValidator') value = '';
   
   constructor() {}

   validate(control: AbstractControl<any, any>): ValidationErrors | null {
      return matchValueValidator(this.value)(control);
   }
}

/**
 * Checks wether the provided value matches the input value.
 * 
 * @param value The value which has to be matched
 * @returns Validator function
 */
export function matchValueValidator(value: any): ValidatorFn {
   return (control: AbstractControl): ValidationErrors | null => {
      return value !== control.value ? { mismatch: true } : null;
   }
}
