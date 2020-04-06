import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as template from 'wml!Controls-demo/List/resources/EditableListPG/EditingConfigEditor';

export interface IOptionsValues {
   editOnClick: boolean;
   sequentialEditing: boolean;
   autoAdd: boolean;
   toolbarVisibility: boolean;
}

export interface IEditableConfigEditorOptions extends IControlOptions {
   value: IOptionsValues;
}

export default class EditableConfigEditor extends Control<IEditableConfigEditorOptions> {

   _selectedKeys: string[];

   _keyProperty: string;

   _source: Memory;

   protected _template: TemplateFunction = template;

   protected _beforeMount(options?: IEditableConfigEditorOptions, contexts?: object, receivedState?: void): Promise<void> | void {
      this._keyProperty = 'key';
      this._source = new Memory({
         keyProperty: this._keyProperty,
         data: [
            {
               key: 'editOnClick',
               title: 'editOnClick'
            },
            {
               key: 'sequentialEditing',
               title: 'sequentialEditing'
            },
            {
               key: 'autoAdd',
               title: 'autoAdd'
            },
            {
               key: 'toolbarVisibility',
               title: 'toolbarVisibility'
            }
         ]
      });
      if (options.value) {
         const keys: string[] = [];
         Object.keys(options.value).forEach((key: string) => {
            if (options.value[key]) {
               keys.push(key);
            }
         });
         this._selectedKeys = keys;
      }
   }

   protected _onSelectedKeysChanged(event: SyntheticEvent, selectedKeys: string[]): void {
      const value: IOptionsValues = {
         editOnClick: false,
         sequentialEditing: false,
         autoAdd: false,
         toolbarVisibility: false
      };
      if (selectedKeys && selectedKeys.length) {
         selectedKeys.forEach((key: string) => {
            value[key] = true;
         });
      }
      this._notify('valueChanged', [value]);
   }
}
