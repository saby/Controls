/**
 * Created by dv.zuev on 17.01.2018.
 *
 * Вставляем в wml:
 * <Controls.event:Listener event="scroll" on:scroll="myScrollCallback()" />
 */

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_event/Listener');
import {descriptor} from 'Types/entity';

interface IListenerOptions extends IControlOptions {
   event?: string;
   listenAll?: boolean;
}

/**
 * Позволяет реагировать на события родителя, использующего Controls.events:Register в своем шаблоне
 * @class Controls/_event/Register
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Шипин А.А.
 */

/**
 * @name Controls/_event/Register#event
 * @cfg {String} Имя событие, на которое нужно среагировать.
 */

/**
 * @name Controls/_event/Register#listenAll
 * @cfg {boolean} Нужно ли реагировать на события всех родительских контролов с Register в шаблоне,
 *  либо же только на события ближайшего такого контрола
 */

const getConfig = (options: IListenerOptions): IListenerOptions => {
   return {
      listenAll: !!options.listenAll
   };
};

class EventListener extends Control<IListenerOptions> {
   protected _template: TemplateFunction = template;
   protected config: IListenerOptions =  null;
   protected _beforeMount(options: IListenerOptions): void {
      this.config = getConfig(options);
   }

   protected _afterMount(): void {
      this._notify('register', [this._options.event, this, this.callback, this.config], {bubbling: true});
   }

   protected _beforeUnmount(): void {
      this._notify('unregister', [this._options.event, this, this.config], {bubbling: true});
   }

   protected callback(): void {
      this._notify(this._options.event, Array.prototype.slice.call(arguments));
   }

   static getOptionTypes(): object {
      return {
         event: descriptor(String).required(),
         listenAll: descriptor(Boolean)
      };
   }
}

export default EventListener;
