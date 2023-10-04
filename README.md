# Typed Confirmation
**Angular library**  
A github-like action confirmation modal where a user is required to confirm an action by typing in specific text - but on steroids.

## Installation
`npm i typed-confirmation`  
*Angular **v16 or greater** required*

## Demos
[Browse demos (incl. code examples)](https://arggeo.github.io/typed-confirmation-lib/)  
You can highly customize the modal through a wide variety of settings and settings combinations.  
*Demos are just a few examples.*

## Notes
This library was created out of necessity and I decided to enchance it and release it to the public. Due to lack of time it couldn't be documented as good as possible. It will be properly documented, better optimized and get enchanced with more features once I find the time to do so. 

## How to use
All fields are optional and have default values if not set.  
*Translations that can receive null value will be hidden if null value is provided.*
```
providers: [
   TypedConfirmationModule.forRoot({
      translations?: {
         modalHeader?: string;
         instructionPrefix?: string | null;
         instructionSuffix?: string | null;
         cancelLabel?: string;
         confirmLabel?: string;
         regenerateLabel?: string;
         error?: string;
      };
      classes?: {
         cancelBtn?: string;
         confirmBtn?: string;
         regenerateBtn?: string;
      };
      settings: {
         /**
            * Hide modal header
            */
         hideHeader?: boolean;
         /**
            * Do not display instruction keyword (in text above input)
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
            * Do not display input placeholder
            * (confirmation text to be entered)
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
            * Confirmation text is automatically submitted
            * when it is typed correctly
            */
         autoConfirm?: boolean;
         /**
            * The time needed to pass in order to start validation
            * after the user stops typing
            */
         asyncDebounceTime?: number;
      };
   })
]
```

Place the code below in your entry component's html file.
```
<ng-container typedConfirmationPlaceholder></ng-container>
```

Place buttons in your components
```
<button typedConfirmation="angular rocks"></button>
```
Buttons accept [[options]](#override-settings-individually) and emit events via the [(onConfirmation)](#events) event emitter. They also have their [Classes](#buttons) set dynamically.

## Override settings in lazy loaded modules
Only translations & settings can be overriden.  
By setting the **merged** parameter to  **true**, options provided in *forChild* will override only conflicting options provided in *forRoot*, otherwise all options will get replaced. **classes** are excluded and can only be provided in *forRoot*.
```
const options: WCOptions = {
   translations?: WCTranslations;
   settings?: TCSettings;
};

const merged: boolean = true;

providers: [
   TypedConfirmationModule.forChild(options, merged)
]
```

## Override settings individually
Settings can be provided for a specific modal only by the `[options]` attribute.  
Individual options override the global options *(forRoot / forChild)* when conflicting.
```
<button typedConfirmation="angular" [options]="customOptions">Click me</button>
```
```
public customOptions: TCOptions = {
   translations?: WCTranslations;
   settings?: TCSettings;
}
```

## Technical details & features

### Buttons
By default the button which triggers the modal has the "no-confirmation-action" class.  
If modal has been open but confirmation has been cancelled the button's class is set to "not-confirmed".  
After successful confirmation the button's class is set to "confirmed".

### Events
Events can be received by the `(onConfirmation)` event emitter.
```
<button typedConfirmation="angular" (onConfirmation)="doSomething($event)">Click me</button>
```
```
public doSomething(event: ConfirmationEvent) {
   console.log(event);
}
```
Both actions (confirmation/cancellation) emit an event of type `ConfirmationEvent`.
```
ConfirmationEvent {
   /**
      * Unique linkage id between the modal and the button which triggers it
      */
   id: string;

   /**
      * The event value
      */
   value: boolean;

   /**
      * The html button which triggered the modal
      */
   element: HTMLButtonElement;
}
```
False emission can be omitted by setting
```
{
   settings: {
      disableFalseEmission: true
   }
}
```

## Async validation
It is possible to validate input with observables as long as they return either a `boolean` or an object which includes `success: boolean`.
```
<button typedConfirmation="authenticateCurrentUser()">
```

```
public authenticateCurrentUser(): AsyncValidationFn {
   return (value: string) => this._http.post("https://my.server/auth", {
      userId: "hj5sCK3r",
      password: value
   }).pipe(
      map((response: any) => response.success)
   );
}
```



## Styles
All modal elements (e.g. buttons, input etc) have no styles set and will inherit your application's styles.