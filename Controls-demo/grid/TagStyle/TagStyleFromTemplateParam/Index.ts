import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

import * as template from 'wml!Controls-demo/grid/TagStyle/TagStyleFromTemplateParam/TagStyleFromTemplateParam';

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    protected _columns: any;

    // Номер выбранной колонки
    protected _currentColumnIndex: number = null;

    // Тип события
    protected _currentEvent: string;

    // Значение выбранной колонки
    protected _currentValue: string;

    // Настройка MultiSelect
    protected _multiSelectVisibility: string;

    // for actions
    protected _itemActions: IItemAction[];

    // for toolbar
    protected _toolbarItemsSource: Memory;

    constructor(cfg: any) {
        super(cfg);
        this._tagStyleProperty = 'customProperty';
        this._columns =  getCountriesStats().getColumnsWithFixedWidths();
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
        this._currentColumnIndex = columnIndex;
        this._currentEvent = 'click';
        this._currentValue = item.getContents().get('population');
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
        this._currentColumnIndex = columnIndex;
        this._currentEvent = 'hover';
        this._currentValue = item.getContents().get('population');
    }

    /**
     * Определяет показывать ли действия на колонке
     * @param action
     * @param item
     * @private
     */
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

    /**
     * Обрабатывает клик по тулбару
     * @param event
     * @param item
     * @private
     */
    protected _onToolbarItemClick(event: Event, item: any) {
        if (item.getId() === '1') {
            this._multiSelectVisibility = this._multiSelectVisibility === 'hidden' ? 'visible' : 'hidden';
        }
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
                tagStyle: styleVariants[index]
            };
        });
    }
}
