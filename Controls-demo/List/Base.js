/**
 * Created by kraynovdo on 31.01.2018.
 */
define('Controls-demo/List/Base', [
   'UI/Base',
   'wml!Controls-demo/List/Base/Base',
   'Types/source',
], function (Base,
             template,
             source
) {
   'use strict';

   var srcData = [
      {
         id: 1,
         title: 'Настолько длинное название папки что оно не влезет в максимальный размер 1',
         description: 'Другое название 1'
      },
      {
         id: 2,
         title: 'Notebooks 2',
         description: 'Описание вот такое'
      },
      {
         id: 3,
         title: 'Smartphones 3 ',
         description: 'Хватит страдать'

      }
   ];

   var ModuleClass = Base.Control.extend(
      {
         _template: template,

         constructor: function() {
            ModuleClass.superclass.constructor.apply(this, arguments);
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: srcData
            });
         }
      });
   ModuleClass._styles = ['Controls-demo/List/ScrollPaging/ScrollPaging'];

   return ModuleClass;
});
