import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_list/Container';
import { IContextOptionsValue } from 'Controls/context';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IListContainerOptions extends IControlOptions {
    id: string;
    _dataOptionsValue: IContextOptionsValue;
}

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
export default class ListContainer extends Control<IListContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _dataOptions: IContextOptionsValue;

    protected _beforeMount(options: IListContainerOptions): void {
        this._dataOptions = ListContainer._getListOptions(options);
    }

    protected _beforeUpdate(options: IListContainerOptions): void {
        this._dataOptions = ListContainer._getListOptions(options);
    }

    protected _notifyEventWithBubbling(e: SyntheticEvent, eventName: string): unknown {
        const eventArgs = Array.prototype.slice.call(arguments, 2);

        if (this._options.id) {
            eventArgs.push(this._options.id);
        }
        e.stopPropagation();
        return this._notify(eventName, eventArgs, {bubbling: true});
    }

    private static _getListOptions(options: IListContainerOptions): IContextOptionsValue {
        let listOptions;

        if (options.id) {
            const dataOptions = options._dataOptionsValue;
            listOptions = dataOptions.listsConfigs[options.id];
            listOptions.selectedKeys = dataOptions.listsSelectedKeys?.[options.id];
            listOptions.excludedKeys = dataOptions.listsExcludedKeys?.[options.id];
        } else {
            listOptions = options._dataOptionsValue;
        }

        return listOptions;
    }
}
