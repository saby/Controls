import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/Panel/Container';
import { isEqual } from 'Types/object';
import { TKeysSelection as TKeys, TKeySelection as TKey } from 'Controls/interface';

export interface IOperationsPanelContainerOptions extends IControlOptions {
    selectedKeys: TKeys;
    listMarkedKey: TKey;
    selectedKeysCount: number;
}

/**
 * Контрол используют в качестве контейнера для {@link Controls/operations:Panel}.
 * Он обеспечивает передачу выделения (опции selectedKeys, excludedKeys, markedKey) между {@link Controls/operations:Controller} и {@link Controls/operations:Panel}.
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/operations/basic-configuration/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 *
 * @class Controls/_operations/Panel/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @control
 * @public
 */
export default class OperationsPanelContainer extends Control<IOperationsPanelContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: TKeys = [];
    protected _selectedKeysCount: number;

    protected _beforeMount(options: IOperationsPanelContainerOptions): void {
        this._selectedKeys = this._getSelectedKeys(options);
        this._selectedKeysCount = this._getSelectedKeysCount(options, this._selectedKeys);
    }

    protected _beforeUpdate(newOptions: IOperationsPanelContainerOptions): void {
        if (!isEqual(this._options.selectedKeys, newOptions.selectedKeys) ||
            this._options.listMarkedKey !== newOptions.listMarkedKey ||
            this._selectedKeysCount !== newOptions.selectedKeysCount) {
            this._selectedKeys = this._getSelectedKeys(newOptions);
            this._selectedKeysCount = this._getSelectedKeysCount(newOptions, this._selectedKeys);
        }
    }

    protected _afterMount(): void {
        this._notify('operationsPanelOpen', [],{bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('operationsPanelClose', [],{bubbling: true});
    }

    private _getSelectedKeysCount(options: IOperationsPanelContainerOptions, selectedKeys: number[]|string[]): number {
        return options.selectedKeys.length ?
            options.selectedKeysCount :
            0;
    }

    private _getSelectedKeys(options: IOperationsPanelContainerOptions): TKeys {
        let result;

        if (!options.selectedKeys.length && options.listMarkedKey !== null) {
            result = [options.listMarkedKey];
        } else {
            result = options.selectedKeys;
        }

        return result;
    }
}
