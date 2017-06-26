define('js!SBIS3.CONTROLS.LongOperationsPopup',
   [
      "Core/UserInfo",
      "Core/core-merge",
      'Core/Deferred',
      "Core/helpers/string-helpers",
      'js!SBIS3.CORE.TabMessage',
      "js!SBIS3.CONTROLS.NotificationPopup",
      'js!SBIS3.CONTROLS.LongOperationsManager',
      'js!SBIS3.CONTROLS.LongOperationEntry',
      'js!SBIS3.CONTROLS.LongOperationsList/resources/model',
      "html!SBIS3.CONTROLS.LongOperationsPopup/resources/headerTemplate",
      "html!SBIS3.CONTROLS.LongOperationsPopup/resources/contentTemplate",
      "html!SBIS3.CONTROLS.LongOperationsPopup/resources/footerTemplate",
      "js!SBIS3.CORE.FloatArea",
      "css!SBIS3.CONTROLS.LongOperationsPopup",
      "js!SBIS3.CONTROLS.LongOperationsList"/*###,
      "js!SBIS3.CONTROLS.LongOperationHistory",
      "js!SBIS3.CONTROLS.Link"*/
   ],

   function (UserInfo, cMerge, Deferred, strHelpers, TabMessage, NotificationPopup, longOperationsManager, LongOperationEntry, Model, headerTemplate, contentTpl, footerTpl, FloatArea) {
      'use strict';

      var FILTER_HIDE_STOPPED = 3;

      var DEFAULT_INDICATOR_MESSAGE = rk('Пожалуйста, подождите…');

      /**
       * Класс всплывающего информационное окна длительных операций
       * @class SBIS3.CONTROLS.LongOperationsPopup
       * @extends SBIS3.CONTROLS.NotificationPopup
       */
      var LongOperationsPopup = NotificationPopup.extend({
         $protected: {
            _options: {
               closeButton: true,
               isHint: false,
               headerTemplate: headerTemplate,
               bodyTemplate: contentTpl,
               footerTemplate: footerTpl,
               caption: '',
               className: 'engine-OperationNotificationPopup engine-OperationNotificationPopup__hidden engine-OperationNotificationPopup__hiddenContentMode',
               withAnimation: null,
               waitIndicatorText: null
            },

            _activeOperation: null,
            _firstOperationMode: false,
            _floatAreaMode: false,

            _longOpList: null,

            _notificationContainer: null,
            _progressContainer: null,

            _tabChannel: null,

            _loadingIndicator: null
         },

         $constructor: function () {
            this._publish('onSizeChange');
         },

         init: function () {
            LongOperationsPopup.superclass.init.call(this);

            if (this._options.withAnimation) {
               this._animationAtStart();
            }

            this._longOpList = this.getChildControlByName('operationList');
            this._notificationContainer = this.getContainer().find('.engine-OperationNotificationPopup__footer_notification');
            this._progressContainer = this.getContainer().find('.engine-OperationNotificationPopup__footer_progress_container');

            this._tabChannel = new TabMessage();

            this._bindEvents();
            this._longOpList.reload();
         },

         _bindEvents: function () {
            var self = this;

            /*Если пользователь закроет в одной вкладке, закрываем на всех вкладках*/
            this.subscribeTo(this, 'onClose', function () {
               if (self.isVisible()) {
                  self._tabChannel.notify('LongOperations:Popup:onClosed');
               }
            });
            this.subscribeTo(this._tabChannel, 'LongOperations:Popup:onClosed', function () {
               if (!self._isDestroyed) {
                  self.close();
               }
            });

            ['onoperationstarted', 'onoperationchanged', 'onoperationended', 'onoperationdeleted', 'onproducerregistered', 'onproducerunregistered'].forEach(function (evtType) {
               self.subscribeTo(self._longOpList, evtType, function (evtName, evt) {
                  self._onOperation(evtType, evt);
               });
            });

            var view = this._longOpList.getView();//this._longOpList.getChildControlByName('operationListDataGrid')

            this.subscribeTo(view, 'onItemsReady', function () {
               var items = self._longOpList.getItems();
               var count = items ? items.getCount() : 0;
               if (count) {
                  self._activeOperation = null;
                  if (count === 1) {
                     self._setFirstOperationMode(true);
                     self._activeOperation = items.getRecordById(items.at(0).getId());
                  }
                  else {
                     self._setFirstOperationMode(false);
                     items.each(function (item, id) {
                        if (!self._activeOperation && item.get('status') === LongOperationEntry.STATUSES.running) {
                           self._activeOperation = item;
                           return false;
                        }
                     });
                     if (!self._activeOperation) {
                        self._activeOperation = items.getRecordById(items.at(0).getId());
                     }
                  }
                  self._updateState();
               }
            });

            this.subscribeTo(view, 'onDrawItems', function () {
               var items = self._longOpList.getItems();
               var count = items ? items.getCount() : 0;
               if (count) {
                  //При перерисовке размеры могут меняться
                  self._notify('onSizeChange');
               }
               else {
                  //Если операций нет, просто закрываем попап
                  self.close();
               }
            });

            var clickHandler = function (item) {
               if (!self._longOpList.applyResultAction(item)) {
                  // Если действие ещё не обработано
                  var STATUSES = LongOperationEntry.STATUSES;
                  var status = item.get('status');
                  var canHasHistory = self._longOpList.canHasHistory(item);
                  //Открыть журнал операций только для завершенных составных операций или ошибок
                  if ((status === STATUSES.success && canHasHistory && 1 < item.get('progressTotal')) || status === STATUSES.error) {
                     var options = {};
                     self._showFloatArea({
                        title: rk('Журнал выполнения операции'),
                        template: 'js!SBIS3.CONTROLS.LongOperationHistory',
                        componentOptions: canHasHistory ? {
                           /*###key: item.getId(),*/
                           tabKey: item.get('tabKey'),
                           producer: item.get('producer'),
                           operationId: item.get('id')
                        } : {
                           failedOperation: item
                        },
                        maxWidth: 680
                     });
                  }
               }
            };

            //При клике по записи, открываем журнал операции или ссылку, если она есть
            this.subscribeTo(view, 'onItemActivate', function (e, meta) {
               clickHandler(meta.item);
            });

            this.subscribeTo(this.getChildControlByName('downloadButton'), 'onActivated', function () {
               if (self._activeOperation) {
                  clickHandler(self._activeOperation);
               }
            });

            //Открытие реестра операций
            this.subscribeTo(this.getChildControlByName('registryOperationButton'), 'onActivated', function () {
               self._showFloatArea({
                  title: rk('Все операции'),
                  template: 'js!SBIS3.CONTROLS.LongOperationsRegistry',
                  componentOptions: {
                     columns: {
                        userPic: false
                     },
                     userId: UserInfo.get('Пользователь')
                  }
               });
            });

            var container = this.getContainer();
            container.find('.engine-OperationNotificationPopup__hideContentIcon').on('click', function () {
               //Показать / Скрыть контент
               self._toggleContent();
               //Возможно после раскрытия нужно известить о выполненых операциях
               self._longOpList[self._isContentHidden() ? 'animationClear' : 'animationStart']();
            });

            container.find('.engine-OperationNotificationPopup__footer_pauseIcon').on('click', function () {
               //Остановить / Запустить операцию
               var model = self._activeOperation;
               if (model.get('canSuspend')) {//TODO: ### перенести проверку в лист ?
                  self._longOpList.applyUserAction($(this).hasClass('icon-Pause') ? 'suspend' : 'resume', model, true);
               }
            });

            //Иконку запуска сделаем кликабельной, по ней будет запускать остановленная операция
            container.find('.controls-NotificationPopup__header').on('click', '.engine-OperationNotificationPopup__runOperationIcon', function () {
               //Запустить операцию
               var model = self._activeOperation;
               if (model.get('canSuspend')) {//TODO: ### перенести проверку в лист ?
                  self._longOpList.applyUserAction('resume', model, true);
               }
            });

            //Обработчик, который применяет фильтр "Скрыть прерванные"
            var button = container.find('.engine-OperationNotificationPopup__header_stoppedOperationsButton');
            button.on('click', function () {
               if (button.hasClass('engine-OperationNotificationPopup__header_stoppedOperations-show')) {
                  self._longOpList.getLinkedContext().setValue('filter/State', FILTER_HIDE_STOPPED);
               }
               else {
                  self._longOpList.getLinkedContext().setValue('filter', {});
               }
               button.toggleClass('engine-OperationNotificationPopup__header_stoppedOperations-show');
            });

            // Убрано в соответстви со стандартом. Насовсем?
            /*###this.subscribeTo(this._longOpList, 'onExecuteTimeUpdated', function () {
               if (self._activeOperation) {
                  self._setFooterTimeSpent(self._activeOperation.get('shortTimeSpent'));
               }
            });*/
         },

         /**
          * Метод показывает floatArea.
          * @param params Уникальные параметры.
          */
         _showFloatArea: function (params) {
            var self = this;

            var floatArea = new FloatArea(cMerge({
               opener: self,
               direction: 'left',
               animation: 'slide',
               isStack: true,
               autoCloseOnHide: true,
               maxWidth: 1000
            }, params));

            //Скрываем нашу панель, во время работы с floatArea, она не нужна
            self._toggleFloatAreaMode(true);

            self._notify('onSizeChange');

            self.subscribeOnceTo(floatArea, 'onAfterClose', function () {
               self._toggleFloatAreaMode(false);
               self._notify('onSizeChange');
            });
         },

         /**
          * Переключить floatArea-моду
          */
         _toggleFloatAreaMode: function (toggle) {
            this._floatAreaMode = !!toggle;
            //Скрываем панель, во время работы с floatArea, она не нужна
            this.setVisible(!toggle);
         },

         /**
          * Проверить, активен ли режим с floatArea.
          * НЕ ИСПОЛЬЗУЕТСЯ
          */
         /*###isFloatAreaMode: function () {
            return !!this._floatAreaMode;
         },*/

         /**
          * Метод перезагружает список и обновляет состояние
          * @return {Core/Deferred}
          */
         reload: function () {
            return this._longOpList.reload();//TODO: ### Может убрать ?
         },

         /**
          * Изменить заголовок, иконку и статус
          * @param {string} title Заголовок
          * @param {string} statusName Название статуса
          * @param {string} iconClass Классы иконки
          */
         _setHeader: function (title, statusName, iconClass) {
            this.setCaption(title);
            this.setStatus(statusName);
            this.setIcon(iconClass);

            var STATUSES = LongOperationEntry.STATUSES;
            var model = this._activeOperation;
            var status = model.get('status');
            var butCaption;
            if (status === STATUSES.success) {
               if (model.get('resultUrl')) {
                  butCaption = 'Скачать';
               }
               else
               if (model.get('resultHandler')) {
                  butCaption = 'Открыть';
               }
               else
               if (1 < model.get('progressTotal') && this._longOpList.canHasHistory(model)) {
                  butCaption = 'Журнал';
               }
            }
            else
            if (status === STATUSES.error) {
               butCaption = 'Журнал';
            }

            var hasButton = !!butCaption;
            var button = this.getChildControlByName('downloadButton');
            button.setVisible(hasButton);
            if (hasButton) {
               button.setCaption(rk(butCaption));
            }

            var self = this;
            //TODO Вот этого быть не должно
            if (this.getContainer().hasClass('engine-OperationNotificationPopup__hidden')) {
               this.getContainer().css('opacity', 0);
               this.getContainer().removeClass('engine-OperationNotificationPopup__hidden');
               //###setTimeout(function () {
                  self.getContainer().animate({
                     opacity: 1
                  }, 800);//1500
               //###}, 1000);
            }
         },

         /**
          * Обновить состояние панели.
          */
         _updateState: function () {
            var model = this._activeOperation;
            if (model) {
               var STATUSES = LongOperationEntry.STATUSES;
               var title = model.get('title');

               //Кнопка остановки / запуска операции
               var pauseIcon = this.getContainer().find('.engine-OperationNotificationPopup__footer_pauseIcon');

               switch (model.get('status')) {
                  case STATUSES.running:
                     this._setHeader(title, 'default', 'icon-size icon-24 engine-OperationNotificationPopup__header_icon-customIcon');
                     if (model.get('canSuspend')) {
                        pauseIcon.removeClass('ws-hidden').addClass('icon-Pause').removeClass('icon-DayForward');
                     }
                     else {
                        pauseIcon.addClass('ws-hidden');
                     }
                     break;

                  case STATUSES.suspended:
                     this._setHeader(title, 'default', 'icon-size icon-24 icon-DayForward icon-primary engine-OperationNotificationPopup__runOperationIcon');
                     if (model.get('canSuspend')) {
                        pauseIcon.removeClass('ws-hidden').removeClass('icon-Pause').addClass('icon-DayForward');
                     }
                     else {
                        pauseIcon.addClass('ws-hidden');
                     }
                     break;

                  case STATUSES.success:
                     this._setHeader(title, 'success', 'icon-size icon-24 icon-Yes icon-done');
                     pauseIcon.addClass('ws-hidden');
                     break;

                  case STATUSES.error:
                     this._setHeader(title, 'error', 'icon-size icon-24 icon-Alert icon-error');
                     pauseIcon.addClass('ws-hidden');
                     break;
               }

               var notification = model.get('notification');
               if (notification) {
                  this._setNotification(notification);
               }
               else {
                  this._setProgress(model.get('progressCurrent'), model.get('progressTotal'));
               }

               // Убрано в соответстви со стандартом. Насовсем?
               /*###this._setFooterTimeSpent(model.get('shortTimeSpent'));*/
            }
         },

         /**
          * Проверить скрыт ли контент.
          */
         _isContentHidden: function () {
            return this.getContainer().hasClass('engine-OperationNotificationPopup__hiddenContentMode');
         },

         /**
          * Изменить видимость контента.
          */
         _toggleContent: function (f) {
            this.getContainer().toggleClass('engine-OperationNotificationPopup__hiddenContentMode', f === undefined ? undefined : !f);
            this._notify('onSizeChange');
         },

         /**
          * Изменить режим панели.
          * @param f Флаг - включить или отключить.
          */
         _setFirstOperationMode: function (f) {
            if (f !== this._isFirstOperationMode()) {
               if (f) {
                  //Скрываем контент
                  this._toggleContent(false);
               }
               this._toggleFirstOperationMode();
            }
         },

         /**
          * Проверить включен ли режим одной операции.
          */
         _isFirstOperationMode: function () {
            return this.getContainer().find('.engine-OperationNotificationPopup__footer').hasClass('engine-OperationNotificationPopup__footer_firstOperationMode');
         },

         /**
          * Изменить режим одной операции.
          */
         _toggleFirstOperationMode: function () {
            this.getContainer().find('.engine-OperationNotificationPopup__footer').toggleClass('engine-OperationNotificationPopup__footer_firstOperationMode');
         },

         _setProgress: function (current, total) {
            this._notificationContainer.addClass('ws-hidden');
            this._progressContainer.removeClass('ws-hidden');

            /*###var message;
            if (100 <= total) {
               message = current + ' / ' + total + ' ' + rk('операций');
            }
            else {
               message =
                  strHelpers.wordCaseByNumber(current, rk('Выполнено', 'ДлительныеОперации'), rk('Выполнена', 'ДлительныеОперации'), rk('Выполнено', 'ДлительныеОперации'))
                  + ' ' + current + ' ' +
                  strHelpers.wordCaseByNumber(current, rk('операций'), rk('операция'), rk('операции')) + ' ' + rk('из') + ' ' + total;
            }*/
            var message = current + ' ' + (100 <= total ? '/' : rk('из')) + ' ' + total + ' ' + rk('операций');
            this.getContainer().find('.engine-OperationNotificationPopup__footer_execTasks').text(message);
            this.getContainer().find('.engine-OperationNotificationPopup__footer_progress').text(Math.floor(100*current/total) + '%');
         },

         _setNotification: function (message) {
            this._progressContainer.addClass('ws-hidden');
            this._notificationContainer.text(message).removeClass('ws-hidden');
         },

         /*###_setFooterTimeSpent: function (timeSpent) {
            this.getContainer().find('.engine-OperationNotificationPopup__footer_executeTime').text(timeSpent);
         },*/

         /**
          * Обработать событие
          * @protected
          * @param {string} eventType Тип события
          * @param {object} data данные события
          */
         _onOperation: function (eventType, data) {
            switch (eventType) {
               case 'onoperationstarted':
                  this._animationAtStart();
                  this._setProgress(0, data.progress ? data.progress.total : 1);
                  break;

               case 'onoperationchanged':
                  var active = this._activeOperation;
                  switch (data.changed) {
                     case 'status':
                        switch (data.status) {
                           case LongOperationEntry.STATUSES.running:
                              this._setProgress(data.progress ? data.progress.value : 0, data.progress ? data.progress.total : 1);
                           case LongOperationEntry.STATUSES.suspended:
                              break;
                        }
                        break;
                     case 'progress':
                        if (active && active.get('tabKey') === data.tabKey && active.get('producer') === data.producer && active.get('id') === data.operationId /*###&& !active.get('notification'*/) {
                           this._setProgress(data.progress.value, data.progress.total);
                        }
                        break;
                     case 'notification':
                        if (active && active.get('tabKey') === data.tabKey && active.get('producer') === data.producer && active.get('id') === data.operationId) {
                           this._setNotification(data.notification);
                        }
                        break;
                  }
                  break;

               case 'onoperationended':
                  this._setProgress(data.progress ? data.progress.value : 1, data.progress ? data.progress.total : 1);
                  var items = this._longOpList.getItems();
                  var model = items ? items.getRecordById(Model.getFullId(data.tabKey, data.producer, data.operationId)) : null;
                  if (model) {
                     this._activeOperation = model;
                     this._updateState();
                  }
                  break;

               case 'onoperationdeleted':
               case 'onproducerregistered':
               case 'onproducerunregistered':
                  break;
            }
         },

         _animationAtStart: function () {
            /*Время экспозиции индикатора ожидания перед движением вниз*/
            var TIME_EXPOSITION = 600;//1000
            /*Время движения индикатора ожидания вниз*/
            var TIME_GLIDING = 800;//1500
            /*Время однократного мигания иконки в заголовке*/
            var TIME_BLINKING = 600;//600
            var self = this;
            var promise = new Deferred();
            if (!this._loadingIndicator) {
               require(['js!SBIS3.CORE.LoadingIndicator'], function (LoadingIndicator) {
                  self._loadingIndicator = new LoadingIndicator({message:self._options.waitIndicatorText || DEFAULT_INDICATOR_MESSAGE});
                  self._loadingIndicator.show();
                  promise.callback();
               });
            }
            else {
               this._loadingIndicator.setMessage(this._options.waitIndicatorText || DEFAULT_INDICATOR_MESSAGE);
               this._loadingIndicator.show();
               promise.callback();
            }
            promise.addCallback(function () {
               setTimeout(function () {
                  if (!self.isDestroyed() && self.isVisible()
                        //Если активен режим с floatArea (открыт журнал), то просто скрываем ромашку. Анимация не нужна.
                        && !self._floatAreaMode) {
                     var _moveTo = function ($target, zIndex, $element) {
                        var offset = $target.offset();
                        $element
                           .clone()
                           .appendTo('body')
                           .css({
                              'position' : 'absolute',
                              'z-index' : zIndex,
                              'top' : $element.offset().top,
                              'left': $element.offset().left
                           })
                           .animate({
                              top: offset.top - 4,
                              left: offset.left - 4
                           }, TIME_GLIDING, function () {
                              $(this).remove();
                              $target.animate({
                                 opacity: 0
                              }, TIME_BLINKING/2, function () {
                                 $target.animate({
                                    opacity: 1
                                 }, TIME_BLINKING/2);
                              });
                           });
                     };
                     var $cnt = self.getContainer();
                     _moveTo($cnt.find('.controls-NotificationPopup__header_icon'), $cnt.css('z-index') + 1, self._loadingIndicator.getWindow().getContainer().find('.ws-loadingimg'));
                  }
                  self._loadingIndicator.hide();
               }, TIME_EXPOSITION);
            });
         },

         destroy: function () {
            this._tabChannel.destroy();
            this._tabChannel = null;

            var container = this.getContainer();
            [
               '.controls-NotificationPopup__header_caption',
               '.engine-OperationNotificationPopup__hideContentIcon',
               '.engine-OperationNotificationPopup__footer_pauseIcon',
               '.controls-NotificationPopup__header',
               '.engine-OperationNotificationPopup__header_stoppedOperationsButton'
            ].forEach(function (selector) {
               container.find(selector).off('click');
            });

            LongOperationsPopup.superclass.destroy.call(this);
         }
      });

      LongOperationsPopup.resizable = false;
      return LongOperationsPopup;
   }
);