import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_scroll/IntersectionObserver/Container');

export interface IIntersectionObserverContainerOptions extends IControlOptions {
   observerName: string;
   data: object;
}

/**
 * Контейнер, позволяющий отслеживать пересечение с внешним контейнером.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
 *
 * @class Controls/_scroll/IntersectionObserver/Container
 * @control
 * @author Красильников А.С.
 * @see Controls/_scroll/IntersectionObserver
 * @public
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Container#observerName
 * @cfg {String} Контроллер следит только за элементами с таким же именем.
 */

/**
 * @name Controls/_scroll/IntersectionObserver/Container#data
 * @cfg {Object} Данные которые приходят в событие {@link Controls/_scroll/IntersectionObserver/Controller#intersect}
 * в качестве параметра.
 */

class  ModuleComponent extends Control<IIntersectionObserverContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _afterMount(): void {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      const container = this._container.get ? this._container.get(0) : this._container;
      this._notify(
          'intersectionObserverRegister',
          [this.getInstanceId(), this._options.observerName, container, this._options.data],
          { bubbling: true });
   }

   protected _beforeUnmount(): void {
      this._notify('intersectionObserverUnregister', [this.getInstanceId()], { bubbling: true });
   }
}

export default ModuleComponent;
