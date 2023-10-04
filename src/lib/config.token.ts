import { InjectionToken } from "@angular/core";

/**
 * The unique injection token for injecting the configuration settings
 * anywhere in the module through DI.
 */
export const CONFIG_TOKEN = new InjectionToken<string>('typed-confirmation');