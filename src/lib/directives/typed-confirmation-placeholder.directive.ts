import { AfterViewInit, Directive, ViewContainerRef } from '@angular/core';
import { TCService } from '../services/typed-confirmation.service'

/**
 * Marks an element as the parent of the modal when
 * typedConfirmationPlaceholder attribute is added.
 */
@Directive({
   selector: '[typedConfirmationPlaceholder]',
})
export class TypedConfirmationPlaceholderDirective implements AfterViewInit {
   
   constructor(
      private _vcRef: ViewContainerRef,
      private _TCService: TCService
   ) {}

   ngAfterViewInit(): void {
      this._TCService.sendViewRef(this._vcRef);
   }
}
