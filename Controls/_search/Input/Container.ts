import Control = require('Core/Control');
import template = require('wml!Controls/_search/Input/Container');
import {constants} from 'Env/Env';
import {default as Store} from 'Controls/Store';

/**
 * Контрол используют в качестве контейнера для {@link Controls/search:Input}. Он обеспечивает передачу текстового значения, введённого в Controls/search:Input, в {@link Controls/search:Controller}.
 *
 * @class Controls/_search/Input/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @control
 * @public
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less">переменные тем оформления</a>
 */

/*
 * Special container for component with {@link Controls/interface/IInputField}.
 * Listens for child's "valueChanged" event and notify bubbling event "search".
 * NOTE: must be located inside {@link Controls/_search/Controller}.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FSearch">Here</a>. you a demo with search in Controls/Explorer.
 *
 * @class Controls/_search/Input/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @control
 * @public
 */

var SearchContainer = Control.extend(/** @lends Controls/_search/Input/Container.prototype */{

   _template: template,
   _value: '',

   _beforeMount: function (newOptions) {
      this._value = newOptions.inputSearchValue;
   },

   _beforeUpdate: function (newOptions) {
      if (this._options.inputSearchValue !== newOptions.inputSearchValue) {
         this._value = newOptions.inputSearchValue;
      }
   },

   _notifySearch: function (value, force) {
      if (this._options.useStore) {
         Store.dispatch('searchValue', value);
      } else {
          this._notify('search', [value || '', force], {bubbling: true});
      }
   },

   _valueChanged: function (event, value) {
      if (this._value !== value) {
         this._value = value;
         this._notifySearch(value);
      }
   },

   _searchClick: function () {
      this._notifySearch(this._value, true);
   },

   _resetClick: function () {
      this._notifySearch('', true);
   },

   _keyDown: function(event) {
      if (event.nativeEvent.which === constants.key.enter) {
         event.stopPropagation();
      }
   }
});

SearchContainer.getDefaultOptions = function () {
   return {
      searchValue: ''
   };
};

export = SearchContainer;

