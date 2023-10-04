import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TypedConfirmationDirective } from './directives/typed-confirmation.directive';
import { TypedConfirmationPlaceholderDirective } from './directives/typed-confirmation-placeholder.directive';
import { TypedConfirmationModalComponent } from './components/typed-confirmation-modal.component';
import { TCConfig, TCOptions } from './interfaces/typed-confirmation-config.interface';
import { TCService } from './services/typed-confirmation.service';
import { CONFIG_TOKEN } from './config.token';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { MatchValueValidatorDirective } from './directives/match-value-validator.directive';
import { MatchValueValidatorAsyncDirective } from './directives/match-value-validator-async.directive';

/**
 * The core module of the library
 */
@NgModule({
   declarations: [
      TypedConfirmationDirective,
      TypedConfirmationPlaceholderDirective,
      TypedConfirmationModalComponent,
      AutoFocusDirective,
      MatchValueValidatorDirective,
      MatchValueValidatorAsyncDirective,
   ],
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule
   ],
   exports: [
      TypedConfirmationDirective,
      TypedConfirmationPlaceholderDirective,
   ]
})
export class TypedConfirmationModule {
   /**
    * Configures the module to function according to the settings provided.
    * 
    * @param config The root module configuration.
    * @returns Module with providers.
    */
   static forRoot(config: TCConfig): ModuleWithProviders<TypedConfirmationModule> {
      return {
         ngModule: TypedConfirmationModule,
         providers: [
            TCService,
            {
               provide: CONFIG_TOKEN,
               useFactory: (wcs: TCService) => {
                  wcs.setConfig(config);
                  return config;
               },
               deps: [TCService]
            },
         ]
      };
   }

   static forChild(options: TCOptions, merge?: boolean): ModuleWithProviders<TypedConfirmationModule> {
      return {
         ngModule: TypedConfirmationModule,
         providers: [
            {
               provide: CONFIG_TOKEN,
               useFactory: (wcs: TCService) => {
                  const config = structuredClone(wcs.getConfig() || {});

                  if (!options) {
                     return config;
                  }

                  if (merge) {
                     let { translations: rootTranslations, settings: rootSettings } = config;
                     config.translations = { ...rootTranslations, ...options?.translations };
                     config.settings = { ...rootSettings, ...options?.settings };
                     return config;
                  }

                  if (options.translations) {
                     config.translations = options.translations;
                  }

                  if (options.settings) {
                     config.settings = options.settings;
                  }
                  
                  return config;
               },
               deps: [TCService]
            }
         ]
      };
   }
}