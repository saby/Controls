import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import SyntheticEntry from './SyntheticEntry';
import {IIntersectionObserverOptions} from './Types';
import template = require('wml!Controls/_scroll/IntersectionObserver/Container');

export interface IIntersectionObserverContainerOptions extends IControlOptions, IIntersectionObserverOptions {
   data: object;
}

/**
 * Контейнер, позволяющий отслеживать пересечение с внешним контейнером.
 * 
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @class Controls/_scroll/IntersectionObserver/Container
 * 
 * @author Красильников А.С.
 * @see Controls/_scroll/IntersectionObserver
 * @public
 */
class  IntersectionObserverContainer extends Control<IIntersectionObserverContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _afterMount(): void {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      const container = this._container.get ? this._container.get(0) : this._container;
      this._notify(
         'intersectionObserverRegister',
         [{
            instId: this.getInstanceId(),
            observerName: this._options.observerName,
            element: container,
            threshold: this._options.threshold,
            rootMargin: this._options.rootMargin,
            data: this._options.data,
            handler: this._observeHandler.bind(this)
         }],
         { bubbling: true });
   }

   private _observeHandler(item: SyntheticEntry): void {
      this._notify('intersect', [item]);
   }

   protected _beforeUnmount(): void {
      this._notify('intersectionObserverUnregister', [this.getInstanceId(), this._options.observerName], { bubbling: true });
   }
}

export default IntersectionObserverContainer;
/**
 * @name Controls/_scroll/IntersectionObserver/Container#observerName
 * @cfg {String} Имя которое используется при регистрации в контроллере {@link Controls/scroll:IntersectionObserverController}.
 * Контроллер следит только за элементами с таким же именем. Если не задано, то используется контроллер на уровне
 * ближайшей скроллируемой области {@link Controls/scroll:Container}.
 * @demo Controls-demo/Scroll/IntersectionObserver/Default/Index
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Container#threshold
 * @cfg {Array} Число или массив чисел, указывающий, при каком проценте видимости целевого элемента должен
 * сработать callback. Например, в этом случае callback функция будет вызываться при появлении в зоне видимости
 * каждые 25% целевого элемента:  [0, 0.25, 0.5, 0.75, 1]
 * @demo Controls-demo/Scroll/IntersectionObserver/Threshold/Index
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Container#rootMargin
 * @cfg {String} Смещение прямоугольника, применяемое к bounding box корня при расчёте пересечений/
 * Эффективно сжимает или увеличивает корень для целей расчёта. Может быть выражено в пикселях (px) или в процентах (%).
 * Например "50% 0px 0px 0px"
 * @default "0px 0px 0px 0px".
 * @demo Controls-demo/Scroll/IntersectionObserver/RootMargin/Index
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Container#data
 * @cfg {Object} Данные которые приходят в событие {@link Controls/_scroll/IntersectionObserver/Container#intersect}
 * в качестве параметра.
 * @demo Controls-demo/Scroll/IntersectionObserver/Default/Index
 */

/**
 * @event Происходит когда цель достигает порогового значения, указанного в опции threshold
 * @name Controls/_scroll/IntersectionObserver/Container#intersect
 * @demo Controls-demo/Scroll/IntersectionObserver/Default/Index
 */