import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import SyntheticEntry from 'Controls/_scroll/IntersectionObserver/SyntheticEntry';
import {IIntersectionObserverObject, IIntersectionObserverOptions} from './Types';
import template = require('wml!Controls/_scroll/IntersectionObserver/Controller');
import {descriptor} from "Types/entity";

export interface IIntersectionObserverControllerOptions extends IControlOptions, IIntersectionObserverOptions {
}

/**
 * Контейнер позволяющий отслеживать пересечение с внутренними контейнерами {@link Controls/scroll:IntersectionObserverContainer}.
 * Встроен в скролируемые области {@link Controls/scroll:Container}.
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
 * каждые 25% целевого элемента:  [0, 0.25, 0.5, 0.75, 1]
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Controller#rootMargin
 * @cfg {String} Смещение прямоугольника, применяемое к bounding box корня при расчёте пересечений,
 * эффективно сжимает или увеличивает корень для целей расчёта. Может быть выражено в пикселях (px) или в процентах (%).
 * Например "50% 0px 0px 0px"
 * @default "0px 0px 0px 0px".
 */

/**
 * @event Controls/_scroll/IntersectionObserver/Controller#intersect Происходит когда цель достигает порогового значения,
 * указанного в опции threshold
 */

interface IIntersectionContainersMap {
   [key: string]: IIntersectionObserverObject;
}

interface IObserversMap {
   [key: string]: IntersectionObserver;
}

const RPLACE_SPACE_IN_KEY_REGEXP = / /g;

class  IntersectionObserverController extends Control<IIntersectionObserverControllerOptions> {
   protected _template: TemplateFunction = template;
   protected _observers: IObserversMap = {};
   protected _items: IIntersectionContainersMap = {};

   protected _registerHandler(event: SyntheticEvent, intersectionObserverObject: IIntersectionObserverObject): void {
      if (intersectionObserverObject.observerName !== this._options.observerName) {
         return;
      }

      const item: IIntersectionObserverObject = {
         ...intersectionObserverObject,
         threshold: intersectionObserverObject.threshold || this._options.threshold,
         rootMargin: intersectionObserverObject.rootMargin || this._options.rootMargin,
      }
      this._items[intersectionObserverObject.instId] = item;
      this._observe(item.element, item.threshold, item.rootMargin);
      event.stopImmediatePropagation();
   }

   protected _unregisterHandler(event: SyntheticEvent, instId: string): void {
      const item = this._items[instId];
      this._unobserve(item.element, item.threshold, item.rootMargin);
      delete this._items[instId];
   }

   private _observe(element: HTMLElement, threshold: number[], rootMargin: string): void {
      const key = this._getObserverKey(threshold, rootMargin);
      const observer = this._createObserver(threshold, rootMargin);
      if (this._observers.hasOwnProperty(key)) {
         this._observers[key].observe(element);
      } else {
         observer.observe(element);
         this._observers[key] = observer;
      }

   }

   private _unobserve(element: HTMLElement, threshold: number[], rootMargin: string): void {
      const key = this._getObserverKey(threshold, rootMargin);
      const observer = this._observers[key];
      observer.unobserve(element);
      if (!observer.takeRecords().length) {
         delete this._observers[key];
      }
   }

   private _getObserverKey(threshold: number[], rootMargin: string): string {
      return `t${threshold.join('_')}_rm${rootMargin.replace(RPLACE_SPACE_IN_KEY_REGEXP, '_')}`
   }

   private _createObserver(threshold: number[], rootMargin: string): IntersectionObserver {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      const container = this._container.get ? this._container.get(0) : this._container;
      return new IntersectionObserver(this._intersectionObserverHandler.bind(this), {
         root: container,
         threshold: threshold,
         rootMargin: rootMargin
      });
   }

   private _intersectionObserverHandler(entries: IntersectionObserverEntry[]): void {
      const items: object[] = [];
      let itemId;
      for (const entry of entries) {
         itemId = Object.keys(this._items).find((key) => this._items[key].element === entry.target);
         // don't handle unregistered containers
         if (itemId) {
            const eventEntry = new SyntheticEntry(entry, this._items[itemId].data)
            items.push(eventEntry);
            this._items[itemId].handler(eventEntry);
         }
      }
      if (items.length) {
         this._notify('intersect', [items]);
      }
   }

   protected _beforeUnmount(): void {
      for (const observer of this._observers.values()) {
         observer.disconnect()
      }
      this._observers = null;
   }

   static getOptionTypes(): object {
        return {
            threshold: descriptor(Array),
            rootMargin: descriptor(String)
        };
    }

    static getDefaultOptions(): object {
        return {
            threshold: [1],
            rootMargin: '0px 0px 0px 0px'
        };
    }
}

export default IntersectionObserverController;
