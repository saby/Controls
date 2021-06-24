import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/Application/Compatible';
import * as Deferred from 'Core/Deferred';
import * as Layer from 'Lib/Control/LayerCompatible/LayerCompatible';
import {Bus} from 'Env/Event';
import {constants} from 'Env/Env';

export = class ViewTemplate extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   protected _beforeMount(): void {
      try {
         /* TODO: set to presentation service */
         process.domain.req.compatible = true;
      } catch (e) {
      }
      const rightsInitialized = new Deferred();
      this._forceUpdate = function() {

      };
      if (constants.isBrowserPlatform) {
         constants.rights = true;
         Layer.load(undefined, true).addCallback(() => {
            rightsInitialized.callback();
         });
         return rightsInitialized;
      }
   }
   protected _afterMount(): void {
      for (const i in this._children) {
         this._children[i]._forceUpdate = function() {

         };
         this._children[i]._shouldUpdate = function() {
            return false;
         };
      }
      require(['Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator'], () => {
         Bus.globalChannel().notify('bootupReady', { error: '' });
      });
   }
   protected _shouldUpdate(): boolean {
      return false;
   }
};
