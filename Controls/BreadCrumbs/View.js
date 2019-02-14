define('Controls/BreadCrumbs/View', [
   'Controls/crumbs',
   'Core/IoC'
], function(breadCrumbsLib,
   IoC) {
   'use strict';

   /**
    * BreadCrumbs/View.
    *
    * @class Controls/BreadCrumbs/View
    * @extends Core/Control
    * @mixes Controls/interface/IBreadCrumbs
    * @control
    * @private
    * @author Зайцев А.С.
    */


   IoC.resolve('ILogger').error('Controls/BreadCrumbs/View', 'Контрол переехал. Используйте Controls/crumbs:View');
   return breadCrumbsLib.View;
});
