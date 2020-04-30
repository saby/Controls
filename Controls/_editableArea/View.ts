import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import {editing as constEditing} from 'Controls/Constants';
import template = require('wml!Controls/_editableArea/View');
import buttonsTemplate = require('Controls/_editableArea/Templates/Buttons');
import editAfterRedraw from 'Controls/Utils/editAfterRedraw';
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

         if (result === constEditing.CANCEL) {
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
      }
   };

/**
 * Контроллер для редактирования полей ввода.
 *
 * @class Controls/_editableArea/View
 * @extends Core/Control
 * @mixes Controls/interface/IEditableArea
 * @author Авраменко А.С.
 * @public
 *
 * @remark
 * Если в качестве шаблона редактирования используются поля ввода, то при переключении в режим чтения может наблюдаться скачок текста.
 * Для того, чтобы избежать этого, рекомендуется навесить css класс controls-Input_negativeOffset_theme_{{_options.theme}} на редактируемую область.
 *
 * @demo Controls-demo/EditableArea/EditableArea
 */

/*
 * Controller for editing of input fields.
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
   _isStartEditing: false,

   _beforeMount: function (newOptions) {
      this._isEditing = newOptions.editWhenFirstRendered;
      this._editObject = newOptions.editObject;
   },
   /* В режиме редактирования создается клон, и ссылка остается на старый объект. Поэтому при изменении опций копируем ссылку
    актуального объекта */
   _beforeUpdate: function (newOptions) {
      if (newOptions.editObject !== this._options.editObject) {
         this._editObject = newOptions.editObject;
      }
   },
   _afterUpdate: function () {
      if (this._isStartEditing) {
         this.activate();
         this._isStartEditing = false;
      }
   },

   _onClickHandler: function (event) {
      if (!this._options.readOnly && !this._isEditing) {
         this.beginEdit(event);
      }
   },

   _onDeactivatedHandler: function () {
      if (!this._options.readOnly && this._isEditing && !this._options.toolbarVisibility) {
         editAfterRedraw(this, this.commitEdit.bind(this));
      }
   },

   _onKeyDown: function (event) {
      if (this._isEditing) {
         switch (event.nativeEvent.keyCode) {
            case 13: // Enter
               editAfterRedraw(this, this.commitEdit.bind(this));
               break;
            case 27: // Esc
               this.cancelEdit();
               break;
         }
      }
   },

   beginEdit: function (event, res) {
      this._editObject = this._options.editObject.clone();
      // Если опция editObject изменилась, то она ждет подтверждения изменения, делаем подтверждение у клона.
      this._editObject.acceptChanges();
      // TODO: res - это результат события со старым названием. Снести вместе со старым контролом 3.19.110, как только появится веха
      var result = res || this._notify('beforeBeginEdit', [this._editObject], {
         bubbling: true
      });
      if (result !== constEditing.CANCEL) {
         this._isEditing = true;
         this._isStartEditing = true;
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

View._theme = ['Controls/list']

View.getDefaultOptions = function () {
   return {
      style: 'withoutBackground'
   };
};

export default View;
