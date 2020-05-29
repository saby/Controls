import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import SyntheticEntry from 'Controls/_scroll/IntersectionObserver/SyntheticEntry';
import template = require('wml!Controls/_scroll/IntersectionObserver/Controller');
import {descriptor} from "Types/entity";

export interface IIntersectionObserverControllerOptions extends IControlOptions {
   observerName: string;
   threshold: number[];
}

/**
 * Контейнер позволяющий отслеживать пересечение с внутренними контейнерами.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
 *
 * @class Controls/_scroll/IntersectionObserver/Controller
 * @control
 * @author Красильников А.С.
 * @see Controls/_scroll/IntersectionObserver/Container
 * @demo Controls-demo/Scroll/IntersectionObserverController/Index
 * @public
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Controller#observerName
 * @cfg {String} Контроллер следит только за элементами с таким же именем.
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Controller#threshold
 * @cfg {Array} Число или массив чисел, указывающий, при каком проценте видимости целевого элемента должен
 * сработать callback. Например, в этом случае callback функция будет вызываться при появлении в зоне видимости
 * каждый 25% целевого элемента:  [0, 0.25, 0.5, 0.75, 1]
 */

/**
 * @event Controls/_scroll/IntersectionObserver/Controller#intersect Происходит когда цель достигает порогового значения,
 * указанного в опции threshold
 */

class  ModuleComponent extends Control<IIntersectionObserverControllerOptions> {
   protected _template: TemplateFunction = template;
   protected _observer: IntersectionObserver;
   protected _items: object = {};

   protected _registerHandler(event: SyntheticEvent, instId: string, observerName: string, element: HTMLElement, data: object): void {
      if (observerName === this._options.observerName) {
         this._items[instId] = {
            instId,
            element,
            data
         };
         this._observe(element);
      }
   }

   protected _unregisterHandler(event: SyntheticEvent, instId: string): void {
      // TODO: remove after complete https://online.sbis.ru/opendoc.html?guid=310360e5-ab07-4aa2-8327-f5f8422aedd9
      // _beforeUnmount in IntersectionObserverController called 2 times.
      if (!this._items[instId]) {
         return;
      }
      this._observer.unobserve(this._items[instId].element);
      delete this._items[instId];
   }

   private _observe(element: HTMLElement): void {
      if (!this._observer) {
         this._observer = this._createObserver();
      }
      this._observer.observe(element);
   }

   private _createObserver(): IntersectionObserver {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      const container = this._container.get ? this._container.get(0) : this._container;
      return new IntersectionObserver(this._intersectionObserverHandler.bind(this), {
         root: container,
         threshold: this._options.threshold
      });
   }

   private _intersectionObserverHandler(entries: IntersectionObserverEntry[]): void {
      const items: object[] = [];
      let itemId;
      for (const entry of entries) {
         itemId = Object.keys(this._items).find((key) => this._items[key].element === entry.target);
         // don't handle unregistered containers
         if (itemId) {
            items.push(new SyntheticEntry(entry, this._items[itemId].data));
         }
      }
      if (items.length) {
         this._notify('intersect', [items]);
      }
   }

   protected _beforeUnmount(): void {
      if (this._observer) {
         this._observer.disconnect();
         this._observer = null;
      }
   }

   static getOptionTypes(): object {
        return {
            threshold: descriptor(Array)
        };
    }

    static getDefaultOptions(): object {
        return {
            threshold: [1]
        };
    }
}

export default ModuleComponent;
