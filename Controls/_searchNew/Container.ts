import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_searchNew/Container';
import {SyntheticEvent} from 'UI/Vdom';

import Controller from './Controller';
import {descriptor} from 'Types/entity';
import {ISearchContainerOptions} from './interface';

export default class Container extends Control<ISearchContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _controllerClass: Controller = null;

   protected _searchHandler(event: SyntheticEvent, value: string): void {
      this._getControllerClass().search(value).then();
   }

   protected _searchResetHandler(): void {
      this._getControllerClass().reset().then();
   }

   protected _beforeUpdate(options?: ISearchContainerOptions): void {
      this._getControllerClass().update(options);
   }

   private _getControllerClass(): Controller {
      if (!this._controllerClass) {
         this._controllerClass = new Controller(this._options);
      }
      return this._controllerClass;
   }

   static getOptionTypes(): Record<string, Function> {
      return {
         searchValue: descriptor(String)
      };
   }
}
