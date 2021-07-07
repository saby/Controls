import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/InfoBox/Template/Simple/template';
import {load} from 'Core/library';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IInfoboxTemplateOptions} from 'Controls/_popupTemplate/InfoBox/Template/InfoBox';
import {constants} from 'Env/Env';
import 'css!Controls/popupTemplate';

export default class InfoboxTemplate extends Control<IInfoboxTemplateOptions, TemplateFunction> {
   protected _template: TemplateFunction = template;

   protected _beforeMount(options: IInfoboxTemplateOptions, context: object,
                          receivedState?: TemplateFunction): Promise<TemplateFunction> | void {
      if (constants.isBrowserPlatform && InfoboxTemplate._needRequireModule(options.template)) {
         return load(options.template as string);
      }
   }

   protected _close(): void {
      // todo For Compatible. Remove after https://online.sbis.ru/opendoc.html?guid=dedf534a-3498-4b93-b09c-0f36f7c91ab5
      this._notify('sendResult', [{ type: 'close' }], { bubbling: true });
      this._notify('close');
   }
   protected _sendResult(event: SyntheticEvent<MouseEvent>): void {
      this._notify('sendResult', [event], { bubbling: true });
   }

   private static _needRequireModule(module: string | Function): boolean {
      return typeof module === 'string' && !requirejs.defined(module);
   }
}
