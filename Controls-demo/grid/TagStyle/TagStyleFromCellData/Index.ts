import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {CollectionItem} from 'Controls/display';
import {IItemAction} from 'Controls/_list/Swipe/interface/IItemAction';

import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

import * as template from 'wml!Controls-demo/grid/TagStyle/TagStyleFromCellData/TagStyleFromCellData';
import {Record} from 'saby-types/Types/entity';

const actions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-primary icon-PhoneNull',
        title: 'phone'
    },
    {
        id: 2,
        icon: 'icon-primary icon-EmptyMessage',
        title: 'message'
    }
];

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    protected _columns: any;

    protected _tagStyleProperty: string;

    /// for actions
    protected _itemActions: IItemAction[];

    constructor(cfg: any) {
        super(cfg);
        this._tagStyleProperty = 'customProperty';
        this._columns = this._getModifiedColumns();
        this._itemActions = actions;
    }

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        const data = this._getModifiedData().slice(0, 12);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    /**
     * Эти хандлеры срабатывают при клике на Tag в шаблоне Column.wml
     * @param event
     * @param item
     * @param columnIndex
     * @param nativeEvent
     * @private
     */
    protected _onTagClickCustomHandler(event: Event, item: CollectionItem<any>, columnIndex: number, nativeEvent: Event): void {
        console.log('tagClick event is caught!');
        console.log(item);
        console.log(nativeEvent);
        console.log(columnIndex);
    }

    /**
     * Эти хандлеры срабатывают при наведении на Tag в шаблоне Column.wml
     * @param event
     * @param item
     * @param columnIndex
     * @param nativeEvent
     * @private
     */
    protected _onTagHoverCustomHandler(event: Event, item: CollectionItem<any>, columnIndex: number, nativeEvent: Event): void {
        console.log('tagHover event is caught!');
        console.log(item);
        console.log(nativeEvent);
        console.log(columnIndex);
    }

    // For actions section

    protected _showAction(action: IItemAction, item: Record): boolean {
        if (item.get('id') === '471329') {
            return action.id !== 2 && action.id !== 3;
        }
        if (action.id === 5) {
            return false;
        }
        if (item.get('id') === '448390') {
            return false;
        }
        return true;
    }

    // End for actions section

    /**
     * Получаем список колонок с необходимыми настройками
     * @private
     */
    private _getModifiedColumns(): any {
        const result = getCountriesStats().getColumnsWithFixedWidths().map((cur, i) => {
            if (i === 3) {
                return {
                    ...cur,
                    tagStyleProperty: this._tagStyleProperty
                };
            }
            return cur;
        });
        return result;
    }

    private _getModifiedData(): any {
        const styleVariants = [
            'info',
            'danger',
            'primary',
            'success',
            'warning',
            'secondary'
        ];
        return getCountriesStats().getData().map((cur, i) => {
            const index = i <= (styleVariants.length - 1) ? i : i % (styleVariants.length - 1);
            return {
                ...cur,
                [this._tagStyleProperty]: styleVariants[index]
            };
        });
    }
}
