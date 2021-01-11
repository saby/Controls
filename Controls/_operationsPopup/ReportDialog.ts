import rk = require('i18n!Controls');
import {Control} from 'UI/Base';
// @ts-ignore
import format = require('Core/helpers/String/format');
import template = require('wml!Controls/_operationsPopup/ReportDialog/ReportDialog');


   /**
    * Шаблон диалога с результатами массовых операций.
    *
    * @class Controls/_operationsPopup/ReportDialog
    * @extends UI/Base:Control
    * 
    * @author Сухоручкин А.С.
    * @public
    *
    */
   /*
    * The template of the dialog with the results of mass operations.
    *
    * @class Controls/_operationsPopup/ReportDialog
    * @extends UI/Base:Control
    * 
    * @author Сухоручкин А.С.
    * @public
    *
    */
   var ReportDialog = Control.extend({
      _template: template,
      _message: null,
      _beforeMount: function(cfg) {
         if (cfg.operationsCount === cfg.operationsSuccess) {
            this._message = format({
               count: cfg.operationsCount,
               record: rk("запись(-и,-ей)", cfg.operationsCount),
               process: rk("обработана(-ы)", "ReportDialog", cfg.operationsCount)
            }, rk('$count$s$ $record$s$ успешно $process$s$'));
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
   export = ReportDialog;

