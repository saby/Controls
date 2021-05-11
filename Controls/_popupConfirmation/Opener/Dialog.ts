import * as rk from 'i18n!Controls';
import { Converter as MarkupConverter } from 'Controls/decorator';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants} from 'Env/Env';
import {descriptor} from 'Types/entity';
import * as contentTemplate from 'wml!Controls/_popupConfirmation/Opener/Dialog/content';
import * as messageTemplate from 'wml!Controls/_popupConfirmation/Opener/Dialog/message';
import * as detailsTemplate from 'wml!Controls/_popupConfirmation/Opener/Dialog/details';
import * as template from 'wml!Controls/_popupConfirmation/Opener/Dialog/Dialog';

import {Logger} from 'UI/Utils';

const _private = {
   keyPressed(e) {
      if (e.nativeEvent.keyCode === constants.key.esc) {
         // for 'ok' and 'yesnocancel' type value equal undefined
         const result = this._options.type === 'yesno' ? false : undefined;
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
export default class ConfirmDialog extends Control<IControlOptions> {
   _template: TemplateFunction = template;
   _messageMaxLength: number = 100;
   _detailsMaxLength: number = 160;
   _messageTemplate: TemplateFunction = messageTemplate;
   _detailsTemplate: TemplateFunction = detailsTemplate;
   _contentTemplate: TemplateFunction = contentTemplate;

   _isEscDown: boolean = false;

   protected _sendResultHandler(e, res): void {
      this._sendResult(res);
   }

   private _sendResult(res): void {
      this._options.closeHandler(res);
      this._notify('close');
   }

   protected _keyDown(event): void {
      if (event.nativeEvent.keyCode === constants.key.esc) {
         this._isEscDown = true;
      }
      if (!(event.nativeEvent.altKey || event.nativeEvent.shiftKey) && (event.nativeEvent.ctrlKey || event.nativeEvent.metaKey) && event.nativeEvent.keyCode === constants.key.enter) { // Ctrl+Enter, Cmd+Enter, Win+Enter
         // If "primary action" processed event, then event must be stopped.
         // Otherwise, parental controls (including other primary action) can react to pressing ctrl+enter and call one more handler
         event.stopPropagation();
         this._onTriggerHandler();
      }
   }

   protected _keyPressed(e): void {
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
   }
   protected _getMessage(): string {
      if (this._hasMarkup()) {
         Logger.error('Confirmation: В тексте сообщения присутствует ссылка. Вывод html-тегов должен реализовываться через задание шаблона.', this);
         return MarkupConverter.htmlToJson('<span>' + this._options.message + '</span>');
      }
      return this._options.message;
   }
   protected _getSize(): string {
      if (this._options.size) {
         return this._options.size;
      }
      if ((this._options.message && this._options.message.length) > this._messageMaxLength ||
         (this._options.details && this._options.details.length) > this._detailsMaxLength) {
         return 'l';
      }
      return 'm';
   }
   private _hasMarkup(): boolean {
      const message = this._options.message;
      return typeof message === 'string' && message.indexOf('<a') > -1 && message.indexOf('</a>') > -1;
   }

   private _onTriggerHandler(): void {
      if (this._options.primaryAction === 'no') {
         this._sendResult(false);
      } else {
         this._sendResult(true);
      }
   }

   static getOptionTypes(): object {
      return {
         type: descriptor(String).oneOf([
            'ok',
            'yesno',
            'yesnocancel'
         ]),
         style: descriptor(String).oneOf([
            'default',
            'secondary',
            'success',
            'primary',
            'error',
            'danger'
         ])
      };
   }

   static getDefaultOptions(): IControlOptions {
      return {
         type: 'yesno',
         style: 'default',
         primaryAction: 'yes',
         yesCaption: rk('Да'),
         noCaption: rk('Нет'),
         cancelCaption: rk('Отмена'),
         okCaption: rk('ОК')
      };
   }
}

Object.defineProperty(ConfirmDialog, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ConfirmDialog.getDefaultOptions();
   }
});

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
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события
 * @param {Result} Результат
 */
