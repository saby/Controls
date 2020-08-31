import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_search/NewController/SearchController';
import {SyntheticEvent} from 'UI/Vdom';
import {
   IFilterOptions,
   INavigationOptions,
   INavigationSourceConfig,
   ISearchOptions,
   ISourceOptions
} from 'Controls/interface';
import {NewSourceController} from 'Controls/dataSource';
import ControllerClass from './ControllerClass';
import {descriptor} from 'Types/entity';

export interface ISearchControllerOptions extends IControlOptions,
   ISourceOptions, IFilterOptions, INavigationOptions<INavigationSourceConfig>, ISearchOptions {
      sourceController: NewSourceController;
      searchValue?: string;
}

export default class SearchController extends Control<ISearchControllerOptions> {
   protected _template: TemplateFunction = template;

   protected _controllerClass: ControllerClass = null;

   protected _searchHandler(event: SyntheticEvent, value: string): void {
      this._getControllerClass().search(value).then();
   }

   protected _searchResetHandler(): void {
      this._getControllerClass().reset().then();
   }

   protected _beforeUpdate(options?: ISearchControllerOptions): void {
      this._getControllerClass().update(options);
   }

   private _getControllerClass(): ControllerClass {
      if (!this._controllerClass) {
         this._controllerClass = new ControllerClass(this._options);
      }
      return this._controllerClass;
   }

   static getOptionTypes(): Record<string, Function> {
      return {
         searchValue: descriptor(String)
      };
   }
}
