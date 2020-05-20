/**
 * Created by Rodionov E.A. on 09.01.2019.
 */
define('Controls-demo/List/List/Navigation', [
   'Core/Control',
   'wml!Controls-demo/List/List/resources/Navigation/Navigation',
   'Types/source',
   'Controls-demo/List/List/resources/Navigation/Data',
], function (BaseControl,
             template,
             source,
             data
) {
   'use strict';

   var ModuleClass = BaseControl.extend(
      {
         _template: template,
         _eventsList: '',
         _navigationViewType: 'infinity',


         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: data.srcData
            });
            this._navigationViewTypeSource = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1,
                     title: 'infinity'
                  },
                  {
                     id: 2,
                     title: 'pages'
                  },
                  {
                     id: 3,
                     title: 'demand'
                  }
               ]
            });
         },
         _onMoreClick: function() {
            this._children.psina.__loadPage('down');
         },
         _clearArea: function() {
            this._eventsList = '';
         }
      });
   ModuleClass._styles = ['Controls-demo/List/List/resources/Navigation/Navigation'];

   return ModuleClass;
});
