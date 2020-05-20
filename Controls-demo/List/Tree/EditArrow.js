define('Controls-demo/List/Tree/EditArrow', [
   'Core/Control',
   'wml!Controls-demo/List/Tree/EditArrow/EditArrow',
   'Controls-demo/List/Tree/TreeMemory',
   'Controls-demo/Utils/MemorySourceFilter',
   'wml!Controls-demo/List/Tree/EditArrow/columnTemplate',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(BaseControl, template, MemorySource, memorySourceFilter, columnTemplate) {
   'use strict';
   var
      ModuleClass = BaseControl.extend({
         _template: template,
         _source: null,
         _columns: null,
         _column: null,
         _header: null,
         _customColumns: null,
         _editArrowClickSurfaced: false,
         _editArrowVisibilityCallback: function(item) {
            if (item.get('parent@')) {
               return true;
            }
         },
         _beforeMount: function() {
            this._header = [{
               title: ''
            }, {
               title: 'price',
               width: '100px',
               align: 'right'
            }, {
               title: 'count',
               width: '100px',
               align: 'right'
            }];
            this._columns = [{
               displayProperty: 'title',
               width: '300px',
               textOverflow: 'ellipsis'
            }, {
               displayProperty: 'price',
               width: '100px',
               align: 'right',
            }, {
               displayProperty: 'count',
               width: '100px',
               align: 'right',
            }];
            this._column = [{
               displayProperty: 'title',
               width: '300px',
            }];
            this._customColumns = [{
               displayProperty: 'title',
               width: '300px',
               template: columnTemplate,
            }, {
               displayProperty: 'price',
               width: '100px',
               align: 'right',
               template: columnTemplate,
            }, {
               displayProperty: 'count',
               width: '100px',
               align: 'right',
               template: columnTemplate,
            }];
            this._source = new MemorySource({
               keyProperty: 'id',
               parentProperty: 'parent',
               filter: memorySourceFilter(),
               data: [{
                     id: 1,
                     'parent': null,
                     'parent@': true,
                     title: 'First Node',
                     description: 'description',
                     price: '100',
                     count: '10',
                  },{
                     id: 2,
                     'parent': null,
                     'parent@': true,
                     title: 'Second Node',
                     description: 'description',
                     price: '200',
                     count: '30',
                  },{
                     id: 3,
                     'parent': 2,
                     'parent@': true,
                     title: 'Third Node with veeeery long caption, so it fits only in two lines',
                     description: 'description',
                     price: '100',
                     count: '10',
                  },{
                     id: 4,
                     'parent': 3,
                     'parent@': null,
                     title: 'Fourth Node',
                     description: 'description',
                     price: '200',
                     count: '30',
                  },{
                     id: 5,
                     'parent': null,
                     'parent@': null,
                     title: 'Leaf 1',
                     description: 'description',
                     price: '200',
                     count: '30',
                  },{
                     id: 6,
                     'parent': 1,
                     'parent@': null,
                     title: 'Leaf 2',
                     description: 'description',
                     price: '200',
                     count: '30',
                  },{
                     id: 7,
                     'parent': 2,
                     'parent@': null,
                     title: 'Leaf 3',
                     description: 'description',
                     price: '200',
                     count: '30',
                  },
               ]
            });
         },
         _editArrowClick: function(e, item) {
            this._editArrowClickSurfaced = true;
         }
      });

   ModuleClass._styles = ['Controls-demo/List/Tree/EditArrow/EditArrow'];

   return ModuleClass;
});
