import {Control} from 'UI/Base';
import template = require('wml!Controls/_suggest/Input/Input');
import {EventUtils} from 'UI/Events';
import {getOptionTypes} from 'Controls/_suggest/Utils';
import {generateStates} from 'Controls/input';
import 'css!Controls/suggest';

/**
 * Поле ввода с автодополнением это одострочное поле ввода, которое помогает пользователю ввести текст, предлагая подходящие варианты по первым набранным символам.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FSuggest%2FSuggest демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_suggest.less переменные тем оформления}
 *
 * @class Controls/_suggest/Input
 * @extends UI/Base:Control
 * @mixes Controls/suggest:ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface/IBorderStyle
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IValidationStatus
 * @mixes Controls/interface:IContrastBackground
 * @mixes Controls/input:ITag
 * @mixes Controls/input:IBase
 * @mixes Controls/interface:IInputPlaceholder
 * @mixes Controls/input:IText
 * @mixes Controls/input:IValue
 *
 * @public
 * @demo Controls-demo/Suggest_new/Input/DisplayProperty/DisplayProperty
 * @author Герасимов А.М.
 */

/*
 * The Input/Suggest control is a normal text input enhanced by a panel of suggested options.
 *
 * Here you can see the <a href="/materials/Controls-demo/app/Controls-demo%2FSuggest%2FSuggest">demo examples</a>.
 *
 * @class Controls/_suggest/Input
 * @extends UI/Base:Control
 * @mixes Controls/suggest:ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/input:IBase
 * @mixes Controls/input:IText
 *
 * @public
 * @demo Controls-demo/Suggest_new/Input/DisplayProperty/DisplayProperty
 * @author Gerasimov A.M.
 */
var Suggest = Control.extend({

   _template: template,
   _notifyHandler: EventUtils.tmplNotify,
   _suggestState: false,
   _searchState: false,

   // <editor-fold desc="LifeCycle">

   _beforeMount: function(options) {
      this._searchStart = this._searchStart.bind(this);
      this._searchEnd = this._searchEnd.bind(this);
      this._searchError = this._searchError.bind(this);
      generateStates(this, options);
   },

   // </editor-fold>

   openSuggest: function() {
      this._suggestState = true;
   },

   closeSuggest: function() {
      this._suggestState = false;
   },

   // <editor-fold desc="handlers">

   _changeValueHandler: function(event, value) {
      this._notify('valueChanged', [value]);
   },

   _inputCompletedHandler: function(event, value) {
      this._notify('inputCompleted', [value]);
   },

   _choose: function(event, item) {
      /* move focus to input after select, because focus will be lost after closing popup  */
      this.activate({enableScreenKeyboard: true});
      this._notify('valueChanged', [item.get(this._options.displayProperty || '')]);
   },

   _clearMousedown(event) {
      event.stopPropagation();
   },

   _clearClick: function() {
      /* move focus to input after clear text, because focus will be lost after hiding cross  */
      this.activate({enableScreenKeyboard: true});
      this._suggestState = this._options.autoDropDown;
      this._notify('valueChanged', ['']);
   },

   _deactivated: function() {
      this._suggestState = false;
   },

   _searchStart: function() {
      this._searchState = true;
      this._forceUpdate();
   },

   _searchEnd: function() {
      this._searchState = false;
      this._forceUpdate();
   },

   _searchError: function() {
      this._searchState = false;
   }
   // </editor-fold>

});


// <editor-fold desc="OptionsDesc">

Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = function() {
   return {
      borderVisibility: 'visible',
      minSearchLength: 3
   };
};

Object.defineProperty(Suggest, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Suggest.getDefaultOptions();
   }
});

// </editor-fold>
/**
 * @event Происходит перед открытием окна выбора, которое открывается при клике на "Показать всё".
 * @remark
 * Кнопка "Показать всё" отображается в подвале автодополнения.
 * @name Controls/_suggest/Input#showSelector
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @name Controls/_suggest/Input#fontSize
 * @demo Controls-demo/Suggest_new/Input/FontSize/Index
 */

export = Suggest;
