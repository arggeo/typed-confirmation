/**
 * Event emitted by the modal actions (confirmation/cancellation).
 */
export interface ConfirmationEvent {
   /**
    * Unique linkage id between the modal and the button which triggers it.
    */
   id: string;
   /**
    * The event value.
    */
   value: boolean;
   /**
    * The html button which triggered the modal.
    */
   element: HTMLButtonElement;
}