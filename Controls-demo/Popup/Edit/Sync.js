define('Controls-demo/Popup/Edit/Sync',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Edit/Sync',
      'Types/source',
      'Controls-demo/List/Grid/GridData',
      'Controls/Utils/RecordSynchronizer',
      'wml!Controls-demo/List/Grid/DemoItem',
      'wml!Controls-demo/List/Grid/DemoBalancePrice',
      'wml!Controls-demo/List/Grid/DemoCostPrice',
      'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
      'wml!Controls-demo/List/Grid/DemoName'
   ],
   function(Base, template, source, GridData, RecordSynchronizer) {
      'use strict';

      var Sync = Base.Control.extend({
         _template: template,

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
            };

            var meta = {
               record: record,
            };

            this._children.EditOpener.open(meta, popupOptions);
         },

         _addRecord: function() {
            this._children.EditOpener.open();
         },

         _beforeSyncRecord: function(event, action, record, additionalData) {
            if (additionalData && additionalData.isNewRecord) {
               if (!additionalData.at) {
                  additionalData.at = 0;
               }
            }

            if (action === 'updateStarted') {
               if (additionalData.isNewRecord) {
                  RecordSynchronizer.addRecord(record, additionalData, this._items);
                  this.record = this._items.at(additionalData.at);
               } else {
                  this.record = this._items.getRecordById(additionalData.key).clone();
                  RecordSynchronizer.mergeRecord(record, this._items, additionalData.key);
               }
            } else if (action === 'updateFailed') {
               if (this.record === this._items.at(additionalData.at)) {
                  this.record.set(this._items.getKeyProperty(), additionalData.key);
                  this._items.remove(this._items.getRecordById(additionalData.key));
               } else {
                  RecordSynchronizer.mergeRecord(this.record, this._items, additionalData.record.getId());
               }
            }

            if (action === 'update') {
               if (additionalData.isNewRecord) {
                  this.record.set(this._items.getKeyProperty(), additionalData.key);
               }
               return 'cancel';
            }
         },

         _dataLoadCallback: function(items) {
            this._items = items;
         }
      });

      return Sync;
   });
