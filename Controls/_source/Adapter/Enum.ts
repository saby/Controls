/**
 * Created by kraynovdo on 26.04.2018.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import EnumTemplate = require('wml!Controls/_source/Adapter/Enum/Enum');
import {Memory} from 'Types/source';
import {Enum} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IEnumAdapterOptions extends IControlOptions {
   enum: Enum<string>;
}

interface IRawDataElem {
   type: string;
}

/**
 * Контейнер для работы с контролами.
 * Контейнер принимает объекты типа Enum.
 * @class Controls/_source/Adapter/Enum
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * @demo Controls-demo/Container/Enum
 * 
 * @public
 */

/*
 * Container component for working with controls.
 * This container accepts an Enum object.
 * @class Controls/_source/Adapter/Enum
 * @extends UI/Base:Control
 * @author Герасимов Александр
 * @demo Controls-demo/Container/Enum
 * 
 * @public
 */ 

class EnumAdapter extends Control {

   protected _template: TemplateFunction = EnumTemplate;
   protected _source: Memory = null;
   private _enum: Enum<string> = null;
   protected _selectedKey: string;

   private _getArrayFromEnum(enumInstance: Enum<string>): IRawDataElem[] {
      const arr = [];
      enumInstance.each((item) => {
         arr.push({
            title: item
         });
      });
      return arr;
   }

   private _getSourceFromEnum(enumInstance: Enum<string>): Memory {
      const memoryData = this._getArrayFromEnum(enumInstance);
      return new Memory({
         data: memoryData,
         keyProperty: 'title'
      });
   }

   private _enumSubscribe(enumInstance: Enum<string>): void {
      enumInstance.subscribe('onChange', this._enumChangeHandler);
   }

   private _enumUnsubscribe(enumInstance: Enum<string>): void {
      enumInstance.unsubscribe('onChange', this._enumChangeHandler);
   }

   private _enumChangeHandler(event: SyntheticEvent<Event>, index: number, value: string): void {
      this._selectedKey = value;
   }

   protected _beforeMount(newOptions: IEnumAdapterOptions): void {
      this._enumChangeHandler = this._enumChangeHandler.bind(this);
      if (newOptions.enum) {
         this._enum = newOptions.enum;
         this._enumSubscribe(this._enum);
         this._source = this._getSourceFromEnum(newOptions.enum);
         this._selectedKey = newOptions.enum.getAsValue();
      }
   }

   protected _beforeUpdate(newOptions: IEnumAdapterOptions): void {
      if ((newOptions.enum) && (newOptions.enum !== this._enum)) {
         this._enum = newOptions.enum;
         this._enumSubscribe(this._enum);
         this._source = this._getSourceFromEnum(newOptions.enum);
         this._selectedKey = newOptions.enum.getAsValue();
      }
   }

   protected _beforeUnmount(): void {
      if (this._enum) {
         this._enumUnsubscribe(this._enum);
         this._enum = null;
      }
   }

   protected _changeKey(e: SyntheticEvent<Event>, key: string | string[]): void {
      let resultKey: string;
      // support of multiselection in dropdown
      if (key instanceof Array) {
         resultKey = key[0];
      } else {
         resultKey = key;
      }
      if (this._enum) {
         this._enum.setByValue(resultKey);
      }
   }

}

export default EnumAdapter;
