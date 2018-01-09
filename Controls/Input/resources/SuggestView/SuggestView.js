define('js!Controls/Input/resources/SuggestView/SuggestView',
   [
      'Core/Control',
      'tmpl!Controls/Input/resources/SuggestView/SuggestView',
      'Core/moduleStubs',
      'css!Controls/Input/resources/SuggestView/SuggestView'
   ], function(Control, template, moduleStubs) {
      
      'use strict';
      
      var _private = {
         getSelectedKey: function(items, idProperty, index) {
            var item = items && items.at(index || 0);
            return item ? item.get(idProperty) : null;
         }
      };
      
      var SuggestView = Control.extend({
         _template: template,
         
         constructor: function(opt) {
            SuggestView.superclass.constructor.call(this, opt);
            this._selectedKey =  _private.getSelectedKey(opt.items, opt.idProperty, opt.selectedIndex);
         },
         
         _onItemClickHandler: function(event, item) {
            this._notify('sendResult', item);
            this._notify('close');
         },
         
         _showAllClick: function() {
            var self = this;
            
            //loading showAll templates
            moduleStubs.require(['js!Controls/Input/resources/SuggestShowAll/SuggestShowAll', 'js!Controls/Popup/DialogTemplate']).addCallback(function(res) {
               self._options.showAllOpener.open();
               return res;
            });
            this._notify('close');
         },
         
         _beforeUpdate: function(newOptions) {
            SuggestView.superclass._beforeUpdate.call(this, newOptions);
            this._selectedKey =  _private.getSelectedKey(newOptions.items, newOptions.idProperty, newOptions.selectedIndex);
         }
      });
      
      return SuggestView;
   });