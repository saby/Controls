import SyntheticEntry from './SyntheticEntry';
import {IIntersectionObserverObject, IIntersectionObserverOptions} from './Types';
import {IntersectionObserver} from 'Controls/sizeUtils';

interface IIntersectionContainersMap {
   [key: string]: IIntersectionObserverObject;
}

interface IObserverObj {
   count: number;
   observer: IntersectionObserver;
}

interface IObserversMap {
   [key: string]: IObserverObj;
}

const REPLACE_SPACE_IN_KEY_REGEXP = / /g;

export default class StickyHeaderResizeObserver {
    private _options: IIntersectionObserverOptions;
    private _observers: IObserversMap = {};
    private _items: IIntersectionContainersMap = {};
    private _handler: Function;

    constructor(handler: Function, options?: IIntersectionObserverOptions) {
        this._handler = handler;
        this._options = options || {
            threshold: [1],
            rootMargin: '0px 0px 0px 0px'
        };
    }

    register(root: HTMLElement, intersectionObserverObject: IIntersectionObserverObject): void {
        if (intersectionObserverObject.observerName !== this._options.observerName) {
            return;
        }

        const item: IIntersectionObserverObject = {
            ...intersectionObserverObject,
            threshold: intersectionObserverObject.threshold || this._options.threshold,
            rootMargin: intersectionObserverObject.rootMargin || this._options.rootMargin,
        }
        this._items[intersectionObserverObject.instId] = item;
        this._observe(root, item.element, item.threshold, item.rootMargin);
    }

    unregister( instId: string, observerName: string): void {
        if (observerName !== this._options.observerName) {
            return;
        }

        const item = this._items[instId];
        this._unobserve(item.element, item.threshold, item.rootMargin);
        delete this._items[instId];
    }

    private _observe(root: HTMLElement, element: HTMLElement, threshold: number[], rootMargin: string): void {
      const key = this._getObserverKey(threshold, rootMargin);
      if (this._observers.hasOwnProperty(key)) {
         this._observers[key].observer.observe(element);
         this._observers[key].count++;
      } else {
         const observer = this._createObserver(root, threshold, rootMargin);
         observer.observe(element);
         this._observers[key] = {
            count: 1,
            observer
         };
      }

   }

   private _unobserve(element: HTMLElement, threshold: number[], rootMargin: string): void {
      const key: string = this._getObserverKey(threshold, rootMargin);
      const observer: IObserverObj = this._observers[key];
      observer.observer.unobserve(element);
      if (!observer.count) {
         delete this._observers[key];
      }
   }

   private _getObserverKey(threshold: number[], rootMargin: string): string {
      return `t${threshold.join('_')}_rm${rootMargin.replace(REPLACE_SPACE_IN_KEY_REGEXP, '_')}`
   }

   private _createObserver(root: HTMLElement, threshold: number[], rootMargin: string): IntersectionObserver {
      return new IntersectionObserver(this._intersectionObserverHandler.bind(this), {
         root: root,
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
          this._handler(items);
      }
   }

    destroy(): void {
        for (const observerId of Object.keys(this._observers)) {
            this._observers[observerId].observer.disconnect();
        }
        this._observers = null;
    }
}
