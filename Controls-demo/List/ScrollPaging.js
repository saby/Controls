define('Controls-demo/List/ScrollPaging', [
   'Core/Control',
   'wml!Controls-demo/List/ScrollPaging/ScrollPaging',
   'Types/source',
], function (BaseControl,
             template,
             source
) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1'
      },
      {
         id: 2,
         title: 'Notebooks 2'
      },
      {
         id: 3,
         title: 'Smartphones 3 '
      },
      {
         id: 4,
         title: 'Notebook Lenovo G505 59426068 4'
      },
      {
         id: 5,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 5'
      },
      {
         id: 6,
         title: 'Notebook ASUS X550LC-XO228H 6'
      },
      {
         id: 7,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 7'
      },
      {
         id: 8,
         title: 'Notebook Lenovo G505 59426068 8'
      },
      {
         id: 9,
         title: 'Lenovo 9'
      },
      {
         id: 11,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 11'
      },
      {
         id: 12,
         title: 'Notebooks 12'
      },
      {
         id: 13,
         title: 'Smartphones 13'
      },
      {
         id: 14,
         title: 'Notebook Lenovo G505 59426068 14'
      },
      {
         id: 15,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 15'
      },
      {
         id: 16,
         title: 'Notebook ASUS X550LC-XO228H 16'
      },
      {
         id: 17,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 17'
      },
      {
         id: 18,
         title: 'Notebook Lenovo G505 59426068 18'
      },
      {
         id: 19,
         title: 'Lenovo 19'
      },
      {
         id: 21,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 21'
      },
      {
         id: 22,
         title: 'Notebooks 22'
      },
      {
         id: 23,
         title: 'Smartphones 23'
      },
      {
         id: 24,
         title: 'Notebook Lenovo G505 59426068 24'
      },
      {
         id: 25,
         title: 'Notebook Packard Bell EasyNote TE69HW-29572G32 25'
      },
      {
         id: 26,
         title: 'Notebook ASUS X550LC-XO228H 26'
      },
      {
         id: 27,
         title: 'Notebook Lenovo IdeaPad G5030 (80G0001FRK) 27'
      },
      {
         id: 28,
         title: 'Notebook Lenovo G505 59426068 28'
      },
      {
         id: 29,
         title: 'Lenovo 29'
      }
   ];

   var ModuleClass = BaseControl.extend(
      {
         _template: template,

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: srcData
            })
         },
         _onMoreClick: function() {
            this._children.psina.__loadPage('down');
         }
      });
   ModuleClass._styles = ['Controls-demo/List/ScrollPaging/ScrollPaging'];

   return ModuleClass;
});
