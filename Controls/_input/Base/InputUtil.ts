/**
 * @typedef {Object} Selection
 * @property {Number} start The beginning of the selected portion of the field's text. The value specifies the index of the first selected character.
 * @property {Number} end The end of the selected portion of the field's text. The value specifies the index of the character after the selection.
 * If this value is equal to the value of the start property, no text is selected, but the value indicates the position of the caret (cursor) within the field.
 */
export interface ISelection {
   start: number;
   end: number;
}
/**
 * @type {Object} SplitValue
 * @property {String} before Substring preceding the value entered.
 * @property {String} insert Entered value.
 * @property {String} delete Remote value.
 * @property {String} after Substring next the value entered.
 */
export interface ISplitValue {
   after: string;
   before: string;
   insert: string;
   delete: string;
}

export interface IInputData {
   oldValue: string;
   oldSelection: ISelection;
   newValue: string;
   newPosition: number;
}

/**
 * @type {String} InputType
 * @variant insert Enter value.
 * @variant delete Delete with help key backspace [ + ctrl] or delete [ + ctrl] with value selection.
 * @variant deleteBackward Delete with help key backspace [ + ctrl] without value selection.
 * @variant deleteForward Delete with help key delete [ + ctrl] without value selection.
 */
export type IInputType = 'insert' | 'delete' | 'deleteBackward' | 'deleteForward';

/**
 * @type {String} NativeInputType
 * @variant insertText Character input.
 * @variant insertFromPaste Pasting from the clipboard.
 * @variant insertFromDrop Insert through drop.
 * @variant deleteContentBackward Delete with help key backspace.
 * @variant deleteContentForward Delete with help key delete.
 * @variant deleteWordBackward Delete with help key backspace + ctrl.
 * @variant deleteWordForward Delete with help key delete + ctrl.
 */
export type INativeInputType = 'insertText' | 'insertFromPaste' | 'insertFromDrop' | 'deleteContentBackward' |
    'deleteContentForward' | 'deleteWordBackward' | 'deleteWordForward';

/**
 * Get split by entered string.
 * @param {String} oldValue Values in the field before changing it.
 * @param {String} newValue Values in the field after changing it.
 * @param {Number} caretPosition Carriage position in the field after changing value.
 * @param {Controls/_input/Base/Types/Selection.typedef} selection Selection in the field before changing value.
 * @param {Controls/_input/Base/Types/InputType.typedef} inputType Type of changing value in the field.
 * @return {Controls/_input/Base/Types/SplitValue.typedef}
 */
export function split(oldValue: string, newValue: string, caretPosition: number, selection, inputType: IInputType): ISplitValue {
   const selectionLength = selection.end - selection.start;

   const afterInsertedValue: string = newValue.substring(caretPosition);
   const beforeInsertedValue: string = inputType === 'insert'
       ? oldValue.substring(0, oldValue.length - afterInsertedValue.length - selectionLength)
       : newValue.substring(0, caretPosition);
   const insertedValue: string = newValue.substring(beforeInsertedValue.length, newValue.length - afterInsertedValue.length);
   const deletedValue: string = oldValue.substring(beforeInsertedValue.length, oldValue.length - afterInsertedValue.length);

   const result: ISplitValue = {
      before: beforeInsertedValue,
      insert: insertedValue,
      delete: deletedValue,
      after: afterInsertedValue
   };

   /**
    * We can determine the correct split value only if there were user actions.
    * If the value has been changed due to auto-complete, then user actions was not.
    * Then the split value will be incorrect. In this case, return the split value for auto-complete.
    */
   return isCorrectlySplit(result, oldValue, newValue) ? result : getSplitForAutoComplete(oldValue, newValue);
}

function isCorrectlySplit(split: ISplitValue, oldValue: string, newValue: string): boolean {
   return split.before + split.delete + split.after === oldValue &&
       split.before + split.insert + split.after === newValue;
}

function getSplitForAutoComplete(oldValue: string, newValue: string): ISplitValue {
   return {
      before: '',
      insert: newValue,
      delete: oldValue,
      after: ''
   };
}

/**
 * @param {String} oldValue Values in the field before changing it.
 * @param {String} newValue Values in the field after changing it.
 * @param {Number} caretPosition Carriage position in the field after changing value.
 * @param {Controls/_input/Base/Types/Selection.typedef} selection Selection in the field before changing value.
 * @returns {Controls/_input/Base/Types/InputType.typedef}
 */
export function getInputType(oldValue: string, newValue: string, caretPosition: number, selection): IInputType {
   const selectionLength: number = selection.end - selection.start;
   const isDelete: boolean = oldValue.length - selectionLength >= newValue.length;
   const isSelection: boolean = !!selectionLength;
   const isOffsetCaret: boolean = caretPosition === (selection.selectionEnd ?
       selection.selectionEnd :
       selection.end);

   const bitView: string = [isDelete, isSelection, isOffsetCaret].map((item) => +item).join('');

   switch (parseInt(bitView, 2)) {
      case 4:
         return 'deleteBackward';
      case 5:
         return 'deleteForward';
      case 6:
      case 7:
         return 'delete';
      default:
         return 'insert';
   }
}

/**
 * @param {Controls/_input/Base/Types/InputType.typedef} nativeInputType Type of changing value in the field.
 * @param {Controls/_input/Base/Types/Selection.typedef} selection Selection in the field before changing value.
 * @returns {Controls/_input/Base/Types/InputType.typedef}
 */
export function getAdaptiveInputType(nativeInputType: INativeInputType, selection): IInputType {
   const selectionLength: number = selection.end - selection.start;
   const execType: string[] = /^(insert|delete|).*?(Backward|Forward|)$/.exec(nativeInputType);

   return <IInputType>(selectionLength ? execType[1] : execType[1] + execType[2]);
}
