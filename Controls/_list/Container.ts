import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_list/Container';
import {ContextOptions as DataOptions} from 'Controls/context';
import {ISourceControllerState} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IMultipleListConfigs {
    listConfigs: ISourceControllerState[];
}

interface IDataContext {
    dataOptions: ISourceControllerState | IMultipleListConfigs;
}

export interface IListContainerOptions extends IControlOptions {
    id: string;
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
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less переменные тем оформления}
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
    protected _dataOptions: ISourceControllerState = null;

    protected _beforeMount(options: IListContainerOptions, context: IDataContext): void {
        this._dataOptions = ListContainer._getListOptions(options, context);
    }

    protected _beforeUpdate(options: IListContainerOptions, context: IDataContext): void {
        this._dataOptions = ListContainer._getListOptions(options, context);
    }

    protected _notifyEventWithBubbling(e: SyntheticEvent, eventName: string): unknown {
        return this._notify(eventName, Array.prototype.slice.call(arguments, 2), {
            bubbling: true
        });
    }

    private static _getListOptions(options: IListContainerOptions, dataContext: IDataContext): ISourceControllerState {
        let listOptions;

        if (options.id) {
            listOptions = (dataContext.dataOptions as IMultipleListConfigs).listConfigs[options.id];
        } else {
            listOptions = dataContext.dataOptions;
        }

        return listOptions;
    }

    static contextTypes(): IDataContext {
        return {
            dataOptions: DataOptions
        };
    }
}