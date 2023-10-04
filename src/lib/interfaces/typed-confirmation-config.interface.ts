import { Nullable } from "../types/nullable.type";

export abstract class TranslationService {
   abstract instant(...args: any): string;
}

export interface WCTranslations {
   modalHeader?: string;
   instructionPrefix?: Nullable<string>;
   instructionSuffix?: Nullable<string>;
   cancelLabel?: string;
   confirmLabel?: string;
   regenerateLabel?: string;
   error?: string;
}

export interface WCClasses {
   cancelBtn?: string;
   confirmBtn?: string;
   regenerateBtn?: string;
}

export interface TCSettings {
   /**
    * Hide modal header.
    */
   hideHeader?: boolean;
   /**
    * Do not display instruction keyword (in text above input).
    */
   hideKeywordIndication?: boolean;
   /**
    * Do not display error message when input is incorrect
    */
   hideErrorMessage?: boolean;
   /**
    * Do not show loader in asynchronously validated modals
    */
   hideLoader?: boolean;
   /**
    * Do not indicate input validity state with colors
    */
   disableInputValidationColors?: boolean;
   /**
    * Do not emit "false" when popup closed without confirming
    */
   disableFalseEmission?: boolean;
   /**
    * The randomly generated text's length
    */
   randomKeywordLength?: number;
   /**
    * Hide random confirmation text regeneration button
    */
   disableRandomRegeneration?: boolean;
   /**
    * Replace white spaces with dashes in confirmation text
    */
   replaceKeywordSpaces?: boolean;
   /**
    * Do not display input placeholder (confirmation text to be entered)
    */
   disablePlaceholder?: boolean;
   /**
    * Disable in and out modal animations
    */
   disableAnimations?: boolean;
   /**
    * Hides instruction keyword, input placeholder and input text
    */
   secretKeyword?: boolean;
   /**
    * Confirmation text is automatically submitted when it is typed correctly
    */
   autoConfirm?: boolean;
   /**
    * The time needed to pass in order to start validation after the user stops typing
    */
   asyncDebounceTime?: number;
}

export interface TCConfig {
   translations?: WCTranslations;
   classes?: WCClasses;
   settings?: TCSettings;
}

export type WCKeys = keyof TCConfig;
export type WCTranslationKeys = keyof WCTranslations;
export type TCOptions = Omit<TCConfig, 'classes'>;