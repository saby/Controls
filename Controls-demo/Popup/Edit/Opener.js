define('Controls-demo/Popup/Edit/Opener',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/Edit/Opener',
      'Types/source',
      'Controls-demo/List/Grid/GridData',
      'Controls/Utils/RecordSynchronizer',
      'wml!Controls-demo/List/Grid/DemoItem',
      'wml!Controls-demo/List/Grid/DemoBalancePrice',
      'wml!Controls-demo/List/Grid/DemoCostPrice',
      'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
      'wml!Controls-demo/List/Grid/DemoName'
   ],
   function(Control, template, source, GridData, RecordSynchronizer) {
      'use strict';

      var EditOpener = Control.extend({
         _template: template,
         _addPosition: 0,
         _addRecordCount: 1,
         _cancelEdit: false,
         _openRecordByNewKey: false,
         _openInitialRecord: false,

         _beforeMount: function(opt, context) {
            this._dataLoadCallback = this._dataLoadCallback.bind(this);
            this._itemPadding = { left: 'S', right: 'M', bottom: 'M' };
            this._viewSource = new source.Memory({
               keyProperty: 'id',
               data: GridData.catalog.slice(0, 10)
            });

            this.gridColumns = [
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
                  template: 'wml!Controls-demo/List/Grid/DemoBalancePrice'
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
                  template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
               },
               {
                  displayProperty: 'balanceCostSumm',
                  width: 'auto',
                  align: 'right',
                  template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
               }
            ];
            this.gridHeader = [
               {
                  title: ''
               },
               {
                  title: 'Цена',
                  align: 'right'
               },
               {
                  title: 'Остаток',
                  align: 'right'
               },
               {
                  title: 'Резерв',
                  align: 'right'
               },
               {
                  title: 'Себест.',
                  align: 'right',
                  template: 'wml!Controls-demo/List/Grid/DemoHeaderCostPrice'
               },
               {
                  title: 'Сумма остатка',
                  align: 'right'
               }
            ];
         },

         _itemClick: function(event, record) {
            var popupOptions = {
               closeOnOutsideClick: false,
               opener: this._children.grid
            };

            var meta = {
               record: record,
            };

            if (this._openRecordByNewKey) {
               meta.key = '442584';
            }

            this._children.EditOpener.open(meta, popupOptions);
         },

         _addRecord: function() {
            var initialRecord;
            if (this._openInitialRecord) {
               initialRecord = this._items.at(0).clone();
               initialRecord.set('id', 1000);
               initialRecord.set('name', 'Запись для первичной отрисовки');
               initialRecord.set('price', -10000);
               initialRecord.set('balance', -10000);
               initialRecord.set('costPrice', -10000);
            }

            this._children.EditOpener.open(null, {
               templateOptions: {
                  initialRecord: initialRecord
               }
            });
         },

         _openHandler: function(event) {
            this._eventText = event.type;
         },

         _closeHandler: function(event) {
            this._eventText = event.type;
         },

         _resultHandler: function(event) {
            var args = Array.prototype.slice.call(arguments, 1);
            this._eventText = event.type + '. Аргументы: ' + args.toString();
         },

         _beforeSyncRecord: function(event, action, record, additionaData) {
            if (this._cancelEdit) {
               return 'cancel';
            }

            if (additionaData && additionaData.isNewRecord) {
               additionaData.at = this._addPosition;
            }
         },

         _dataLoadCallback: function(items) {
            this._items = items;
            this._baseRecord = this._items.at(0).clone();
         },

         _addRecords: function() {
            var addRecords = [];
            for (var i = this._addRecordCount; i < this._addRecordCount + 10; i++) {
               var cloneRecord = this._baseRecord.clone();
               cloneRecord.set('id', i);
               cloneRecord.set('name', 'Созданная запись ' + i);
               addRecords.push(cloneRecord);
            };
            this._addRecordCount += 10;
            RecordSynchronizer.addRecord(addRecords, {}, this._items);
         },
         _mergeRecords: function() {
            var editRecord = [];
            var i = 0;
            this._items.each(function(model) {
               var a = model.clone();
               a.set('name', 'Обновленная запись ' + ++i);
               editRecord.push(a);
            });
            RecordSynchronizer.mergeRecord(editRecord, this._items);
         },
         _deleteRecords: function() {
            var ids = [];
            this._items.each(function(model) {
               ids.push(model.getId());
            });
            RecordSynchronizer.deleteRecord(this._items, ids);
         }
      });

      return EditOpener;
   });
