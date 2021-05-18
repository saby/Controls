import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_editableArea/View';
import {Controller} from 'Controls/validate';
import {IViewOptions} from './interface/IView';
import * as Deferred from 'Core/Deferred';
import buttonsTemplate from 'Controls/_editableArea/Templates/Buttons';
import {Record} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/CommonClasses';
import 'css!Controls/editableArea';
import 'css!Controls/list';

'use strict';
/**
 * Контроллер для <a href="/doc/platform/developmentapl/interface-development/controls/input/edit/">редактирования по месту в полях ввода</a>.
 *
 * @class Controls/_editableArea/View
 * @extends UI/Base:Control
 * @mixes Controls/editableArea:IView
 * @author Красильников А.С
 * @public
 *
 * @remark
 * Если в качестве шаблона редактирования используются поля ввода, то при переключении в режим чтения может наблюдаться скачок текста.
 * Для того, чтобы избежать этого, рекомендуется навесить CSS-класс **controls-Input_negativeOffset** на редактируемую область.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_editableArea.less переменные тем оформления}
 *
 * @demo Controls-demo/EditableArea/View/Index
 */

const EDIT_CANCEL: string = 'Cancel';

interface IViewControlOptions extends IViewOptions, IControlOptions {
}

export default class View extends Control<IViewControlOptions> {
   protected _template: TemplateFunction = template;
   protected _buttonsTemplate: typeof buttonsTemplate = buttonsTemplate;
   protected _isEditing: boolean = false;
   protected _editObject: Record;
   protected _children: {
      formController: Controller
   };
   private _isStartEditing: boolean = false;

   protected _beforeMount(newOptions: IViewControlOptions): void {
       this._isEditing = newOptions.autoEdit;
       this._editObject = newOptions.editObject;
   }
   protected _afterMount(): void {
        this._registerFormOperation();
   }
   protected _beforeUpdate(newOptions: IViewControlOptions): void {
      /* В режиме редактирования создается клон, ссылка остается на старый объект.
      Поэтому при изменении опций копируем ссылку актуального объекта */
      if (newOptions.editObject !== this._options.editObject) {
         this._editObject = newOptions.editObject;
      }
   }
   protected _afterUpdate(): void {
      if (this._isStartEditing) {
         this.activate();
         this._isStartEditing = false;
      }
   }

   protected _onClickHandler(event: SyntheticEvent<MouseEvent>): void {
      if (!this._options.readOnly && !this._isEditing) {
         this.beginEdit(event);
      }
   }

   protected _registerFormOperation(): void {
        this._notify('registerFormOperation', [{
            save: this.commitEdit.bind(this),
            cancel: this.cancelEdit.bind(this),
            isDestroyed: () => this._destroyed
        }], {bubbling: true});
    }

   protected _onDeactivatedHandler(): void {
      if (!this._options.readOnly && this._isEditing && !this._options.toolbarVisible) {
         this.commitEdit();
      }
   }

   protected _onKeyDown(event): void {
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
   }

   beginEdit(event: SyntheticEvent<MouseEvent>, res: boolean = false): void {
      this._editObject = this._options.editObject.clone();
      // Если опция editObject изменилась, то она ждет подтверждения изменения, делаем подтверждение у клона.
      this._editObject.acceptChanges();
      // TODO: res - это результат события со старым названием. Снести вместе со старым контролом 3.19.110
      const result = res || this._notify('beforeBeginEdit', [this._editObject], {
         bubbling: true
      });
      if (result !== EDIT_CANCEL) {
         this._isEditing = true;
         this._isStartEditing = true;
      }
   }

   cancelEdit(): Promise<void> {
      /**
       * Защита от ситуации, когда зовут отмену редактирования, а оно не начиналось.
       */
      if (!this._isEditing) {
         return;
      }
      return this._endEdit(false);
   }

   commitEdit(): Promise<void> {
      return this._validate().addCallback((result) => {
         for (const key in result) {
            if (result.hasOwnProperty(key) && result[key]) {
               return Deferred.success();
            }
         }
         return this._endEdit(true);
      });
   }

   private _validate(): Promise<unknown> {
      return this._children.formController.submit({
         activateInput: false
      });
   }
   private _afterEndEdit(commit: boolean): Promise<void> {
      if (commit) {
         this._acceptChanges();
      } else {
         this._editObject.rejectChanges();
      }
      this._isEditing = false;
      this._notify('afterEndEdit', [this._editObject], {
         bubbling: true
      });
      return Deferred.success();
   }
   private _endEdit(commit: boolean): Promise<void> {
      const result = this._notify('beforeEndEdit', [this._editObject, commit], {
         bubbling: true
      });

      if (result === EDIT_CANCEL) {
         return Deferred.success();
      }

      if (result && result.addCallback) {
         return result.addCallback((res) => {
            if (res === EDIT_CANCEL) {
               return Deferred.success();
            }
            return this._afterEndEdit(commit);
         });
      }

      return this._afterEndEdit(commit);
   }
   private _acceptChanges(): void {
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
      const changedFields = this._editObject.getChanged();
      if (changedFields) {
         changedFields.forEach((field) =>{
            this._options.editObject.set(field, this._editObject.get(field));
         });
      }

      /* При старте редактирования в стейт кладется клон
       * Нужно вернуть оригинальную запись, чтобы при изменении в ней изменения отражались в контроле
       */
      this._editObject = this._options.editObject;
   }

   static getDefaultOptions(): IViewControlOptions {
      return {
         autoEdit: false,
         toolbarVisible: false
      };
   }
}

Object.defineProperty(View, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return View.getDefaultOptions();
    }
});
