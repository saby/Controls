import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import {editing as constEditing} from 'Controls/Constants';
import template = require('wml!Controls/_editableArea/View');
import buttonsTemplate = require('Controls/_editableArea/Templates/Buttons');
import {autoEdit, toolbarVisible, backgroundStyleClass} from './ActualAPI';

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
            return result.addCallback((res) => {
               if (res === constEditing.CANCEL) {
                  return Deferred.success();
               }
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

         /* При старте редактирования в стейт кладется клон
          * Нужно вернуть оригинальную запись, чтобы при изменении в ней изменения отражались в контроле
          */
         self._editObject = self._options.editObject;
      }
   };

/**
 * Контроллер для <a href="/doc/platform/developmentapl/interface-development/controls/input/edit/">редактирования по месту в полях ввода</a>.
 *
 * @class Controls/_editableArea/View
 * @extends Core/Control
 * @mixes Controls/editableArea:IView
 * @mixes Controls/interface:IBackgroundStyle
 * @author Красильников А.С
 * @public
 *
 * @remark
 * Если в качестве шаблона редактирования используются поля ввода, то при переключении в режим чтения может наблюдаться скачок текста.
 * Для того, чтобы избежать этого, рекомендуется навесить CSS-класс **controls-Input_negativeOffset_theme_{{_options.theme}}** на редактируемую область.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_editableArea.less">переменные тем оформления</a>
 *
 * @demo Controls-demo/EditableArea/View/Index
 */

var View = Control.extend( /** @lends Controls/List/View.prototype */ {
   _template: template,
   _buttonsTemplate: buttonsTemplate,
   _isEditing: false,
   _isStartEditing: false,

   _beforeMount: function (newOptions) {
      this._isEditing = autoEdit(newOptions.autoEdit, newOptions.editWhenFirstRendered);
      this._toolbarVisible = toolbarVisible(newOptions.toolbarVisible, newOptions.toolbarVisibility);
      this._backgroundStyleClass = backgroundStyleClass(newOptions.theme, newOptions.backgroundStyle, newOptions.style);
      this._editObject = newOptions.editObject;
   },
   /* В режиме редактирования создается клон, и ссылка остается на старый объект. Поэтому при изменении опций копируем ссылку
    актуального объекта */
   _beforeUpdate: function (newOptions) {
      if (newOptions.editObject !== this._options.editObject) {
         this._editObject = newOptions.editObject;
      }
      this._toolbarVisible = toolbarVisible(newOptions.toolbarVisible, newOptions.toolbarVisibility);
      this._backgroundStyleClass = backgroundStyleClass(newOptions.theme, newOptions.backgroundStyle, newOptions.style);
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
      if (!this._options.readOnly && this._isEditing && !this._toolbarVisible) {
         this.commitEdit();
      }
   },

   _onKeyDown: function (event) {
      if (this._isEditing) {
         switch (event.nativeEvent.keyCode) {
            case 13: // Enter
               this.commitEdit();
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
      /**
       * Защита от ситуации, когда зовут отмену редактирования, а оно не начиналось.
       */
      if (!this._isEditing) {
         return;
      }
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

View._theme = ['Controls/list', 'Controls/editableArea', 'Controls/Classes'];

View.getDefaultOptions = function () {
   return {
      autoEdit: false,
      toolbarVisible: false,
      backgroundStyle: 'default'
   };
};

export default View;
