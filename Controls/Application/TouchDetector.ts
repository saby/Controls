import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/Application/TouchDetector/TouchDetector';
import {TouchDetect} from 'Env/Touch';
import {TouchContextField} from 'Controls/context';

export = class TouchDetector extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   private _touchDetector: TouchDetect;
   private _touchObjectContext: TouchContextField;

   protected _beforeMount(): void {
      this._touchDetector = TouchDetect.getInstance();
      this._touchObjectContext = new TouchContextField.create();
   }

   isTouch(): boolean {
      return this._touchDetector.isTouch();
   }

   getClass(): string {
      return this._touchDetector.getClass();
   }

   // Объявляем функцию, которая возвращает поля Контекста и их значения.
   // Имя функции фиксировано.
   _getChildContext(): object {
      // Возвращает объект.
      return {
         isTouch: this._touchObjectContext
      };
   }
};
