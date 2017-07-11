define('js!SBIS3.CONTROLS.LongOperationsRegistry',
   [
      'js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CONTROLS.LongOperationEntry',
      'Core/RightsManager',
      'html!SBIS3.CONTROLS.LongOperationsRegistry/resources/groupTpl',
      'html!SBIS3.CONTROLS.LongOperationsRegistry/resources/emptyHTMLTpl',
      'html!SBIS3.CONTROLS.LongOperationsRegistry',
      'css!SBIS3.CONTROLS.LongOperationsRegistry',
      'js!SBIS3.CONTROLS.Action.OpenEditDialog'/*###'js!SBIS3.Engine.SBISOpenDialogAction'*/,
      'js!SBIS3.CONTROLS.Browser'/*###'js!SBIS3.Engine.Browser'*/,
      'js!SBIS3.CONTROLS.SearchForm',/*###*/
      'js!SBIS3.CONTROLS.FilterButton',/*###*/
      'js!SBIS3.CONTROLS.FastDataFilter',/*###*/
      'js!SBIS3.CONTROLS.LongOperationsList',
      'js!SBIS3.CONTROLS.LongOperationsFilter'
   ],

   function (CompoundControl, LongOperationEntry, RightsManager, groupTpl, emptyHTMLTpl, dotTplFn) {
      'use strict';

      var FILTER_STATUSES = {
         'null': rk('В любом состоянии'),
         /*0*/'running': rk('В процессе'),
         /*1*/'suspended': rk('Приостановленные'),
         /*3'not-suspended': rk('Не приостановленные'),*/
         /*2*/'ended': rk('Завершенные'),
         /*4*/'success-ended': rk('Успешно'),
         /*5*/'error-ended': rk('С ошибками')
      };

      /**
       * Класс для отображения реестра длительных операций
       * @class SBIS3.CONTROLS.LongOperationsRegistry
       * @extends SBIS3.CORE.CompoundControl
       */
      var LongOperationsRegistry = CompoundControl.extend({
         _dotTplFn: dotTplFn,

         $protected: {
            _options: {
               className: '',
               userId: null
            },

            _longOpList: null,

            _data: [{
               idProperty : 'key',
               displayProperty: 'title',
               multiselect : false,
               parentProperty: 'parent',
               values:[
                  {
                     key: null,
                     title: FILTER_STATUSES[null]
                  },
                  {
                     key: /*0*/'running',
                     title: FILTER_STATUSES['running']
                  },
                  {
                     key: /*2*/'ended',
                     title: FILTER_STATUSES['ended']
                  },
                  {
                     key: /*4*/'success-ended',
                     title: FILTER_STATUSES['success-ended'],
                     parent: /*2*/'ended'
                  },
                  {
                     key: /*5*/'error-ended',
                     title: FILTER_STATUSES['error-ended'],
                     parent: /*2*/'ended'
                  },
                  {
                     key: /*1*/'suspended',
                     title: FILTER_STATUSES['suspended']
                  }
               ]
            }],

            _previousGroupBy: null
         },

         $constructor: function () {
            var context = this.getLinkedContext();
            context.setValue('filter/status', null);
            if ('userId' in this._options) {
               context.setValue('filter/UserId', this._options.userId);
            }
         },

         init: function () {
            //###require('Core/ContextBinder').setDebugMode(true);
            LongOperationsRegistry.superclass.init.call(this);

            var self = this;
            this._longOpList = this.getChildControlByName('operationList');
            var view = this._longOpList.getView();//###this.getChildControlByName('browserView')

            this.getChildControlByName('browserFastDataFilter').setItems(this._data);

            view.setGroupBy(
               {
                  field: 'status',
                  method: function (record, at, isLast) {
                     var STATUSES = LongOperationEntry.STATUSES;
                     var status = record.get('status');
                     var prev = self._previousGroupBy;
                     if (prev === null
                           || (status === STATUSES.suspended && prev === STATUSES.running)
                           || ((status === STATUSES.success || status === STATUSES.error) && (prev === STATUSES.running || prev === STATUSES.suspended))) {
                        self._previousGroupBy = status;
                        return true;
                     }
                  },
                  template: groupTpl
               }
            );

            this._bindEvents();
            this._longOpList.reload();
         },

         _modifyOptions: function () {
            var options = LongOperationsRegistry.superclass._modifyOptions.apply(this, arguments);
            options.hideStaffFilter = !!options.userId || !(RightsManager.getRights(['Long_requests_config'])['Long_requests_config'] & RightsManager.ADMIN_MASK);
            return options;
         },

         _bindEvents: function () {
            var self = this;
            var longOperationsBrowser = this.getChildControlByName('longOperationsBrowser');
            var view = this._longOpList.getView();//###longOperationsBrowser.getChildControlByName('browserView')

            //Открываем ссылку, если она есть, иначе открываем журнал выполнения операции
            this.subscribeTo(longOperationsBrowser, 'onEdit', function (e, meta) {
               if (!self._longOpList.applyResultAction(meta.item)) {
                  // Если действие ещё не обработано
                  var STATUSES = LongOperationEntry.STATUSES;
                  var status = meta.item.get('status');
                  var canHasHistory = self._longOpList.canHasHistory(meta.item);
                  //Открыть журнал операций только для завершенных составных операций или ошибок
                  if ((status === STATUSES.success && canHasHistory && 1 < meta.item.get('progressTotal')) || status === STATUSES.error) {
                     meta.dialogOptions = {
                        title: rk('Журнал выполнения операции')
                     };
                     meta.componentOptions = canHasHistory ? {
                        tabKey: meta.item.get('tabKey'),
                        producer: meta.item.get('producer'),
                        operationId: meta.item.get('id')
                     } : {
                        failedOperation: meta.item
                     };
                     self.getChildControlByName('action').execute(meta);
                  }
               }
            });

            this.subscribeTo(view, 'onItemsReady', function () {
               self._previousGroupBy = null;
               var status = self._longOpList.getLinkedContext().getValue('filter/status');
               view.setEmptyHTML(emptyHTMLTpl({title:FILTER_STATUSES[status === undefined ? null : status]}));
            });
         }
      });

      return LongOperationsRegistry;
   }
);
