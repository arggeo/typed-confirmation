import {
   AfterViewInit,
   ChangeDetectionStrategy,
   ChangeDetectorRef,Component,
   ComponentRef,
   DestroyRef,
   ElementRef,
   HostBinding,
   Inject,
   Input,
   OnDestroy,
   OnInit,
   Renderer2,
   ViewChild,
   ViewEncapsulation
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { pairwise, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WCTranslations, WCClasses, TCSettings, TCConfig, TCOptions } from '../interfaces/typed-confirmation-config.interface';
import { TCService } from '../services/typed-confirmation.service';
import { CONFIG_TOKEN } from '../config.token';
import { animate, query, style, transition, trigger, state, group } from '@angular/animations';
import { matchValueValidator } from '../directives/match-value-validator.directive';
import { generateRandomString } from '../utils/strings';
import { AsyncValidationFn } from '../types/validation.types';
import { matchValueValidatorAsync } from '../directives/match-value-validator-async.directive';

/**
 * Modal component containing the text confirmation interface
 * Displays input element and cancellation, confirmation and random string generation buttons
 */
@Component({
   selector: 'typed-confirmation-modal',
   template: `
      <div class="tc-wrapper">
         <div class="tc-modal" [ngClass]="settings.hideHeader ? 'no-header': ''">
            <div *ngIf="!settings.hideHeader" class="tc-modal-header">
               <span>{{ translations.modalHeader || 'Please confirm your action' }}</span>
            </div>
            <div class="tc-modal-body">
               <div class="loader-wrapper" *ngIf="isAsync && !settings.hideLoader">
                  <div [ngClass]="{ 'loader': true, 'loading': inputText.pending }"></div>
               </div>
               <span class="instruction">
                  {{ translations.instructionPrefix === null ? '' : translations.instructionPrefix || 'Type in' }}
                  <span class="confirmation-text" *ngIf="!settings.hideKeywordIndication && !settings.secretKeyword && !isAsync">{{ keyword }}</span>
                  {{ translations.instructionSuffix === null ? '' :  translations.instructionSuffix || 'to confirm' }}
               </span>
               <!-- check if error class present at the beginning -->
               <div class="inputs-wrapper" #inputsWrapper>
                  <input
                     #mainInput
                     [type]="settings.secretKeyword ? 'password' : 'text'"
                     [ngClass]="{
                        'main-input': true,
                        'input-error': inputText.dirty && (inputText.invalid && !inputText.pending) && (!isAsync || isAsync && validatedOnce),
                        'input-success': inputText.valid,
                        'color-changing': !settings.disableInputValidationColors
                     }"
                     [formControl]="inputText"
                     (keydown.enter)="onConfirm()"
                     (paste)="false"
                     autoFocus
                  />
                  <input
                     *ngIf="!settings.secretKeyword && !settings.disablePlaceholder && !isAsync"
                     class="placeholder-input"
                     [placeholder]="rightProgress ? keyword : ''"
                     disabled />
               </div>
               <span class="error" *ngIf="!settings.hideErrorMessage && (inputText.dirty && inputText.invalid && !inputText.pending) && (!isAsync || isAsync && validatedOnce)">
                  {{ translations.error || 'Incorrect input provided' }}
               </span>
            </div>
            <div class="tc-modal-footer">
               <div *ngIf="random && !settings.disableRandomRegeneration" class="secondary-buttons">
                  <button [ngClass]="classes.regenerateBtn" (click)="regenerateKeyword()">{{ translations.regenerateLabel || 'Regenarate' }}</button>
               </div>
               <div class="primary-buttons">
                  <button [ngClass]="classes.cancelBtn" (click)="onCancel()">
                     {{ translations.cancelLabel || 'Cancel' }}
                  </button>
                  <button
                     *ngIf="!settings.autoConfirm"
                     [ngClass]="classes.confirmBtn"
                     [disabled]="inputText.invalid || inputText.pending"
                     (click)="onConfirm()"
                  >{{ translations.confirmLabel || 'Confirm' }}</button>
               <div>
            </div>
         </div>
      </div>
   `,
   styles: [`
      :host {
         position: fixed;
         top: 0;
         left: 0;
         width: 100vw;
         height: 100vh;
         z-index: 9999;
         
         * {
            box-sizing: border-box;
         }
      }

      .tc-wrapper {
         display: flex;
         justify-content: center;
         align-items: center;
         width: 100%;
         height: 100%;
         background-color: rgba(0, 0, 0, .75);
         backdrop-filter: blur(1px);
      }

      .tc-modal {
         position: relative;
         width: 50%;
         min-width: 420px;
         max-width: 615px;
         border-radius: 10px;
         background-color: #fff;
         box-shadow: 0 0 5px 5px rgba(0, 0, 0, .3);

         &.no-header {
            .tc-modal-body {
               border-top: none;
            }  
         }
      }

      .tc-modal-header,
      .tc-modal-body,
      .tc-modal-footer {
         padding: 1rem;
      }

      .tc-modal-header {
         font-weight: bold;

         span {
            font-size: 1.15rem;
         }
      }

      .tc-modal-body {
         position: relative;
         border-width: 1px 0 1px 0;
         border-style: solid;
         border-color: #ccc;

         .loader-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            width: 100%;

            .loader {
               display: inline-block;
               position: relative;
               width: 100%;
               height: 2px;
               opacity: 0;
               overflow: hidden;
               animate: opacity .12s ease;

               &.loading {
                  opacity: 1;
               }

               &::after {
                  content: '';  
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 96px;
                  height: 2px;
                  background: #ccc;
                  box-sizing: border-box;
                  animation: hitZak 0.6s ease-in-out infinite alternate;
               }
            }
         }

         .instruction {
            display: inline-block;
            margin-bottom: .5em;

            .confirmation-text {
               font-weight: bold;
               color: #a8a8a8;
            }
         }

         .inputs-wrapper {
            position: relative;

            input {
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               height: auto;

               &.main-input {
                  z-index: 100;
                  background-color: transparent;

                  &.color-changing {
                     transition: all .08s ease;

                     &.input-error {
                        border-color: #be4a4a;
                     }

                     &.input-success {
                        border-color: #84be4a;
                     }
                  }
               }

               &.placeholder-input {
                  z-index: 0;
                  border-color: transparent;

                  &::placeholder {
                     color: #a8a8a8;
                  }
               }
            }
         }

         .error {
            display: inline-block;
            margin-top: .5rem;
            font-size: .9rem;
            color: #be4a4a;
         }
      }

      .tc-modal-footer {
         display: flex;
         justify-content: space-between;

         .secondary-buttons {
            display: flex;
            justify-content: flex-start;
         }

         .primary-buttons {
            display: flex;
            justify-content: flex-end;
            flex: 1;
         }

         button {
            font-size: 1rem;
            margin: 0 5px;
         }
      }

      @keyframes rotation {
         0% {
            transform: rotate(0deg);
         }
         100% {
            transform: rotate(360deg);
         }
      }

      @keyframes hitZak {
         0% {
            left: 0;
            transform: translateX(-1%);
         }
         100% {
            left: 100%;
            transform: translateX(-99%);
         }
      }
   `],
   animations: [
      trigger('fadeInOut', [
         transition('void => *', [
            group([
               query(':self', [
                  state('in', style({ opacity: 1 })),
                  style({ opacity: 0 }),
                  animate('.12s ease-out')
               ]),
               query('.tc-modal', [
                  state('in', style({ transform: 'translateY(0)' })),
                  style({ transform: 'translateY(-35px)' }),
                  animate('.12s ease')
               ]),
            ])
         ]),
         transition('* => void', [  
            group([
               query(':self', [
                  animate('.12s ease-out'),
                  style({ opacity: 0 })
               ]),
               query('.tc-modal', [
                  animate('.12s ease'),
                  style({ transform: 'translateY(-35px)' })
               ]),
            ])
         ])
      ])
   ],
   encapsulation: ViewEncapsulation.Emulated,
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypedConfirmationModalComponent implements OnInit, AfterViewInit, OnDestroy {
   @Input('keyword') keyword: string | AsyncValidationFn;
   @Input('random') random = false;
   @Input('options') options: TCOptions = {};
   @Input('linkageId') id: string;
   @Input('self') self: ComponentRef<TypedConfirmationModalComponent>;

   @HostBinding('@fadeInOut')
   @HostBinding('@.disabled') animations: boolean = false;

   @ViewChild('inputsWrapper', { static: true }) inputsWrapper: ElementRef<HTMLDivElement>;
   @ViewChild('mainInput', { static: true }) mainInput: ElementRef<HTMLInputElement>;

   public inputText: FormControl<string | null>;
   public isAsync: boolean = false;
   public confirmed: boolean = false;
   public rightProgress: boolean = true;
   public validatedOnce: boolean = false;
   public translations: WCTranslations = {};
   public classes: WCClasses = {};
   public settings: TCSettings = {};

   private _bodyOverflowY: string;

   constructor(
      @Inject(CONFIG_TOKEN) private _config: TCConfig,
      private _tcService: TCService,
      private _renderer: Renderer2,
      private _destroyRef: DestroyRef,
      private _cdr: ChangeDetectorRef
   ) {
      this.translations = this._config.translations ?? {};
      this.classes = this._config.classes ?? {};
      this.settings = this._config.settings ?? {};
      this.animations = this.settings.disableAnimations ?? false;
   }

   ngOnInit(): void {
      this.isAsync = typeof this.keyword !== 'string';
      this.inputText = new FormControl('', ...this._getValidator(this.keyword));
      
      if (!this.isAsync) {
         this.inputText.valueChanges.pipe(
            startWith(''),
            pairwise(),
            takeUntilDestroyed(this._destroyRef)
         ).subscribe(([previousValue, currentValue]) => {
            if (currentValue === '' && previousValue !== currentValue) {
               this.inputText.reset();
            }
   
            this.rightProgress = currentValue === '' || (this.keyword as string).startsWith(currentValue as string);
            
            if (this.settings.autoConfirm && currentValue === this.keyword) {
               setTimeout(() => {
                  this.onConfirm();
               }, 300);
            }
         });
      }

      this._tcService.inputValidatedOnce().subscribe(validated => {
         this.validatedOnce = validated;
      });
   }

   ngAfterViewInit(): void {
      this._renderer.setStyle(
         this.inputsWrapper.nativeElement,
         'height',
         this.mainInput.nativeElement.offsetHeight + 'px'
      );
      this._bodyOverflowY = document.body.style.overflowY;
      this._renderer.setStyle(document.body, 'overflow-y', 'hidden');
   }

   ngOnDestroy(): void {
      if (this._bodyOverflowY) {
         this._renderer.setStyle(document.body, 'overflow-y', this._bodyOverflowY);
      } else {
         this._renderer.removeStyle(document.body, 'overflow-y');
      }
   }

   /**
    * Performs operations when the modal is confirmed.
    */
   public onConfirm() {
      if (!this.inputText.valid)
         return;

      this._tcService.sendConfirmation(this.id, true);
      this._selfDestruct();
   }

   /**
    * Performs operations when the modal confirmation is cancelled.
    */
   public onCancel() {
      if (!this.settings.disableFalseEmission) {
         this._tcService.sendConfirmation(this.id, false);
      }
      
      this._selfDestruct();
   }

   /**
    * Generates a random keyword to be used for confirmation and resets the input.
    */
   public regenerateKeyword() {
      const newText = generateRandomString(this.settings?.randomKeywordLength || 8);
      this.keyword = newText;
      this.inputText.reset('');
      this.inputText.clearValidators();
      this.inputText.addValidators(matchValueValidator(this.keyword));
   }

   /**
    * Performs self destruction of the component.
    */
   private _selfDestruct() {
      this.self.destroy();
   }

   /**
    * 
    * @param value The value the input will get validated against or the function which will validate the input.
    * @returns Sync or async validators
    */
   private _getValidator(value: string | AsyncValidationFn) {
      if (!this.isAsync) {
         return [matchValueValidator(value)];
      }

      return [
         Validators.minLength(4),
         matchValueValidatorAsync(
            value as AsyncValidationFn,
            this.settings?.asyncDebounceTime,
            this.settings.autoConfirm ? this.onConfirm.bind(this) : () => {},
            this._tcService.fireInput,
            this._cdr
            )
         ];
   }
}
