import { Observable } from "rxjs";

export type AsyncValidation = boolean | Record<'success', boolean> & Record<string, any>;
export type AsyncValidationFn = (value: string) => Observable<AsyncValidation>;