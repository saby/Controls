import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

import * as template from 'wml!Controls-demo/grid/TagStyle/TagStyleFromCellData/TagStyleFromCellData';
import {IGridViewItemData} from '../../../../Controls/_grid/interface/IGridViewItemData';

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    protected _columns: any;

    protected _tagStyleProperty: string;

    constructor(cfg: any) {
        super(cfg);
        this._tagStyleProperty = 'customProperty';
        this._columns = this._getModifiedColumns();
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
     * @private
     */
    protected _onTagClickHandler(event: Event, itemData: IGridViewItemData): void {
        console.log('tagClick event is caught!');
        console.log(itemData);
    }

    /**
     * Эти хандлеры срабатывают при наведении на Tag в шаблоне Column.wml
     * @private
     */
    protected _onTagHoverHandler(event: Event, itemData: IGridViewItemData): void {
        console.log('tagHover event is caught!');
        console.log(itemData);
    }

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
