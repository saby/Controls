import {Control} from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Wrapper/_FilterPanelWrapper');
import _FilterPanelWrapper = require('Controls/_filterPopup/Panel/Wrapper/_FilterPanelOptions');



      /**
       * Proxy container for filter panel options.
       *
       * @class Controls/_filterPopup/Panel/Wrapper/_FilterPanelWrapper
       * @extends UI/Base:Control
       * 
       * @private
       */

      export = Control.extend({

         _template: template,

         _getChildContext: function() {
            return {
               filterPanelOptionsField: new _FilterPanelWrapper(this._options)
            };
         }
      });



