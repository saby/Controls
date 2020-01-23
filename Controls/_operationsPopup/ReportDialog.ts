import rk = require('i18n!Controls');
import Control = require('Core/Control');
// @ts-ignore
import format = require('Core/helpers/String/format');
import template = require('wml!Controls/_operationsPopup/ReportDialog/ReportDialog');


   /**
    * Шаблон диалога с результатами массовых операций.
    *
    * @class Controls/_operationsPopup/ReportDialog
    * @extends Core/Control
    * @control
    * @author Сухоручкин А.С.
    * @public
    *
    * @css @font-size_ReportDialog-title Заголовок - размер шрифта.
    * @css @color_ReportDialog-title Заголовок - цвет текста.
    * @css @color_ReportDialog-message Сообщение - цвет текста.
    * @css @color_ReportDialog-error Блок с текстами сообщений об ошибках выполнения массовой операции - цвет текста.
    * @css @spacing_ReportDialog-between-title-message Расстояние между заголовком и текстом сообщения.
    * @css @spacing_ReportDialog-between-message-errors Расстояние между текстом сообщения и блоком с текстами сообщений об ошибках.
    * @css @spacing_ReportDialog-between-errors Расстояние между сообщениями об ошибках.
    *
    */
   /*
    * The template of the dialog with the results of mass operations.
    *
    * @class Controls/_operationsPopup/ReportDialog
    * @extends Core/Control
    * @control
    * @author Сухоручкин А.С.
    * @public
    *
    * @css @font-size_ReportDialog-title Title font-size.
    * @css @color_ReportDialog-title Title text color.
    * @css @color_ReportDialog-message Message text color.
    * @css @color_ReportDialog-error Errors text color.
    * @css @spacing_ReportDialog-between-title-message Spacing between title and message.
    * @css @spacing_ReportDialog-between-message-errors Spacing between message and errors.
    * @css @spacing_ReportDialog-between-errors Spacing between errors.
    *
    */

   /**
    * @name Controls/_operationsPopup/ReportDialog#title
    * @cfg {String} The title of the operation.
    */

   /**
    * @name Controls/_operationsPopup/ReportDialog#operationsCount
    * @cfg {Number} The number of elements on which the operation was performed.
    */

   /**
    * @name Controls/_operationsPopup/ReportDialog#operationsSuccess
    * @cfg {Number} Number of items for which the operation completed successfully.
    */

   /**
    * @name Controls/_operationsPopup/ReportDialog#errors
    * @cfg {Array.<String>} Error list.
    * @remark
    * If the error list is not passed, the default text will be shown.
    */

   /**
    * @name Controls/_operationsPopup/ReportDialog#footerContentTemplate
    * @cfg {Function} Template displayed at the bottom of the dialog.
    */


   var ReportDialog = Control.extend({
      _template: template,
      _message: null,
      _beforeMount: function(cfg) {
         if (cfg.operationsCount === cfg.operationsSuccess) {
            this._message = format({
               count: cfg.operationsCount
            }, rk('$count$s$ записей успешно обработаны'));
         } else if (!cfg.errors || !cfg.errors.length) {
            this._message = rk('Выполнение операции завершилось ошибкой');
         } else {
            this._message = format({
               count: cfg.operationsCount,
               errors: cfg.operationsCount - cfg.operationsSuccess
            }, rk('$errors$s$ из $count$s$ операций были обработаны с ошибкой'));
         }
      },
      _onCloseClick: function() {
         this._notify('close', [], {bubbling: true});
      }
   });
   ReportDialog._theme = ['Controls/operationsPopup'];
   export = ReportDialog;

