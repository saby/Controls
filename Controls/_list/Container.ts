import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_list/Container';
import {ContextOptions as DataOptions} from 'Controls/context';
import {ISourceControllerState} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IDataContext {
    dataOptions: ISourceControllerState;
}

export default class ListContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataOptions: ISourceControllerState = null;

    protected _beforeMount(options: IControlOptions, context: IDataContext): void {
        this._dataOptions = context.dataOptions;
    }

    protected _beforeUpdate(options: IControlOptions, context: IDataContext): void {
        this._dataOptions = context.dataOptions;
    }

    protected _notifyEventWithBubbling(e: SyntheticEvent, eventName: string): unknown {
        return this._notify(eventName, Array.prototype.slice.call(arguments, 2), {
            bubbling: true
        });
    }

    static contextTypes(): IDataContext {
        return {
            dataOptions: DataOptions
        };
    }
}

/**
 * Контрол-контейнер для списка. Передает опции из контекста в список.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_list/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @public
 */

/*
 * Container component for List. Pass options from context to list.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/component-kinds/'>here</a>.
 *
 * @class Controls/_list/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @public
 */
