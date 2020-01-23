import Control = require('Core/Control');
import template = require('wml!Controls/_suggest/Input/Input');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {getOptionTypes} from 'Controls/_suggest/Utils';
import 'css!theme?Controls/suggest';

/**
 * Поле ввода с автодополнением это одострочное поле ввода, которое помогает пользователю ввести текст, предлагая подходящие варианты по первым набранным символам.
 * @remark
 * См. <a href="/materials/demo/demo-suggest-input">демо-пример</a>
 *
 * @class Controls/_suggest/Input
 * @extends Core/Control
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/interface/ISearch
 * @mixes Controls/interface/IBorderStyle
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IValidationStatus
 * @mixes Controls/_input/interface/ITag
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_input/interface/IValue
 * @mixes Controls/_suggest/Input/Styles
 * @control
 * @public
 * @category Input
 * @demo Controls-demo/Input/Suggest/SuggestPG
 * @author Герасимов А.М.
 */

/*
 * The Input/Suggest control is a normal text input enhanced by a panel of suggested options.
 *
 * Here you can see the <a href="/materials/demo/demo-suggest-input">demo examples</a>.
 *
 * @class Controls/_suggest/Input
 * @extends Core/Control
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_suggest/Input/Styles
 * @control
 * @public
 * @category Input
 * @demo Controls-demo/Input/Suggest/SuggestPG
 * @author Gerasimov A.M.
 */



var Suggest = Control.extend({

   _template: template,
   _notifyHandler: tmplNotify,
   _suggestState: false,
   _searchState: false,

   // <editor-fold desc="LifeCycle">

   _beforeMount: function() {
      this._searchStart = this._searchStart.bind(this);
      this._searchEnd = this._searchEnd.bind(this);
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
   }

   // </editor-fold>

});


// <editor-fold desc="OptionsDesc">

Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = function() {
   return {
      minSearchLength: 3
   };
};

// </editor-fold>

export = Suggest;

