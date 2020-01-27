import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import Constants = require('Controls/Constants');
import template = require('wml!Controls/_editableArea/View');
import buttonsTemplate = require('Controls/_editableArea/Templates/Buttons');
import {delay} from 'Types/function';
import 'css!theme?Controls/editableArea';
import 'css!theme?Controls/list';

'use strict';
var
   _private = {
      validate: function (self) {
         return self._children.formController.submit();
      },
      afterEndEdit: function (self, commit) {
         if (commit) {
            _private.acceptChanges(self);
         } else {
            self._editObject.rejectChanges();
         }
         self._isEditing = false;
         self._notify('afterEndEdit', [self._editObject], {
            bubbling: true
         });
         return Deferred.success();
      },
      endEdit: function (self, commit) {
         var result = self._notify('beforeEndEdit', [self._editObject, commit], {
            bubbling: true
         });

         if (result === Constants.editing.CANCEL) {
            return Deferred.success();
         }

         if (result && result.addCallback) {
            return result.addCallback(function () {
               return _private.afterEndEdit(self, commit);
            });
         }

         return _private.afterEndEdit(self, commit);
      },
      acceptChanges: function (self) {
         /*
          * TL;DR: we should never change the state of the record and leave it to the owner.
          *
          * EditableArea should never call neither acceptChanges() nor rejectChanges() because of the following problems:
          *
          * 1) acceptChanges breaks change detection. If we call acceptChanges then the owner of the record has no easy
          * way to know if the record has changed, because isChanged() will return an empty array.
          *
          * 2) rejectChanges() doesn't work if nobody calls acceptChanges() between commits. For example, this scenario
          * wouldn't work: start editing - make changes - commit - start editing again - make changes - cancel. If
          * acceptChanges() is never called then rejectChanges() will revert everything, not just changes made since last commit.
          */
         var changedFields = self._editObject.getChanged();
         if (changedFields) {
            changedFields.forEach(function (field) {
               self._options.editObject.set(field, self._editObject.get(field));
            });
         }
         self._editObject.acceptChanges();
      },
      /**
       * Асинхронно завершить редактирование и сохранить изменения.
       * @remark
       * Асинхронный вызов завершения редактирования решает проблему обработки устаревших данных в дочернем контроле:
       * Например, если у поля ввода установлена опция trim = 'true', то при завершении редактирования будет обработано значение с пробелами,
       * т.к. последовательно произойдет измененние значения поля ввода -> завершение редактирования -> обновление значения в поле ввода.
       */
      delayCommitEdit: function (self): void {
         delay(self.commitEdit.bind(self));
      }
   };

/**
 * Контроллер для редактирования полей ввода.
 * <a href="/materials/demo-ws4-editable-area">Демо-пример</a>.
 *
 * @class Controls/_editableArea/View
 * @extends Core/Control
 * @mixes Controls/interface/IEditableArea
 * @author Авраменко А.С.
 * @public
 *
 * @css @background-color_EditableArea_style_withBackground Background color of the input field with the style option set to "accentHeader".
 * @css @spacing_EditableArea-between-editor-toolbar Spacing between the editor and the toolbar.
 *
 * @demo Controls-demo/EditableArea/EditableArea
 */

/*
 * Controller for editing of input fields.
 * <a href="/materials/demo-ws4-editable-area">Demo</a>.
 *
 * @class Controls/_editableArea/View
 * @extends Core/Control
 * @mixes Controls/interface/IEditableArea
 * @author Авраменко А.С.
 * @public
 *
 */

var View = Control.extend( /** @lends Controls/List/View.prototype */ {
   _template: template,
   _buttonsTemplate: buttonsTemplate,
   _isEditing: false,

   _beforeMount: function (newOptions) {
      this._isEditing = newOptions.editWhenFirstRendered;
      this._editObject = newOptions.editObject.clone();
   },

   _beforeUpdate: function (newOptions) {
      if (this._options.editObject !== newOptions.editObject) {
         this._editObject = newOptions.editObject.clone();
      }
   },

   _afterUpdate: function () {
      if (this._beginEditTarget) {
         // search closest input and focus
         this._beginEditTarget.getElementsByTagName('input')[0].focus();
         this._beginEditTarget = null;
      }
   },

   _onClickHandler: function (event) {
      if (!this._options.readOnly && !this._isEditing) {
         this.beginEdit(event);
      }
   },

   _onDeactivatedHandler: function () {
      if (!this._options.readOnly && this._isEditing && !this._options.toolbarVisibility) {
         _private.delayCommitEdit(this);
      }
   },

   _onKeyDown: function (event) {
      if (this._isEditing) {
         switch (event.nativeEvent.keyCode) {
            case 13: // Enter
               _private.delayCommitEdit(this);
               break;
            case 27: // Esc
               this.cancelEdit();
               break;
         }
      }
   },

   beginEdit: function (event, res) {
      // TODO: res - это результат события со старым названием. Снести вместе со старым контролом 3.19.110, как только появится веха
      var result = res || this._notify('beforeBeginEdit', [this._editObject], {
         bubbling: true
      });
      if (result !== Constants.editing.CANCEL) {
         this._isEditing = true;
         this._beginEditTarget = event ? event.target.closest('.controls-EditableArea__editorWrapper') : null;
      }
   },

   cancelEdit: function () {
      return _private.endEdit(this, false);
   },

   commitEdit: function () {
      var self = this;
      return _private.validate(this).addCallback(function (result) {
         for (var key in result) {
            if (result.hasOwnProperty(key) && result[key]) {
               return Deferred.success();
            }
         }
         return _private.endEdit(self, true);
      });
   }
});

View.getDefaultOptions = function () {
   return {
      style: 'withoutBackground'
   };
};

export default View;
