define('Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea',
   [
      'Core/Control',
      'tmpl!Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea',
      'Controls/Popup/Compatible/Layer',
      'Lib/Mixins/LikeWindowMixin',
      'Core/helpers/Array/findIndex',
      'Core/moduleStubs',
      'Core/core-debug',
      'Core/Deferred',
      'Core/IoC',
      'Core/EventObject',
      'css!Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea'
   ],
   function(Control,
      template,
      CompatiblePopup,
      LikeWindowMixin,
      arrayFindIndex,
      moduleStubs,
      coreDebug,
      cDeferred,
      IoC,
      EventObject) {

      function removeOperation(operation, array) {
         var  idx = arrayFindIndex(array, function(op) {
            return op === operation; 
         });
         array.splice(idx, 1);
      }

      function finishResultOk(result) {
         return !(result instanceof Error || result === false);
      }

      var logger = IoC.resolve('ILogger');
      var allProducedPendingOperations = [];

      /**
       * Слой совместимости для открытия старых шаблонов в новых попапах
      **/
      var CompoundArea = Control.extend([LikeWindowMixin], {
         _template: template,
         templateOptions: null,
         compatible: null,
         fixBaseCompatible: true,
         _templateComponent: undefined,

         _pending: null,
         _pendingTrace: null,
         _waiting: null,

         _childPendingOperations: [],
         _allChildrenPendingOperation: null,
         _finishPendingQueue: null,
         _isFinishingChildOperations: false,
         _producedPendingOperations: [],

         _beforeMount: function() {
            this._commandHandler = this._commandHandler.bind(this);

            this.handle('onBeforeShow');
            this.handle('onShow');
         },

         shouldUpdate: function() {
            return false;
         },

         _afterMount: function() {
            var
               self = this;
            if (this._options.templateOptions) {
               this.templateOptions = this._options.templateOptions;
            } else {
               this.templateOptions = {};
            }
            if (this._options._initCompoundArea) {
               this._pending = this._pending || [];
               this._pendingTrace = this._pendingTrace || [];
               this._waiting = this._waiting || [];

               this._options._initCompoundArea(this);
            }

            this._parent = this._options.parent;
            this._logicParent = this._options.parent;

            moduleStubs.require([self._options.template]).addCallback(function(result) {
               CompatiblePopup.load().addCallback(function() { //Это уже должно быть загружено страницей
                  self.templateOptions.element = $(self._children.compoundBlock);
                  self.templateOptions._compoundArea = self;
                  self._compoundControl = new (result[0])(self.templateOptions);
                  self._subscribeToCommand();
                  self.handle('onAfterShow'); // todo здесь надо звать хэндлер который пытается подписаться на onAfterShow, попробуй подключить FormController и словить подпись
               });
            });
         },
         _subscribeToCommand: function() {
            this._compoundControl.subscribe('onCommandCatch', this._commandHandler);
         },
         _commandHandler: function(event, commandName, arg) {
            if (commandName === 'close') {
               this._close();
            }
            if (commandName === 'registerPendingOperation') {
               return this._registerChildPendingOperation(arg);
            }
            if (commandName === 'unregisterPendingOperation') {
               return this._unregisterChildPendingOperation(arg);
            }
         },
         _close: function() {
            if (this.handle('onBeforeClose') !== false) {
               this.close();
            }
         },
         closeHandler: function(e) {
            e.stopPropagation();
            this._close();
         },

         /* from api floatArea, window */

         close: function() {
            this._notify('close');

            this.handle('onClose');
            this.handle('onAfterClose');
         },
         _getTemplateComponent: function() {
            return this._compoundControl;
         },

         subscribe: function(eventName, handler) {
            var handlers = this[eventName + 'Handler'] || [];
            this[eventName + 'Handler'] = handlers;
            handlers.push(handler);
         },
         subscribeTo: function(eventName, handler) {
            this.subscribe(eventName, handler);
         },
         once: function(eventName, handler) {
            this.subscribe(eventName, function() {
               handler();
               this.unsubscribe(eventName, handler);
            }.bind(this));
         },
         unsubscribe: function(eventName, handler) {
            var handlers = this[eventName + 'Handler'] || [];
            this[eventName + 'Handler'] = handlers.filter(function(value) {
               return value !== handler;
            });
         },
         handle: function(eventName) {
            var handlers = this[eventName + 'Handler'] || [];
            var eventState = new EventObject(eventName, this);

            handlers.forEach(function(value) {
               if (eventState.getResult() !== false) {
                  value(eventState);
               }
            });
            if (this._options.handlers && this._options.handlers[eventName]) {
               if (typeof this._options.handlers[eventName] === 'function') {
                  this._options.handlers[eventName] = [this._options.handlers[eventName]];
               }
               this._options.handlers[eventName].forEach(function(value) {
                  if (eventState.getResult() !== false) {
                     value(eventState);
                  }
               });
            }

            return eventState.getResult();
         },

         onBringToFront: function() {
            this.activate();
         },

         isDestroyed: function() {
            return this._destroyed;
         },
         destroy: function() {

            var ops = this._producedPendingOperations;
            while (ops.length > 0) {
               this._unregisterPendingOperation(ops[0]);
            }



            var
               operation = this._allChildrenPendingOperation,
               message;

            if (this._isFinishingChildOperations) {
               message = 'У контрола ' + this._moduleName + ' (name = ' + this.getName() + ', id = ' + this.getId() + ') вызывается метод destroy, ' +
                  'хотя у него ещё есть незавёршённые операции (свои или от дочерних контролов';
               logger.error('Lib/Mixins/PendingOperationParentMixin', message);
            }

            this._childPendingOperations = [];//cleanup им вызывать не надо - всё равно там destroy будет работать, у дочернего контрола
            if (this._allChildrenPendingOperation) {
               this._allChildrenPendingOperation = null;
               this._unregisterPendingOperation(operation);
            }

            CompoundArea.superclass.destroy.apply(this, arguments);
         },




         _removeOpFromCollections: function(operation) {
            removeOperation(operation, this._producedPendingOperations);
            removeOperation(operation, allProducedPendingOperations);
         },

         _registerPendingOperation: function(name, finishFunc, registerTarget) {
            var
               name = this._moduleName ? this._moduleName + '/' + name : name,
               operation = {
                  name: name,
                  finishFunc: finishFunc,
                  cleanup: null,
                  control: this,
                  registerTarget: registerTarget
               };

            operation.cleanup = this._removeOpFromCollections.bind(this, operation);
            if (operation.registerTarget) {
               operation.registerTarget.sendCommand('registerPendingOperation', operation);

               this._producedPendingOperations.push(operation);
               allProducedPendingOperations.push(operation);
            }
            return operation;
         },

         _unregisterPendingOperation: function(operation) {
            operation.cleanup();

            if (operation.registerTarget) {
               operation.registerTarget.sendCommand('unregisterPendingOperation', operation);
            }
         },

         getAllPendingOperations: function() {
            return allProducedPendingOperations;
         },

         getPendingOperations: function() {
            return this._producedPendingOperations;
         },






         _registerChildPendingOperation: function(operation) {
            var name, finishFunc;

            this._childPendingOperations.push(operation);

            if (!this._allChildrenPendingOperation) {
               name = (this._moduleName ? this._moduleName + '/' : '') + 'allChildrenPendingOperation';
               finishFunc = this.finishChildPendingOperations.bind(this);

               this._allChildrenPendingOperation = this._registerPendingOperation(name, finishFunc, this.getParent());
            }

            return true;
         },

         _unregisterChildPendingOperation: function(operation) {
            var
               childOps = this._childPendingOperations,
               allChildrenPendingOperation;

            if (childOps.length > 0) {
               removeOperation(operation, childOps);
               if (childOps.length === 0) {
                  allChildrenPendingOperation = this._allChildrenPendingOperation;
                  this._allChildrenPendingOperation = null;
                  coreDebug.checkAssertion(!!allChildrenPendingOperation);

                  this._unregisterPendingOperation(allChildrenPendingOperation);
               }
            }
            return true;
         },
         finishChildPendingOperations: function(needSavePendings) {
            var
               self = this,
               checkFn = function(prevResult) {
                  var
                     childOps = self._childPendingOperations,
                     result, allChildrenPendingOperation;

                  function cleanupFirst() {
                     if (childOps.length > 0) {
                        childOps.shift().cleanup();
                     }
                  }

                  if (finishResultOk(prevResult) && childOps.length > 0) {
                     result = childOps[0].finishFunc(needSavePendings);
                     if (result instanceof cDeferred) {
                        result.addCallback(function(res) {
                           if (finishResultOk(res)) {
                              cleanupFirst();
                           }
                           return checkFn(res);
                        }).addErrback(function(res) {
                           return checkFn(res);
                        });
                     } else {
                        if (finishResultOk(result)) {
                           cleanupFirst();
                        }
                        result = checkFn(result);
                     }
                  } else {
                     allChildrenPendingOperation = self._allChildrenPendingOperation;
                     if (childOps.length === 0 && allChildrenPendingOperation) {
                        self._allChildrenPendingOperation = null;
                        self._unregisterPendingOperation(allChildrenPendingOperation);
                     }
                     self._isFinishingChildOperations = false;
                     result = prevResult;
                  }
                  return result;
               };

            if (!this._isFinishingChildOperations) {
               this._finishPendingQueue = cDeferred.success(true);
               this._isFinishingChildOperations = true;

               this._finishPendingQueue.addCallback(checkFn);
            }

            return this._finishPendingQueue;
         },

         getChildPendingOperations: function() {
            return this._childPendingOperations;
         },

         /**
          *
          * Добавить отложенную асинхронную операцию в очередь ожидания окна.
          * @param {Core/Deferred} dOperation Отложенная операция.
          * @returns {Boolean} "true", если добавление операции в очередь успешно.
          * @see waitAllPendingOperations
          */
         addPendingOperation: function(dOperation) {
            var result = !!(dOperation && (dOperation instanceof cDeferred));
            if (result) {
               this._pending.push(dOperation);
               this._pendingTrace.push(coreDebug.getStackTrace());
               dOperation.addBoth(this._checkPendingOperations.bind(this));
            }
            return result;
         },
         _finishAllPendingsWithSave: function() {
            this._pending.forEach(function(pending) {
               pending.callback(true);
            });
         },

         /**
          * Получение информации о добавленных пендингах, включая информацию, откуда был добавлен пендинг
          * @returns {Array} Массив объектов, хранящих пендинг и информацию, откуда был добавлен пендинг
          */
         getAllPendingInfo: function() {
            var res = [],
               self = this;
            this._pending.forEach(function(pending, index) {
               res.push({
                  pending: pending,
                  trace: self._pendingTrace[index]
               });
            });
            return res;
         },

         /**
          *
          * Добавить асинхронное событие на завершение всех отложенных операций.
          * Добавить асинхронное событие, которое сработает в момент завершения всех отложенных операций,
          * добавленных с помощью {@link addPendingOperation}.
          * Если очередь пуста, то сработает сразу.
          * Если попытаться передать Deferred, находящийся в каком-либо состоянии (успех, ошибка), то метод вернет false и
          * ожидающий не будет добавлен в очередь.
          * @param {Core/Deferred} dNotify Deferred-объект, ожидающий завершения всех отложенных операций.
          * @returns {Boolean} "true", если добавление в очередь ожидающих успешно.
          * @see addPendingOperation
          */
         waitAllPendingOperations: function(dNotify) {
            if (dNotify && (dNotify instanceof cDeferred) && !dNotify.isReady()) {
               if (this._pending.length === 0) {
                  dNotify.callback();
               } else {
                  this._waiting.push(dNotify);
               }
               return true;
            } else {
               return false;
            }
         },
         _checkPendingOperations: function(res) {
            var totalOps = this._pending.length, result;

            // Сперва отберем Deferred, которые завершились
            result = this._pending.filter(function(dfr) {
               return dfr.isReady();
            });

            // Затем получим их результаты
            result = result.map(function(dfr) {
               return dfr.getResult();
            });

            // If every waiting op is completed
            if (result.length == totalOps) {
               this._pending = [];
               this._pendingTrace = [];
               while (this._waiting.length > 0) {
                  this._waiting.pop().callback(result);
               }
            }

            // if res instanceof Error, return it as non-captured
            return res;
         },
      });

      return CompoundArea;
   });
