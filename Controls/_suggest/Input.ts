import {Control} from 'UI/Base';
import template = require('wml!Controls/_suggest/Input/Input');
import {EventUtils} from 'UI/Events';
import {getOptionTypes} from 'Controls/_suggest/Utils';
import {generateStates} from 'Controls/input';

/**
 * Поле ввода с автодополнением это одострочное поле ввода, которое помогает пользователю ввести текст, предлагая подходящие варианты по первым набранным символам.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FSuggest%2FSuggest демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_suggest.less переменные тем оформления}
 *
 * @class Controls/_suggest/Input
 * @extends UI/Base:Control
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/interface/IBorderStyle
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IValidationStatus
 * @mixes Controls/_input/interface/ITag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_input/interface/IValue
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
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
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

   _clearClick: function() {
      /* move focus to input after clear text, because focus will be lost after hiding cross  */
      this.activate({enableScreenKeyboard: true});
      if (!this._options.autoDropDown) {
         this._suggestState = false;
      }
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

Suggest._theme = ['Controls/suggest', 'Controls/Classes'];
Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = function() {
   return {
      minSearchLength: 3
   };
};

// </editor-fold>
/**
 * @event Происходит перед открытием окна выбора, которое открывается при клике на "Показать всё".
 * @remark
 * Кнопка "Показать всё" отображается в подвале автодополнения.
 * @name Controls/_suggest/Input#showSelector
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */
export = Suggest;
