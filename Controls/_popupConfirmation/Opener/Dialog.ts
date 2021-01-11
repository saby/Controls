import rk = require('i18n!Controls');
/// <amd-module name='Controls/_popupConfirmation/Opener/Dialog' />
// @ts-ignore
import { Converter as MarkupConverter } from 'Controls/decorator';
// @ts-ignore
import {Control} from 'UI/Base';
// @ts-ignore
import { constants } from 'Env/Env';
// @ts-ignore
import entity = require('Types/entity');
// @ts-ignore
import contentTemplate = require('wml!Controls/_popupConfirmation/Opener/Dialog/content');
// @ts-ignore
import messageTemplate = require('wml!Controls/_popupConfirmation/Opener/Dialog/message');
// @ts-ignore
import detailsTemplate = require('wml!Controls/_popupConfirmation/Opener/Dialog/details');
// @ts-ignore
import template = require('wml!Controls/_popupConfirmation/Opener/Dialog/Dialog');

import {Logger} from 'UI/Utils';


var _private = {
   keyPressed: function (e) {
      if (e.nativeEvent.keyCode === constants.key.esc) {
         // for 'ok' and 'yesnocancel' type value equal undefined
         var result = this._options.type === 'yesno' ? false : undefined;
         this._sendResult(result);
         e.stopPropagation();
      }
   }
};
/**
 * Класс контрола "Окно подтверждения". В зависимости от типа, может быть диалогом подтверждения, с кнопками "Да", "Нет" и "Отмена" (опционально), или диалогом с кнопкой "Ок".
 * @class Controls/_popupConfirmation/Opener/Dialog
 * 
 * @private
 * @author Красильников А.С.
 * @mixes Controls/_popupConfirmation/Opener/Dialog/DialogStyles
 * @demo Controls-demo/Popup/Confirmation/Template
 */
var Submit = Control.extend({
   _template: template,
   _messageMaxLength: 100,
   _detailsMaxLength: 160,
   _messageTemplate: messageTemplate,
   _detailsTemplate: detailsTemplate,
   _contentTemplate: contentTemplate,

   _isEscDown: false,

   _sendResultHandler: function (e, res) {
      this._sendResult(res);
   },

   _sendResult: function (res) {
      this._options.closeHandler(res);
      this._notify('close');
   },

   _keyDown: function (event) {
      if (event.nativeEvent.keyCode === constants.key.esc) {
         this._isEscDown = true;
      }
      if (!(event.nativeEvent.altKey || event.nativeEvent.shiftKey) && (event.nativeEvent.ctrlKey || event.nativeEvent.metaKey) && event.nativeEvent.keyCode === constants.key.enter) { // Ctrl+Enter, Cmd+Enter, Win+Enter
         // If "primary action" processed event, then event must be stopped.
         // Otherwise, parental controls (including other primary action) can react to pressing ctrl+enter and call one more handler
         event.stopPropagation();
         this._onTriggerHandler();
      }
   },

   _keyPressed: function (e) {
      /**
       * Старая панель по событию keydown закрывается и блокирует всплытие события. Новая панель делает
       * то же самое, но по событию keyup. Из-за этого возникает следующая ошибка.
       * https://online.sbis.ru/opendoc.html?guid=0e4a5c02-f64c-4c7d-88b8-3ab200655c27
       *
       * Что бы не трогать старые окна, мы добавляем поведение на закрытие по esc. Закрываем только в том случае,
       * если новая панель поймала событие keydown клавиши esc.
       */
      if (this._isEscDown) {
         this._isEscDown = false;
         _private.keyPressed.call(this, e);
      }
   },
   _getMessage: function () {
      if (this._hasMarkup()) {
         Logger.error('Confirmation: В тексте сообщения присутствует ссылка. Вывод html-тегов должен реализовываться через задание шаблона.', this);
         return MarkupConverter.htmlToJson('<span>' + this._options.message + '</span>');
      }
      return this._options.message;
   },
   _getSize: function () {
      if (this._options.size) {
         return this._options.size;
      }
      if ((this._options.message && this._options.message.length) > this._messageMaxLength ||
         (this._options.details && this._options.details.length) > this._detailsMaxLength) {
         return 'l';
      }
      return 'm';
   },
   _hasMarkup: function () {
      var message = this._options.message;
      return typeof message === 'string' && message.indexOf('<a') > -1 && message.indexOf('</a>') > -1;
   },

   _onTriggerHandler: function () {
      if (this._options.primaryAction === 'no') {
         this._sendResult(false);
      } else {
         this._sendResult(true);
      }
   }
});

Submit.getDefaultOptions = function () {
   return {
      type: 'yesno',
      style: 'default',
      primaryAction: 'yes',
      yesCaption: rk('Да'),
      noCaption: rk('Нет'),
      cancelCaption: rk('Отмена'),
      okCaption: rk('ОК')
   };
};

Submit.getOptionTypes = function () {
   return {
      type: entity.descriptor(String).oneOf([
         'ok',
         'yesno',
         'yesnocancel'
      ]),
      style: entity.descriptor(String).oneOf([
         'default',
         'secondary',
         'success',
         'primary',
         'error',
         'danger'
      ])
   };
};
/**
 * @name Controls/_popupConfirmation/Opener/Dialog#type
 * @cfg {String} Тип диалога
 * @variant ok Диалог с кнопкой "Ок"
 * @variant yesno Диалог с кнопками "Да" и "Нет"
 * @variant yesnocancel Диалог с кнопками "Да", "Нет" и "Отмена"
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#style
 * @cfg {String} Стилевое оформление диалога
 * @variant default По умоланию
 * @variant success Успех
 * @variant error Ошибка
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#message
 * @cfg {String} Устанавливает сообщение
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#details
 * @cfg {String} Устанавливает детали сообщения
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#yesCaption
 * @cfg {String} Устанавливает текст кнопки yes
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#noCaption
 * @cfg {String} Устанавливает текст кнопки no
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#cancelCaption
 * @cfg {String} Устанавливает текст кнопки cancel
 */

/**
 * @name Controls/_popupConfirmation/Opener/Dialog#okCaption
 * @cfg {String} Устанавливает текст кнопки ok
 */

/**
 * @typedef {Boolean|undefined} Result
 * @remark
 * true - Нажата кнопка "Да"
 * false - Нажата кнопка "Нет"
 * undefined - Нажата кнопка "ОК" или "Отмена"
 */

/**
 * @event Происходит при нажатии на кнопку диалога.
 * @name Controls/_popupConfirmation/Opener/Dialog#sendResult
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события
 * @param {Result} Результат
 */
export default Submit;

