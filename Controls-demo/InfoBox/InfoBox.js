define('Controls-demo/InfoBox/InfoBox',
   [
      'UI/Base',
      'wml!Controls-demo/InfoBox/InfoBox',

      'Controls/popup'
   ],
   function(Base, template) {

      'use strict';

      var ModuleClass = Base.Control.extend({
         _template: template,
         _dblClickHandler: function() {
            var child = this._children.demandInfobox;
            child.open();
            setTimeout(child.close.bind(child), 5000);
         }
      });
   
      ModuleClass._styles = ['Controls-demo/InfoBox/resources/Infobox'];

      return ModuleClass;
}
);
