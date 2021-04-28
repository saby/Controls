import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_context/ContextOptionsProvider';
import ContextOptions, { IContextOptionsValue } from './ContextOptions';

interface IOptions extends IControlOptions {
    value: IContextOptionsValue;
}

const CONTEXT_FIELDS: ReadonlyArray<keyof IContextOptionsValue> = [
    'newLayout',
    'items',
    'source',
    'keyProperty',
    'filter',
    'sourceController',
    'listsConfigs',
    'listsSelectedKeys',
    'listsExcludedKeys',
    'contrastBackground',
    'newDesign'
];

export default class ControllerContextProvider extends Control<IOptions> {
    _template: TemplateFunction = template;
    protected _dataContext: typeof ContextOptions;

    protected _beforeMount(options: IOptions): void {
        this._dataContext = new ContextOptions(getConfigForContext(options.value));
    }

    protected _beforeUpdate(newOptions: IOptions): void {
        if (hasChanges(this._options.value, newOptions.value)) {
            this._dataContext.updateValue(getConfigForContext(newOptions.value));
        }
    }

    _getChildContext(): object {
        return {
            dataContext: this._dataContext
        };
    }
}

function getConfigForContext(options: object): IContextOptionsValue {
    const importantOptions = {};
    CONTEXT_FIELDS.forEach((fieldName) => {
        importantOptions[fieldName] = options[fieldName];
    });
    return importantOptions;
}

function hasChanges(oldContextValue: IContextOptionsValue, newContextValue: IContextOptionsValue): boolean {
    return CONTEXT_FIELDS.some((fieldName) => {
        const oldValue = oldContextValue[fieldName];
        const newValue = newContextValue[fieldName];
        if (oldValue === newValue) {
            if (oldValue && typeof oldValue.getVersion === 'function') {
                return oldValue.getVersion() !== newValue.getVersion();
            } else {
                return false;
            }
        }
        return true;
    });
}
