import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {CollectionItem} from 'Controls/display';

import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

import * as template from 'wml!Controls-demo/grid/TagStyle/TagStyleFromTemplateParam/TagStyleFromTemplateParam';

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;

    // Номер выбранной колонки
    protected _currentColumnIndex: number = null;

    // Тип события
    protected _currentEvent: string;

    // Значение выбранной колонки
    protected _currentValue: string;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        const data = this._getModifiedData().slice(0, 7);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    /**
     * Эти хандлеры срабатывают при клике на Tag в шаблоне BaseControl.wml
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
     * Эти хандлеры срабатывают при наведении на Tag в шаблоне BaseControl.wml
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

    private _getModifiedData(): any {
        const styleVariants = [
            null,
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
