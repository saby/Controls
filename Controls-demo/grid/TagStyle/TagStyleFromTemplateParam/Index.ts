import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

import * as template from 'wml!Controls-demo/grid/TagStyle/TagStyleFromTemplateParam/TagStyleFromTemplateParam';
import {CollectionItem} from 'Controls/display';

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    protected _columns: any;

    protected _tagStyleProperty: string;

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
