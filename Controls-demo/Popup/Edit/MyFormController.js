/**
 * Created by as.krasilnikov on 05.09.2018.
 */
define('Controls-demo/Popup/Edit/MyFormController',
   [
      'UI/Base',
      'Controls-demo/List/Grid/GridData',
      'wml!Controls-demo/Popup/Edit/MyFormController',
      'Types/source',
      'Core/Deferred',
   ],
   function (Base, GridData, template, source, Deferred) {
      'use strict';

      var MyFormController = Base.Control.extend({
         _template: template,
         _record: null,
         _key: null,
         _savedState: '',
         _deleteState: false,
         _beforeMount: function (options) {
            this._record = options.record;
            if (!options.source) {
               this._dataSource = new source.Memory({
                  keyProperty: 'id',
                  data: GridData.catalog.slice(0, 11)
               });
            } else {
               this._dataSource = options.source;
            }

            // Если есть initialRecord делаю искусственную задержку для создать, чтобы было видно как работает
            if (options.initializingWay && !this._dataSource._patched) {
               var baseCreate = this._dataSource.create;
               var self = this;
               this._dataSource._patched = this._dataSource.create;
               this._dataSource.create = function() {
                  var def = new Deferred();
                  setTimeout(function() {
                     baseCreate.call(self._dataSource).then(def.callback.bind(def));
                  }, 1000);
                  return def;
               };
            }

            var baseUpdate = this._dataSource.update;
            var self = this;
            this._dataSource.update = function () {
               if (!options.errorUpdate) {
                  return baseUpdate.apply(self._dataSource, arguments);
               }
               var def = new Deferred();
               setTimeout(function () {
                  def.errback('Ошибка сохранения');
               }, 2000);
               return def;
            };
         },

         _beforeUpdate: function (opt) {
            if (opt.record !== this._options.record) {
               this._record = opt.record;
            }
         },
         _afterMount: function () {
            this._onPropertyChangeHandler = this._changeStateOnNotSaved.bind(this);
            this._record.subscribe('onPropertyChange', this._onPropertyChangeHandler);
         },
         _changeStateOnNotSaved: function(){
            this._savedState = '';
         },
         _changeStateOnSaved: function(){
            this._savedState = 'Сохранено';
         },
         _update: function () {
            this._changeStateHandler = this._changeStateOnSaved.bind(this);
            return this._children.formControllerInst.update().then(this._changeStateHandler);
         },
         _closeHandler: function(){
            if (!this._savedState){
               this._savedState = 'Не сохранено';
            }
         },
         _delete: function () {
            this._savedState = 'Запись удалена';
            if (!this._deleteState && this._record.get('id')) {
               this._children.formControllerInst.delete();
               this._deleteState = true;
            }
         },
         _readSuccessedHandler: function (event, record) {
            this._record = record;
         },

         _createSuccessedHandler: function (event, record) {
            this._record = record;
         },
         _updateSuccessedHandler: function (event, record) {
            this._record = record;
            this._notify('close', [], {bubbling: true});
         },
         _deleteSuccessedHandler: function (record) {
            this._notify('close', [], {bubbling: true});
         },
         _errorHandler: function (event, error) {
            var cfg = {
               message: event.type,
               details: error.message,
               style: 'error',
               type: 'ok'
            };
            //this._children.popupOpener.open(cfg);
         },
         _sendResult: function () {
            this._notify('sendResult', ['Цена ' + (this._record.get('price') || 0), 'Ост. ' + (this._record.get('balance') || 0)], {bubbling: true});
         },
         openTestStack: function () {
            this._children.stack.open();
         }
      });

      MyFormController._styles = ['Controls-demo/Popup/Edit/MyFormController'];

      return MyFormController;
   });
