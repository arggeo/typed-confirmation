import { ChangeDetectorRef, Directive, Input } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject, finalize, map, of, switchMap, tap, timer } from 'rxjs';
import { AsyncValidationFn } from '../types/validation.types';
import { Nullable } from '../types/nullable.type';

/**
 * Implements AsyncValidator to be used on input fields in template forms
 * by adding the `matchValueValidatorAsync` attribute.
 * Internally uses `matchValueValidatorAsync`.
 */
@Directive({
   selector: '[matchValueValidatorAsync]',
   providers: [
      {
         provide: NG_ASYNC_VALIDATORS,
         useExisting: MatchValueValidatorAsyncDirective,
         multi: true,
      },
   ],
})
export class MatchValueValidatorAsyncDirective implements AsyncValidator {
   @Input('fn') fn: AsyncValidationFn;
   @Input('debounceTime') debounceTime: number;
   @Input('callback') callback: () => {};
   @Input('cdr') cdr: ChangeDetectorRef;

   constructor() {}

   validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
      return matchValueValidatorAsync(this.fn)(control);
   }
}

/**
 * Checks wether the provided value matches the input value.
 *
 * @param observable The observable used to validate the input
 * @returns Async validator function
 */
export function matchValueValidatorAsync(
      observable: AsyncValidationFn,
      debounceTime?: Nullable<number>,
      callback?: Function,
      firstValidation?: Subject<boolean>,
      cdr?: ChangeDetectorRef
   ): AsyncValidatorFn {
   debounceTime ??= 500;

   return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if ([null, ''].includes(control.value))
         return of({ mismatch: true });

      control.setErrors([{ mismatch: true }]);

      return timer(debounceTime!).pipe(
         tap(() => {
            control.markAsPending();
            cdr?.markForCheck();
         }),
         switchMap(() => observable(control.value)),
         map(response => {
            firstValidation?.next?.(true);

            if (
                  typeof response === 'boolean' && response ||
                  typeof response === 'object' && response.success
               ) {
                  setTimeout(() => {
                     callback?.();
                  }, 300);
                  return null;
               }

            return { mismatch: true };
         }),
         finalize(() => cdr?.markForCheck())
      );
   };
}
