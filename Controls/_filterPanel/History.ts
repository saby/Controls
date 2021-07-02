import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/History/History';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TemplateFunction} from 'UI/Base';
import {IFilterItem} from 'Controls/filter';
import {Model} from 'Types/entity';
import chain = require('Types/chain');
import Utils = require('Types/util');
import {HistoryUtils} from 'Controls/filter';
import {factory, List, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';
import 'css!Controls/filterPanel';

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

interface IHistoryOptions {
    source: IFilterItem[];
    historyId: string;
}

export default class History extends Control<IHistoryOptions> {
    protected _template: TemplateFunction = template;
    protected _historyItems: RecordSet | List<IFilterItem[]>;

    protected _beforeMount(options: IHistoryOptions): Promise<RecordSet | List<IFilterItem[]>> {
        return this._loadHistoryItems(options.historyId, options.source);
    }

    protected _beforeUpdate(options: IHistoryOptions): void | Promise<RecordSet | List<IFilterItem[]>> {
        if (options.historyId !== this._options.historyId) {
            return this._loadHistoryItems(options.historyId, options.source);
        }
    }

    protected _onPinClick(event: Event, item: Model): void {
        const historySource = this._getHistorySource();
        historySource.update(item, {
            $_pinned: !item.get('pinned')
        });
        this._historyItems = this._filterHistoryItems(historySource.getItems(), this._options.source);
    }

    protected _handleHistoryItemClick(event: SyntheticEvent, filter: IFilterItem): void {
        const historyObject = this._getHistoryObject(filter);
        chain.factory(historyObject).each((elem) => {
            const name = getPropValue(elem, 'name');
            const textValue = getPropValue(elem, 'textValue');
            const value = getPropValue(elem, 'value');
            const needCollapse = getPropValue(elem, 'needCollapse');
            const editorValue = {
                value,
                textValue,
                needCollapse
            };

            this._notify('historyItemClick', [{editorValue, name}]);
        });
    }

    private _getSourceItemByName(source: IFilterItem[], name: string): IFilterItem {
        return source.find((item) => {
            return item.name === name;
        });
    }

    private _getHistorySource(): object {
        return HistoryUtils.getHistorySource({ historyId: this._options.historyId });
    }

    private _getHistoryObject(filterItem: IFilterItem): object {
        return this._getHistorySource().getDataObject(filterItem);
    }

    private _getItemText(filterItem: IFilterItem): string {
        const historyObject = this._getHistoryObject(filterItem);
        const textArr = [];
        chain.factory(historyObject).each((elem) => {
            const sourceItem = this._getSourceItemByName(this._options.source, getPropValue(elem, 'name'));
            const value = getPropValue(elem, 'value');
            const textValue = getPropValue(elem, 'textValue');
            const visibility = getPropValue(elem, 'visibility');

            if (!isEqual(value, getPropValue(sourceItem, 'textValue')) && (visibility === undefined || visibility) && textValue) {
                textArr.push(textValue);
            }
        });
        return textArr.join(', ');
    }

    private _loadHistoryItems(historyId: string, source: IFilterItem[]) {
        if (historyId) {
            const config = {
                historyId,
                recent: 'MAX_HISTORY'
            };
            return HistoryUtils.loadHistoryItems(config).then(
                (items) => {
                    this._historyItems = this._filterHistoryItems(items, source);
                    return this._historyItems;
                }, () => {
                    this._historyItems = new List({ items: [] });
                });
        }
    }

    private _filterHistoryItems(items: RecordSet, source: IFilterItem[]): RecordSet {
        let result;
        if (items) {
            result = chain.factory(items).filter((item) => {
                let validResult = false;

                const objectData = JSON.parse(item.get('ObjectData'));
                if (objectData) {
                    const history = objectData.items || objectData;

                    for (let i = 0, length = history.length; i < length; i++) {
                        const textValue = getPropValue(history[i], 'textValue');
                        const value = getPropValue(history[i], 'value');

                        // 0 and false is valid
                        if (textValue !== '' && textValue !== undefined && textValue !== null) {
                            const originalItem = this._getSourceItemByName(source, getPropValue(history[i], 'name'));
                            const hasResetValue = originalItem && originalItem.hasOwnProperty('resetValue');

                            if (!hasResetValue || hasResetValue && !isEqual(value, getPropValue(originalItem, 'resetValue'))) {
                                validResult = true;
                                break;
                            }
                        }
                    }
                }
                return validResult;
            }).value(factory.recordSet, {adapter: items.getAdapter()});
        } else {
            result = items;
        }

        return result;
    }
}
