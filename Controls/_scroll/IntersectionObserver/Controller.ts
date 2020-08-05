import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import Observer from './Observer';
import {IIntersectionObserverObject, IIntersectionObserverOptions} from './Types';
import template = require('wml!Controls/_scroll/IntersectionObserver/Controller');
import {descriptor} from "Types/entity";

export interface IIntersectionObserverControllerOptions extends IControlOptions, IIntersectionObserverOptions {
}

/**
 * Контейнер позволяющий отслеживать пересечение с внутренними контейнерами {@link Controls/scroll:IntersectionObserverContainer}.
 * Встроен в скролируемые области {@link Controls/scroll:Container}.
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

class IntersectionObserverController extends Control<IIntersectionObserverControllerOptions> {
    protected _template: TemplateFunction = template;
    private _observer: Observer;

    protected _registerHandler(event: SyntheticEvent, intersectionObserverObject: IIntersectionObserverObject): void {
        if (intersectionObserverObject.observerName !== this._options.observerName) {
            return;
        }
        this._initObserver();
        this._observer.register(this._container, intersectionObserverObject);
        event.stopImmediatePropagation();
    }

    protected _unregisterHandler(event: SyntheticEvent, instId: string, observerName: string): void {
        this._observer.unregister(instId, observerName);
        event.stopImmediatePropagation();
    }

    protected _intersectHandler(items): void {
        this._notify('intersect', [items]);
    }

    protected _beforeUnmount(): void {
        if(this._observer) {
            this._observer.destroy();
            this._observer = null;
        }
    }

    protected _initObserver(): void {
        if (!this._observer) {
            this._observer = new Observer(this._intersectHandler.bind(this), this._options);
        }
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
