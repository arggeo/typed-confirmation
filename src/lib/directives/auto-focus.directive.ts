import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

/**
 * Directive which auto-focuses on inputs.
 */
@Directive({
   selector: '[autoFocus]',
})
export class AutoFocusDirective implements AfterViewInit {
   constructor(
      private _renderer: Renderer2,
      private _element: ElementRef<HTMLInputElement>
   ) {}

   ngAfterViewInit(): void {
      this._renderer.selectRootElement(this._element.nativeElement).focus();
   }
}
