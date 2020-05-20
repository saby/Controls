import * as Control from 'Core/Control';
import * as template from 'wml!Controls/_suggest/Input/Search/Suggest';
import {getOptionTypes} from 'Controls/_suggest/Utils';
import {constants} from 'Env/Env';
import {SyntheticEvent} from "Vdom/Vdom";
import 'Controls/search';


'use strict';

/**
 * Строка поиска с автодополнением, позволяет пользователю вводить однострочный текст.
 * Подробное описание и инструкцию по настройке смотрите <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/suggest/'>здесь</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FSuggest%2FSearchInput">Демо-пример</a>
 *
 * @class Controls/_suggest/Input/Search/Suggest
 * @extends Controls/_input/Text
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * @demo Controls-demo/Input/Search/Suggest/SuggestPG
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Input
 */

/*
 * Search input that suggests options as you are typing.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/suggest/'>here</a>.
 *
 * @class Controls/_suggest/Input/Search/Suggest
 * @extends Controls/_input/Text
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * @demo Controls-demo/Input/Search/Suggest/SuggestPG
 * @control
 * @public
 * @category Input
 */

/**
 * @name Controls/_suggest/Input/Search/Suggest#searchButtonVisible
 * @cfg {Boolean} Определяет, показывать ли иконку поиска.
 */

/*
 * @name Controls/_suggest/Input/Search/Suggest#searchButtonVisible
 * @cfg {Boolean} Determines whether to show the search icon.
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

         if (eventResult !== false) {
            this._suggestState = false;
            this._notify('suggestStateChanged', [false]);
         }
      }
   },

   _resetClick: function() {
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

export default Suggest;
