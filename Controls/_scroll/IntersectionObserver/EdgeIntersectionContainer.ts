import {Control, TemplateFunction} from 'UI/Base';
import {IEdgeIntersectionObserverOptions} from './Types';
import EdgeIntersectionObserver from './EdgeIntersectionObserver';
import template = require('wml!Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer');

/**
 * Контейнер, позволяющий отслеживать пересечение своих границ с границами скроллируемой области.
 *
 * @class Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer
 * @control
 * @author Миронов А.Ю.
 * @see Controls/_scroll/Container
 * @public
 */

/**
 * @name Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#topOffset
 * @cfg {number} Смещение относительно верхней границы контенера. Можно отслеживать моменты когда до границы контейнера
 * еще осталось какое то расстояние.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

/**
 * @name Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#bottomOffset
 * @cfg {number} Смещение относительно нижней границы контенера. Можно отслеживать моменты когда до границы контейнера
 * еще осталось какое то расстояние.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

/**
 * @event Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#topIn Происходит когда верхняя граница контейнера
 * становится видимой.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

/**
 * @event Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#topOut Происходит когда верхняя граница контейнера
 * становится невидимой.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

/**
 * @event Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#bottomIn Происходит когда нижняя граница контейнера
 * становится видимой.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

/**
 * @event Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer#bottomOut Происходит когда нижняя граница контейнера
 * становится невидимой.
 * @demo Controls-demo/Scroll/EdgeIntersectionContainer/Default/Index
 */

class EdgeIntersectionObserverContainer extends Control<IEdgeIntersectionObserverOptions> {
    protected _template: TemplateFunction = template;
    protected _observer: EdgeIntersectionObserver;

    protected _afterMount(): void {
        this._observer = new EdgeIntersectionObserver(
            this, this._observeHandler.bind(this), this._children.topTrigger, this._children.bottomTrigger);
    }

    protected _observeHandler(eventName: string): void {
        this._notify(eventName);
    }

    protected _beforeUnmount(): void {
        this._observer.destroy();
        this._observer = null;
    }

    static _theme: string[] = ['Controls/scroll'];
}

export default EdgeIntersectionObserverContainer;
