import {adapter, Record} from 'Types/entity';
import {ISelectionObject, TSelectionRecord, TSelectionType} from 'Controls/interface';

const SELECTION_FORMAT = [
   {
      name: 'marked',
      type: 'array',
      kind: 'string'
   },
   {
      name: 'excluded',
      type: 'array',
      kind: 'string'
   },
   {
      name: 'type',
      type: 'string',
      kind: 'string'
   },
   {
      name: 'recursive',
      type: 'boolean',
      kind: 'boolean'
   }
];

function prepareArray(array: string[]|number[]): string[] {
   return array.map((value) => {
      return (value !== null ? '' + value : value) as string;
   });
}

function getSelectionRecord(selection: ISelectionObject, adapter: adapter.IAdapter, selectionType?: TSelectionType = 'all', recursive?: boolean = true): TSelectionRecord {
   const result = new Record({
      adapter,
      format: SELECTION_FORMAT
   });

   result.set('marked', prepareArray(selection.selected));
   result.set('excluded', prepareArray(selection.excluded));
   result.set('type', selectionType);
   result.set('recursive', recursive);

   return result;
}

export default getSelectionRecord;
