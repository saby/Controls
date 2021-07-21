import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_suggest/Input/Search/Suggest';
import {getOptionTypes} from 'Controls/_suggest/Utils';
import {constants} from 'Env/Env';
import {SyntheticEvent} from "Vdom/Vdom";
import 'Controls/search';


'use strict';

/**
 * Строка поиска с автодополнением, позволяет пользователю вводить однострочный текст.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/directory/lookup/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_suggest.less переменные тем оформления}
 *
 * @class Controls/_suggest/Input/Search/Suggest
 * @extends Controls/_input/Text
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/suggest:ISuggest
 * @mixes Controls/interface:INavigation
 * @mixes Controls/input:IFieldTemplate
 * @demo Controls-demo/Suggest_new/SearchInput/AutoDropDown/AutoDropDown
 * @public
 * @author Герасимов А.М.
 */

/*
 * Search input that suggests options as you are typing.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/input-elements/input/suggest/'>here</a>.
 *
 * @class Controls/_suggest/Input/Search/Suggest
 * @extends Controls/_input/Text
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/suggest:ISuggest
 * @mixes Controls/interface:INavigation
 * @demo Controls-demo/Suggest_new/SearchInput/AutoDropDown/AutoDropDown
 * @public
 */

var Suggest = Control.extend({

   _template: template,
   _suggestState: false,
   _markedKeyChanged: false,

   _changeValueHandler: function(event, value) {
      this._notify('valueChanged', [value]);
   },

   _choose: function(event, item) {
      this.activate();
      this._notify('valueChanged', [item.get(this._options.displayProperty) || '']);
   },

   _close: function() {
      /* need clear text on close button click (by standart http://axure.tensor.ru/standarts/v7/строка_поиска__версия_01_.html).
         Notify event only if value is not empty, because event listeners expect, that the value is really changed */
      if (this._options.value) {
         this._notify('valueChanged', ['']);
      }
   },

   _beforeUpdate: function(newOptions) {
      if (this._options.suggestState !== newOptions.suggestState) {
         this._suggestState = newOptions.suggestState;
      }
   },

   _suggestStateChanged: function(event, value) {
      this._notify('suggestStateChanged', [value]);
   },

   _deactivated: function() {
      this._suggestState = false;
      this._notify('suggestStateChanged', [false]);
   },

   _suggestMarkedKeyChanged(event, key: string|null) {
      this._markedKeyChanged = key !== null;
   },

   _searchClick: function(event: SyntheticEvent, nativeEvent: Event) {
      if (!this._markedKeyChanged || nativeEvent.which !== constants.key.enter) {
         const eventResult = this._notify('searchClick');

         if (eventResult !== false && this._options.value) {
            this._suggestState = false;
            this._notify('suggestStateChanged', [false]);
            this._children.suggestController.closeSuggest();
         }
      }
   },

   _resetClick: function() {
      if (!this._options.autoDropDown) {
         this._suggestState = false;
      }
      this._notify('resetClick');
   }

});

Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = function() {
   return {
      minSearchLength: 3,
      suggestState: false
   };
};

Object.defineProperty(Suggest, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Suggest.getDefaultOptions();
   }
});

/**
 * @name Controls/_suggest/Input/Search/Suggest#searchButtonVisible
 * @cfg {Boolean} Определяет, показывать ли иконку поиска.
 */

/*
 * @name Controls/_suggest/Input/Search/Suggest#searchButtonVisible
 * @cfg {Boolean} Determines whether to show the search icon.
 */
export default Suggest;
