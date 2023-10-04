import { ElementRef, EventEmitter, Injectable, ViewContainerRef } from '@angular/core';
import { Subject, take } from 'rxjs';
import { TCConfig } from '../interfaces/typed-confirmation-config.interface';

/**
 * Responsible for communication between buttons
 * and the confirmation modal.
 */
@Injectable()
export class TCService {
   private _config: TCConfig;   
   private _vcRef: Subject<ViewContainerRef> = new Subject();
   private _confirmed: Subject<boolean> = new Subject();

   public container$ = this._vcRef.asObservable();
   public confirmed$ = this._confirmed.asObservable();
   
   /**
    * A map consisting of linkage id & Subject pairs.
    */
   private _subjectsMap = new Map<string, Subject<boolean>>();
   private _hostRefMap = new Map<string, ElementRef>();

   public fireInput: Subject<boolean> = new Subject();
   private _inputFired$ = this.fireInput.asObservable();
      
   constructor() {}

   /**
    * Returns the root module configuration.
    * 
    * @returns _config Configuration object
    */
   public getConfig() {
      return structuredClone(this._config);
   }

   /**
    * Saves the root module configuration.
    * 
    * @param config Configuration object
    */
   public setConfig(config: TCConfig) {
      this._config = structuredClone(config);
   }

   /**
    * Creates new linkage between button and the modal.
    * 
    * @param id Unique - random string
    * @returns Confirmation observable
    */
   public link(id: string) {
      const confirmed = new Subject<boolean>();
      this._subjectsMap.set(id, confirmed);

      return confirmed.asObservable();
   }

   /**
    * Receives and emits the container's reference which hosts the modal.
    * 
    * @param ref Reference to the host container
    */
   public sendViewRef(ref: ViewContainerRef) {
      this._vcRef.next(ref);
   }

   /**
    * Emits confirmation state.
    * 
    * @param id The linkage id
    * @param confirmation Confirmation state to be emitted
    */
   public sendConfirmation(id: string, confirmation: boolean) {
      this._subjectsMap.get(id)?.next(confirmation);
   }

   /**
    * Emits true after first input validation runs.
    * 
    * @returns Boolean observable
    */
   public inputValidatedOnce() {
      return this._inputFired$.pipe(take(1));
   }
}