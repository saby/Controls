import {ISelection, ISplitValue} from '../resources/Types';

export interface IInputData {
   oldValue: string;
   oldSelection: ISelection;
   newValue: string;
   newPosition: number;
}

/**
 * Get split by entered string.
 * @param {String} oldValue Values in the field before changing it.
 * @param {String} newValue Values in the field after changing it.
 * @param {Number} caretPosition Carriage position in the field after changing value.
 * @param {Controls/_input/Base/Types/Selection.typedef} selection Selection in the field before changing value.
 * @param {Controls/_input/Base/Types/InputType.typedef} inputType Type of changing value in the field.
 * @return {Controls/_input/Base/Types/SplitValue.typedef}
 */
export function split(oldValue: string, newValue: string, caretPosition: number, selection, inputType: InputType): ISplitValue {
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
