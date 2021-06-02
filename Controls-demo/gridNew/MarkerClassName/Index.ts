import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/gridNew/MarkerClassName/MarkerClassName';
import {IColumn} from 'Controls/grid';
import {Tasks} from "Controls-demo/gridNew/DemoHelpers/Data/Tasks";

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSourceImage: Memory;
    protected _viewSourceText: Memory;
    protected _columnsImage: INoStickyLadderColumn[] = Tasks.getColumns();
    protected _columnsText: IColumn[] =  [
        {
            displayProperty: 'px',
            width: '150px'
        },
        {
            displayProperty: 'fr1of3',
            width: '400px'
        }
    ];
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSourceImage = new Memory({
            keyProperty: 'id',
            data: Tasks.getData()
        });

        this._viewSourceText = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    px: 'Строго 150px',
                    fr1of3: '1/3 свободного пространства. fr - гибкая ширина. fr расчитывается как доля от оставшегося свободного пространства внутри грида. Грубо говоря, сначала браузер просчитает ширины всех остальных колонок, потом fr',
                },
                {
                    id: 2,
                    px: 'Ячейка 2/1',
                    fr1of3: 'Ячейка 2/3',
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
