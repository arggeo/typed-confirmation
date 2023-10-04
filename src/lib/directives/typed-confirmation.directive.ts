import { DestroyRef, Directive, ElementRef, EventEmitter, HostListener, Inject, Injector, Input, OnInit, Output, Renderer2, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TCService } from '../services/typed-confirmation.service';
import { TypedConfirmationModalComponent } from '../components/typed-confirmation-modal.component';
import { CONFIG_TOKEN } from '../config.token'; 
import { ConfirmationEvent } from '../interfaces/confirmation-event.interface';
import { TCOptions, TCConfig } from '../interfaces/typed-confirmation-config.interface';
import { TCSettings } from '../interfaces/typed-confirmation-config.interface';
import { AsyncValidationFn } from '../types/validation.types';
import { generateRandomString } from '../utils/strings';

/**
 * Connects the button with the modal.
 */
@Directive({
   selector: 'button[typedConfirmation]',
})
export class TypedConfirmationDirective implements OnInit {
   /**
    * Creates a TypedConfirmationModalComponent component on host click.
    * 
    * @param event Mouse click event
    */
   @HostListener('click', ['$event']) createModal(event: MouseEvent) { // change method name
      if (this._placeholderRef) {
         this._placeholderRef.clear();

         const injector = Injector.create({
            providers: [
               {
                  provide: CONFIG_TOKEN,
                  useValue: this._generatedConfig
               }
            ]
         });

         const modal = this._placeholderRef.createComponent(TypedConfirmationModalComponent, { injector });
         modal.setInput('keyword', this.keyword);
         modal.setInput('random', !this._keywordProvided && typeof this.keyword === 'string');
         modal.setInput('linkageId', this._linkageId);
         modal.setInput('self', modal);
      }
   }

   @Input('typedConfirmation') keyword: string | AsyncValidationFn;
   @Input('options') options: TCOptions;
   
   @Output('onConfirmation') onConfirmation: EventEmitter<ConfirmationEvent> = new EventEmitter();

   private _placeholderRef: ViewContainerRef;
   private _linkageId: string;
   private _keywordProvided = false;
   private _settings: TCSettings;
   private _generatedConfig: TCConfig;

   constructor(
      @Inject(CONFIG_TOKEN) private _config: TCConfig,
      private _TCService: TCService,
      private _element: ElementRef<HTMLButtonElement>,
      private _renderer: Renderer2,
      private _destroyRef: DestroyRef
   ) {
      
   }

   ngOnInit(): void {
      this._generateConfig();

      if (typeof this.keyword === 'string') {
         this._keywordProvided = !!this.keyword;
      
         if (this._keywordProvided && this._generatedConfig?.settings?.replaceKeywordSpaces) {
            this.keyword = this.keyword.replaceAll(' ', '-');
         }
         
         this.keyword ||= generateRandomString(this._generatedConfig?.settings?.randomKeywordLength || 8);
      }

      this._TCService.container$.pipe(take(1)).subscribe(ref => {
         this._placeholderRef = ref;
      });

      this._renderer.addClass(this._element.nativeElement, 'no-confirmation-action');

      this._linkageId = generateRandomString(8);
      this._TCService
         .link(this._linkageId)
         .pipe(takeUntilDestroyed(this._destroyRef))
         .subscribe(confirmation => {
            if (this._generatedConfig.settings?.disableFalseEmission && !confirmation)
               return;

            this.onConfirmation.emit({
               id: this._linkageId,
               value: confirmation,
               element: this._element.nativeElement
            });

            this._renderer.setAttribute(
               this._element.nativeElement,
               'class',
               confirmation ? 'confirmed' : 'not-confirmed'
            );
         });
   }

   /**
    * Generates the configuration by merging root configuration and individual options.
    */
   private _generateConfig() {
      let { translations, classes, settings } = this._config;
      translations = { ...translations, ...this.options?.translations };
      settings = { ...settings, ...this.options?.settings };
      this._generatedConfig = { translations, classes, settings };
   }
}
