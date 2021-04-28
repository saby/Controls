import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_context/ContextOptionsConsumer';
import ContextOptions, { IContextOptionsValue } from './ContextOptions';

interface IContextOptionsConsumerContext {
    dataContext: typeof ContextOptions;
}

export default class ControllerContextConsumer extends Control {
    _template: TemplateFunction = template;
    protected _dataOptions: IContextOptionsValue;

    protected _beforeMount(options: unknown, context: IContextOptionsConsumerContext): void {
        this._dataOptions = context.dataContext?._$value;
    }

    protected _beforeUpdate(newOptions: unknown, newContext: IContextOptionsConsumerContext): void {
        // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
        this._dataOptions = newContext.dataContext?._$value;
    }

    static contextTypes(): object {
        return {
            dataContext: ContextOptions
        };
    }
}
