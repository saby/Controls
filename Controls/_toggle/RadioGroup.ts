import Control = require('Core/Control');
import {CrudWrapper} from 'Controls/source';
import template = require('wml!Controls/_toggle/RadioGroup/RadioGroup');
import defaultItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');

   /**
    * Группа контролов, которые предоставляют пользователям возможность выбора между двумя или более параметрами.
    *
    * <a href="/materials/Controls-demo/app/Controls-demo%2FSwitch%2FstandartDemoSwitch">Демо-пример</a>.
    *
    * @class Controls/_toggle/RadioGroup
    * @extends Core/Control
    * @mixes Controls/_interface/ISource
    * @mixes Controls/_interface/ISingleSelectable
    * @mixes Controls/_interface/IValidationStatus
    * @implements Controls/_toggle/interface/IToggleGroup
    * @control
    * @public
    * @author Красильников А.С.
    * @category Toggle
    * @demo Controls-demo/toggle/RadioGroup/Index
    */

   /*
    * Controls are designed to give users a choice among two or more settings.
    *
    * <a href="/materials/Controls-demo/app/Controls-demo%2FSwitch%2FstandartDemoSwitch">Demo-example</a>.
    *
    * @class Controls/_toggle/RadioGroup
    * @extends Core/Control
    * @mixes Controls/_interface/ISource
    * @mixes Controls/_interface/ISingleSelectable
    * @implements Controls/_toggle/interface/IToggleGroup
    * @control
    * @public
    * @author Красильников А.С.
    * @category Toggle
    * @demo Controls-demo/toggle/RadioGroup/Index
    */

   var _private = {
      initItems: function(source, self) {
         self._crudWrapper = new CrudWrapper({
            source: source
         });
         return self._crudWrapper.query({}).then((items) => {
            return items;
         });
      }
   };

   var Radio = Control.extend({
      _template: template,
      _defaultItemTemplate: defaultItemTemplate,

      _beforeMount: function(options, context, receivedState) {
         if (receivedState) {
            this._items = receivedState;
         } else {
            return _private.initItems(options.source, this).addCallback(function(items) {
               this._items = items;
               return items;
            }.bind(this));
         }
      },

      _beforeUpdate: function(newOptions) {
         var self = this;
         if (newOptions.source && newOptions.source !== this._options.source) {
            return _private.initItems(newOptions.source, this).addCallback(function(items) {
               this._items = items;
               self._forceUpdate();
            }.bind(this));
         }
      },

      _selectKeyChanged: function(e, item, keyProperty) {
         if (!this._options.readOnly) {
            this._notify('selectedKeyChanged', [item.get(keyProperty)]);
         }
      }
   });

   Radio.getDefaultOptions = function getDefaultOptions() {
      return {
         direction: 'vertical',
         validationStatus: 'valid'
      };
   };

   Radio._theme = [ 'Controls/toggle' ];

   Radio._private = _private;

   export = Radio;

