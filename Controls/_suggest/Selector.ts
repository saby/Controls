import Control = require('Core/Control');
import template = require('wml!Controls/_suggest/Selector/Selector');
import Merge = require('Core/core-merge');
import {Controller} from 'Controls/source';
import {Service, Source} from 'Controls/history';
import {object} from 'Types/util';
import {getOptionTypes} from 'Controls/_suggest/Utils';

/**
 * Поле ввода с выпадающим списком с возможностью автодополнения.
 * <a href="/materials/demo-ws4-selector-suggest">Демо-пример</a>.
 *
 * @class Controls/_suggest/Selector
 * @extends Controls/input:Text
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_suggest/Selector/Styles
 * @demo Controls-demo/Input/Search/Suggest/SuggestPG
 * @control
 * @public
 */

/*
 * Combobox input that suggests options as you are typing.
 * <a href="/materials/demo-ws4-selector-suggest">Demo-example</a>.
 *
 * @class Controls/_suggest/Selector
 * @extends Controls/input:Text
 * @mixes Controls/interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_suggest/ISuggest
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_suggest/Selector/Styles
 * @demo Controls-demo/Input/Search/Suggest/SuggestPG
 * @control
 * @public
 */

var _private = {
   loadSelectedItem: function(self, options) {
      var filter = {};
      filter[options.keyProperty] = options.selectedKey;
      self._sourceController = new Controller({
         source: options.source
      });
      return self._sourceController.load(filter).addCallback(function(items) {
         _private.setValue(self, items.at(0), options.displayProperty);
         return items.at(0);
      });
   },

   setValue: function(self, item, displayProperty) {
      var value = object.getPropertyValue(item, displayProperty);
      _private.updateValue(self, value);
   },

   updateValue: function(self, value) {
      self._value = value;
   },

   prepareSuggestTemplate: function(displayProperty, suggestTemplate) {
      var suggestTemplateConfig = { templateOptions: { displayProperty: displayProperty } };
      return Merge(suggestTemplateConfig, suggestTemplate);
   },

   createHistorySource: function(historyId, source) {
      return new Source({
         originSource: source,
         historySource: new Service({
            historyId: historyId
         })
      });
   }
};

var Suggest = Control.extend({

   _template: template,
   _suggestState: false,
   _searchValue: '',

   _beforeMount: function(options, context, receivedState) {
      this._suggestTemplate = _private.prepareSuggestTemplate(options.displayProperty, options.suggestTemplate);
      if (options.historyId) {
         this._historySource = _private.createHistorySource(options.historyId, options.source);
      }
      if (receivedState) {
         _private.setValue(this, receivedState, options.displayProperty);
      } else if (options.selectedKey) {
         return _private.loadSelectedItem(this, options);
      } else {
         _private.updateValue(this, '');
         this._searchValue = '';
      }
   },

   _changeValueHandler: function(event, value) {
      if (value !== this._value) {
         _private.updateValue(this, value);
         this._searchValue = value;
         this._notify('selectedKeyChanged', [null]);
         this._notify('valueChanged', [value]);
      }
   },

   _choose: function(event, item) {
      this.activate({enableScreenKeyboard: true});
      _private.updateValue(this, item.get(this._options.displayProperty) || '');
      if (this._options.historyId && item.get(this._options.keyProperty) !== undefined) {
         this._historySource.update(item, { $_history: true });
      }
      this._searchValue = '';
      this._notify('selectedKeyChanged', [item.get(this._options.keyProperty)]);
      this._notify('valueChanged', [this._value]);
   },

   _beforeUpdate: function(newOptions) {
      if (newOptions.source !== this._options.source && newOptions.historyId) {
         this._historySource = _private.createHistorySource(newOptions.historyId, newOptions.source);
      }
      if (this._options.suggestState !== newOptions.suggestState) {
         this._suggestState = newOptions.suggestState;
      }
      if (newOptions.selectedKey && (newOptions.selectedKey !== this._options.selectedKey ||
         newOptions.source !== this._options.source)) {
         var self = this;
         return _private.loadSelectedItem(this, newOptions).addCallback(function(items) {
            _private.updateValue(self, self._value);
            self._forceUpdate();
            return items;
         });
      }
   },

   _open: function() {
      if (!this._options.autoDropDown) {
         this._suggestState = !this._suggestState;
      } else if (this._suggestState) {
         this._suggestState = false;
      }
      this.activate();
   },

   _suggestStateChanged: function(event, value) {
      this._suggestState = value;
   },

   _deactivated: function() {
      this._suggestState = false;
   }

});

Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = function() {
   return {
      minSearchLength: 3,
      suggestState: false,
      suggestTemplate: {
         templateName: 'Controls/suggestPopup:SuggestTemplate'
      },
      footerTemplate: null
   };
};

Suggest._theme = ['Controls/suggest'];
Suggest._private = _private;

export default Suggest;
