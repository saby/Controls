define('SBIS3.CONTROLS/Utils/InformationPopupManager',
   [
      'Core/Deferred',
      'Core/core-merge',
      'Core/CompoundContainer',
      'Controls/Popup/Opener/Notification',
      'SBIS3.CONTROLS/SubmitPopup',
      'SBIS3.CONTROLS/NotificationPopup',
      'browser!SBIS3.CONTROLS/Utils/NotificationStackManager',
      'Core/constants',
      'Core/helpers/Function/runDelayed'
   ],

   /**
    * Класс интерфейса для работы с нотификационными уведомлениями (см. {@link SBIS3.CONTROLS/NotificationPopup}) и окнами (см. {@link SBIS3.CONTROLS/SubmitPopup}).
    * С помощью класса возможно инициировать отображение уведомления и управление их расположением друг относительно друга в случае, если одновременно отображается больше одного уведомления.
    * Содержит функции для показа информационных окон и нотификационных уведомелений в области уведомлений.
    * Всплывающие уведомления отображаются в нижнем правом углу друг над другом и пропадают сами спустя 5 секунд.
    * <br/>
    * Для вызова уведомлений и окон используйте методы showConfirmDialog, showMessageDialog, showNotification и showCustomNotification.
    * <br/>
    * <b>Пример.</b> В компоненте подключен класс "SBIS3.CONTROLS/Utils/InformationPopupManager" и импортирован в переменную "InformationPopupManager".
    * Производится вызов диалога с кнопками "Да", "Нет" и "Отмена".
    * <pre>
    *    InformationPopupManager.showConfirmDialog({
    *       message: 'Сохранить изменения?',
    *       details: 'Чтобы продолжить редактирование нажмите, «Отмена».',
    *       opener: self
    *    });
    * </pre>
    * @class SBIS3.CONTROLS/Utils/InformationPopupManager
    * @author Степин П.В.
    * @public
    */
   function(Deferred,
      cMerge,
      CompoundContainer,
      NotificationVDOM,
      SubmitPopup,
      NotificationPopup,
      NotificationManager,
      constants,
      runDelayed) {
      'use strict';

      var showSubmitDialog = function(config, positiveHandler, negativeHandler, cancelHandler) {
         if (config.message && config.status === 'error') {
            config.message = config.message.toString().replace('Error: ', '');
         }
         var popup = new SubmitPopup(cMerge(config, {
            element: $('<div></div>'),
            isModal: true
         }));

         popup.subscribeOnceTo(popup, 'onChoose', function(e, res) {
            var handler;
            switch (res) {
               case true: handler = positiveHandler; break;
               case false: handler = negativeHandler; break;
               default: handler = cancelHandler; break;
            }

            if (handler && typeof handler === 'function') {
               handler.call(popup);
            }
         });

         if (constants.browser.isIE) {
            runDelayed(function() {
               popup.show();
               popup.setActive(true);
            });
         } else {
            popup.show();
            popup.setActive(true);
         }

         return popup;
      };

      return /** @lends SBIS3.CONTROLS/Utils/InformationPopupManager.prototype */{
         /**
          * Открывает диалог с кнопками "Да", "Нет" и "Отмена" (опционально), в котором при нажатии на кнопку выполняется пользовательский обработчик.
          * @remark
          * Открываемый диалог строится на основе экземпляра класса {@link SBIS3.CONTROLS/SubmitPopup}.
          * Изменению не подлежит значение опции {@link SBIS3.CONTROLS/SubmitPopup#status status}.
          * @param {Object} config Объект c конфигурацией открываемого диалога. В качестве свойств объекта передают опции, соответствующие классу {@link SBIS3.CONTROLS/SubmitPopup}.
          * @param {Function} [positiveHandler] Обработчик нажатия на кнопку "Да". Когда обработчик не установлен, клик по кнопке закрывает диалог.
          * @param {Function} [negativeHandler] Обработчик нажатия на кнопку "Нет". Когда обработчик не установлен, клик по кнопке закрывает диалог.
          * @param {Function} [cancelHandler] Обработчик нажатия на кнопку "Отмена".
          * @returns {SBIS3.CONTROLS/SubmitPopup} Экземпляр класса диалога.
          * @example
          * <pre>
          * InformationPopupManager.showConfirmDialog(
          *    {
          *       message: 'Сохранить изменения?',
          *       details: 'Чтобы продолжить редактирование нажмите, «Отмена».',
          *       opener: self
          *    },
          *    myPositiveHandler, myNegativeHandler, cancelHandler
          * );
          * </pre>
          * @see showMessageDialog
          * @see showNotification
          * @see showCustomNotification
          */
         showConfirmDialog: function(config, positiveHandler, negativeHandler, cancelHandler) {
            return showSubmitDialog(cMerge(config, {
               status: 'confirm'
            }), positiveHandler, negativeHandler, cancelHandler);
         },

         /**
          * Открывает диалог с сообщением и одной кнопкой "Ок". Диалог может находиться в одном из трёх состояний: "Ошибка" , "Успешно" или "Предупреждение".
          * @param {Object} config Объект c конфигурацией открываемого диалога - {@link SBIS3.CONTROLS/SubmitPopup}.
          * @param {Function} [handler] Обработчик нажатия на кнопку "Ок".
          * @returns {SBIS3.CONTROLS/SubmitPopup} Экземпляр класса диалога.
          * @example
          * <pre>
          * InformationPopupManager.showMessageDialog(
          *    {
          *       message: 'Изменения были сохранены',
          *       opener: self
          *    },
          *    myOkHandler
          * );
          * </pre>
          * @see showConfirmDialog
          * @see showNotification
          * @see showCustomNotification
          */
         showMessageDialog: function(config, handler) {
            return showSubmitDialog(config, null, null, handler);
         },

         /**
          * Открывает нотификационное сообщение.
          * @param {Object} config Объект c конфигурацией открываемого диалога - {@link SBIS3.CONTROLS/NotificationPopup}.
          * @param {Boolean} notHide true - не скрывать окно по истечению времени жизни.
          * @returns {SBIS3.CONTROLS/NotificationPopup} Экземпляр класса окна нотификационного сообщения.
          * @example
          * <pre>
          * InformationPopupManager.showNotification(
          *    {
          *       icon: 'icon-24 icon-Chat icon-primary',
          *       caption: 'Новое уведомление',
          *       bodyTemplate: myTpl,
          *       opener: self
          *    },
          *    true
          * );
          * </pre>
          * @see showCustomNotification
          * @see showConfirmDialog
          * @see showMessageDialog
          */
         showNotification: function(config, notHide) {
            if (NotificationVDOM.isNewEnvironment()) {
               if (!this._notificationVDOM) {
                  //TODO: Дима Зуев предлагает перейти на создание через new, но падают ошибки.
                  //https://online.sbis.ru/opendoc.html?guid=2be2cedb-91ec-4814-a76c-66c0f62431be
                  this._notificationVDOM = NotificationVDOM.createControl(NotificationVDOM, {}, $('<div></div>'));

                  /**
                   * Ассоциативный объект значений опций старого и нового шаблона.
                   * [значение в старом шаблоне]: значение в новом шаблоне
                   */
                  this._styles = {
                     success: 'done',
                     error: 'error',
                     warning: 'warning'
                  };

                  /**
                   * Аналогично this._styles.
                   */
                  this._icon = {
                     success: 'icon-size icon-24 icon-Yes icon-done',
                     error: 'icon-size icon-24 icon-Alert icon-error',
                     warning: 'icon-size icon-24 icon-Alert icon-attention'
                  };
               }

               /**
                * Эмулируем код в init SBIS3.CONTROLS/NotificationPopup
                */
               if (!('closeButton' in config)) {
                  config.closeButton = true;
               }
               if (!('icon' in config)) {
                  config.icon = this._icon[config.status];
               }

               /**
                * Прикладники обращаесь через .getParent() получали popup, в нашем случае opener, сейчас
                * получают Controls/Popup/Templates/Notification/Compatible в нем нужно
                * пробросить вызовы в opener. Поэтому передаем его.
                */
               config._opener = this._notificationVDOM;

               /**
                * В старом окружении метод возвращает инстанс компонента. В vdom кружении мы не можем его вернуть, потому что он создается ассинхронно,
                * будем возвращать Deferred в callback которого придет инстанс компонента окна. Для этого в Controls/Popup/Compatible/Notification
                * отдадим Deferred в опцию _def и отдадим его из метода.
                * Прикладные разработчики у себя поправят код на работу с Deferred.
                */
               config._def = new Deferred();

               /**
                * Используем базовый шаблон vdom нотификационных окон с контентом Core/CompoundContainer для
                * оэивления старых компонентов. А ему в качестве контента отдадим эмуляцию SBIS3.CONTROLS/NotificationPopup,
                * а именно Controls/Popup/Templates/Notification/Compatible
                */
               this._notificationVDOM.open({
                  template: 'Controls/Popup/Compatible/Notification/Base',
                  templateOptions: {
                     autoClose: !notHide,
                     contentTemplateOptions: {
                        component: 'Controls/Popup/Compatible/Notification',
                        componentOptions: config
                     },
                     style: this._styles[config.status],
                     contentTemplate: CompoundContainer,
                     iconClose: config.closeButton || true
                  }
               });
               this._notificationVDOM.isDestroyed = function() {
                  return false;
               };

               return config._def;
            } else {
               var popup = new NotificationPopup(cMerge({
                  element: $('<div></div>')
               }, config));

               NotificationManager.showNotification(popup, notHide);

               return popup;
            }
         },

         /**
          * Открывает произвольное нотификационное сообщение.
          * @param {SBIS3.CONTROLS/Mixins/PopupMixin|*} inst Экземпляр класса окна. Это может быть любое окно, созданное на основе указанного миксина.
          * @param {Boolean} notHide true - не скрывать окно по истечению времени жизни.
          * @see showNotification
          * @see showConfirmDialog
          * @see showMessageDialog
          */
         showCustomNotification: function(inst, notHide) {
            NotificationManager.showNotification(inst, notHide);
            return inst;
         }
      };
   }
);
