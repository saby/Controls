define('Controls-demo/List/Grid/MultyHeader', [
  'Core/Control',
  'Controls-demo/List/Grid/GridData',
  'wml!Controls-demo/List/Grid/MultyHeader',
  'Types/source',
  'wml!Controls-demo/List/Grid/DemoItem',
  'wml!Controls-demo/List/Grid/DemoBalancePrice',
  'wml!Controls-demo/List/Grid/DemoCostPrice',
  'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
  'wml!Controls-demo/List/Grid/DemoName',
  'Controls/scroll',
  'Controls/grid',
  'wml!Controls-demo/List/Grid/Results',
], function(BaseControl, GridData, template, source) {
  'use strict';
  var
     partialColumns = [
        {
           displayProperty: 'name',
           width: '1fr',
           template: 'wml!Controls-demo/List/Grid/DemoName'
        },
        {
           displayProperty: 'price',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
        }
     ],
     partialColumns2 = [
        {
           displayProperty: 'name',
           width: '1fr',
           template: 'wml!Controls-demo/List/Grid/DemoName'
        },
        {
           displayProperty: 'costPrice',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
        }
     ],
     fullColumns = [
        {
           displayProperty: 'name',
           width: '1fr',
           template: 'wml!Controls-demo/List/Grid/DemoName'
        },
        {
           displayProperty: 'price',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
        },
        {
           displayProperty: 'balance',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoBalancePrice',
           resultTemplate: 'wml!Controls-demo/List/Grid/Results',
           result: 7893.87
        },
        {
           displayProperty: 'reserve',
           width: 'auto',
           align: 'right'
        },
        {
           displayProperty: 'costPrice',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
           resultTemplate: 'wml!Controls-demo/List/Grid/Results',
           result: 983.36
        },
        {
           displayProperty: 'balanceCostSumm',
           width: 'auto',
           align: 'right',
           template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
        }
     ],
     partialHeader = [
        {
           title: ''
        },
        {
           title: 'Цена',
           align: 'right'
        }
     ],
      fullHeader = [
          {
              title: 'Наименование',
              startColumn:   1,
              endColumn:     2,
              startRow:      1,
              endRow:        4,
              align: 'center'
          },
          {
              title: 'Общие',
              startColumn:   2,
              endColumn:     7,
              startRow:      1,
              endRow:        2,
              align: 'center'
          },
          {
              title: 'Цена',
              startColumn:   2,
              endColumn:     3,
              startRow:      3,
              endRow:        4,
              align: 'right'
          },
          {
              title: 'Остаток',
              sortingProperty: 'balance',
              startColumn:   3,
              endColumn:     4,
              startRow:      3,
              endRow:        4,
              align: 'right'
          },
          {
              title: 'Резерв',
              startColumn:   4,
              endColumn:     5,
              startRow:      3,
              endRow:        4,
              align: 'right'
          },
          {
              title: 'Себест.',
              startColumn:   5,
              endColumn:     6,
              startRow:      3,
              endRow:        4,
              align: 'right'
          },
          {
              title: 'Магазин',
              startColumn:   2,
              endColumn:     5,
              startRow:      2,
              endRow:        3,
              align: 'center'
          },
          {
              title: 'Склад',
              startColumn:   5,
              endColumn:     7,
              startRow:      2,
              endRow:        3,
              align: 'center',
          },
          {
              title: 'Сумма остатка',
              startColumn:   6,
              endColumn:     7,
              startRow:      3,
              endRow:        4,
              align: 'right'
          }
      ],
     ModuleClass = BaseControl.extend({
        _template: template,
        _actionClicked: '',
        _fullSet: true,
        _itemActions: null,
        _viewSource: null,
        _sorting: [],
        _selectKeyColumn: null,
        _columnSource: null,
        gridColumns: null,
        gridColumns2: null,
        gridHeader: null,
        showType: null,

        _beforeMount: function() {
           this._firstSelectedKeys = ['448390'];
           this._secondSelectedKeys = ['448390'];
           this.showType = {

              // show only in Menu
              MENU: 0,

              // show in Menu and Toolbar
              MENU_TOOLBAR: 1,

              // show only in Toolbar
              TOOLBAR: 2
           };
           this._viewSource = new source.Memory({
              keyProperty: 'id',
              data: GridData.catalog
           });
           this.gridColumns = fullColumns;
           this.gridHeader = fullHeader;

           this._columnSource = new source.Memory({
              data: [
                 { key: 'price', title: 'Цена' },
                 { key: 'costPrice', title: 'Себестоимость' }
              ],
              keyProperty: 'key'
           });
           this.gridColumns2 = partialColumns;

           this._selectKeyColumn = ['price'];
        },
        _onToggleColumnsClicked: function() {
           this._fullSet = !this._fullSet;
           this.gridColumns = this._fullSet ? fullColumns : partialColumns;
           this.gridHeader = this._fullSet ? fullHeader : partialHeader;
           this._forceUpdate();
        },

        _selectedKeysChangeColumn: function(event, field) {
           this.gridColumns2 = field[0] === 'price' ? partialColumns : partialColumns2;
        }
     });

  ModuleClass._styles = ['Controls-demo/List/Grid/Grid'];

  return ModuleClass;
});
