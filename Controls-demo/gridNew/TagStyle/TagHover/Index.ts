import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {Record} from 'Types/entity';

import {IColumn} from 'Controls/grid';

import * as template from 'wml!Controls-demo/gridNew/TagStyle/TagHover/TagHover';
import { TagStyle } from 'Controls-demo/gridNew/DemoHelpers/Data/TagStyle';

export default class TagStyleGridDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    protected _columns: IColumn[];

    constructor(cfg: IControlOptions) {
        super(cfg);
        this._columns = TagStyle.getColumns();
    }

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        const data = TagStyle.getData().slice(1, 2);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    /**
     * Эти хандлеры срабатывают при наведении на Tag в шаблоне BaseControl.wml
     * @param event
     * @param item
     * @param columnIndex
     * @param nativeEvent
     * @private
     */
    protected _onTagHoverCustomHandler(event: Event, item: Record, columnIndex: number, nativeEvent: Event): void {
        const config = {
            target: nativeEvent.target,
            message: 'Hello world!!!'
        };

        this._notify('openInfoBox', [config], {bubbling: true});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
