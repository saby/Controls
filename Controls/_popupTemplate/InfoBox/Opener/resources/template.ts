import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/InfoBox/Opener/resources/template');
import Utils = require('View/Executor/Utils');
import {load} from 'Core/library';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IInfoboxTemplateOptions} from 'Controls/_popupTemplate/InfoBox';

export default class InfoboxTemplate extends Control<IInfoboxTemplateOptions> {
   protected _template: TemplateFunction = template;

   protected _beforeMount(options: IInfoboxTemplateOptions): Promise<TemplateFunction> | void {
      if (typeof window !== 'undefined' && this._needRequireModule(options.template)) {
         return load(options.template);
      }
   }

   private _needRequireModule(module: string | Function): boolean {
      return typeof module === 'string' && !Utils.RequireHelper.defined(module);
   }

   private _close(): void {
      // todo For Compatible. Remove after https://online.sbis.ru/opendoc.html?guid=dedf534a-3498-4b93-b09c-0f36f7c91ab5
      this._notify('sendResult', [{ type: 'close' }], { bubbling: true });
      this._notify('close');
   }
   private _sendResult(event: SyntheticEvent<MouseEvent>): void {
      this._notify('sendResult', [event], { bubbling: true });
   }

   static _theme: string[] = ['Controls/popupTemplate'];
}
