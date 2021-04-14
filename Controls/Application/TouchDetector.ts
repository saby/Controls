import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/Application/TouchDetector/TouchDetector';
import {TouchDetect} from 'Env/Touch';

export = class TouchDetector extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   private _touchDetector: TouchDetect;

   protected _beforeMount(): void {
      this._touchDetector = TouchDetect.getInstance();
   }

   isTouch(): boolean {
      return this._touchDetector.isTouch();
   }

   getClass(): string {
      return this._touchDetector.getClass();
   }
};
