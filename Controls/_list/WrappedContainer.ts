import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_list/WrappedContainer';
import Container from 'Controls/_list/Container';

/**
 * Контрол-контейнер для списка. Передает опции из контекста в список.
 *
 * @remark
 * Контейнер ожидает поле контекста "dataOptions", которое поставляет Controls/list:DataContainer.
 * Из поля контекста "dataOptions" контейнер передает в список следующие опции: <a href="/docs/js/Controls/list/View/options/filter/">filter</a>, <a href="/docs/js/Controls/list/View/options/navigation/">navigation</a>, <a href="/docs/js/Controls/list/View/options/sorting/">sorting</a>, <a href="/docs/js/Controls/list/View/options/keyProperty/">keyProperty</a>, <a href="/docs/js/Controls/list/View/options/source/">source</a>, sourceController.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления}
 * * {@link Controls/list:DataContainer}
 *
 * @class Controls/_list/Container
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * @public
 */

/*
 * Container component for List. Pass options from context to list.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/component-kinds/'>here</a>.
 *
 * @class Controls/_list/Container
 * @extends UI/Base:Control
 * @author Герасимов А.М.
 * @public
 */
export default class WrappedContainer extends Control {
    _template: TemplateFunction = template;
    protected _innerTemplate: typeof Container = Container;
}
