define('Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto', [
   'Core/Control',
   'wml!Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto',
   'Types/source',
   'Controls-demo/resources/Images',
   'wml!Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto-content',
   'wml!Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto-item32',
   'Controls/treeGrid'
], function(BaseControl, template, source, resImages) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _viewSource: null,
         _viewColumns: null,
         _beforeMount: function() {
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 1, title: 'Node', 'Раздел': null, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 11, title: 'Node', 'Раздел': 1, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 111, title: 'Leaf', 'Раздел': 11, 'Раздел@': null, 'Раздел$': null, photo: resImages.staff.krainov
                  },
                  {
                     id: 12, title: 'Leaf', 'Раздел': 1, 'Раздел@': null, 'Раздел$': null, photo: resImages.staff.korbyt
                  },
                  {
                     id: 13, title: 'Hidden node', 'Раздел': 1, 'Раздел@': false, 'Раздел$': true, photo: resImages.staff.dogadkin
                  },
                  {
                     id: 2, title: 'Empty node', 'Раздел': null, 'Раздел@': true, 'Раздел$': null, photo: ''
                  },
                  {
                     id: 3, title: 'Hidden node', 'Раздел': null, 'Раздел@': false, 'Раздел$': true, photo: resImages.staff.krainov
                  },
                  {
                     id: 31, title: 'Leaf', 'Раздел': 3, 'Раздел@': null, 'Раздел$': null, photo: resImages.staff.korbyt
                  },
                  {
                     id: 4, title: 'Empty hidden', 'Раздел': null, 'Раздел@': false, 'Раздел$': false, photo: resImages.staff.dogadkin
                  },
                  {
                     id: 5, title: 'Leaf', 'Раздел': null, 'Раздел@': null, 'Раздел$': null, photo: resImages.staff.korbyt
                  }
               ]
            });
            this._viewColumns = [
               {
                  displayProperty: 'title',
                  width: '1fr',
                  template: 'wml!Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto-content'
               }
            ];
         }
      });

   ModuleClass._styles = ['Controls-demo/List/TreeGrid/TreeWithPhoto/TreeWithPhoto'];

   return ModuleClass;
});
