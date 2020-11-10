import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/grid/LadderStickyMultiline/StickyMultiline/StickyMultiline';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineName';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineDateTime';

interface IStickyLadderColumn {
    template: string;
    width: string;
    stickyProperty?: string | string[];
    resultTemplate?: TemplateFunction;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IStickyLadderColumn[];
    protected _ladderProperties: string[] = ['date', 'time'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    date: '01 мая',
                    time: '06:02',
                    name: 'Колесов В.'
                },
                {
                    id: 3,
                    date: '01 мая',
                    time: '08:25',
                    name: 'Авраменко А.'
                },
                {
                    id: 30,
                    date: '01 мая',
                    time: '18:33',
                    name: 'Авраменко А.'
                },
                {
                    id: 5,
                    date: '02 мая',
                    time: '07:41',
                    name: 'Колесов В.'
                },
                {
                    id: 6,
                    date: '02 мая',
                    time: '08:25',
                    name: 'Авраменко А.'
                },
                {
                    id: 8,
                    date: '03 мая',
                    time: '09:41',
                    name: 'Колесов В.'
                },
                {
                    id: 9,
                    date: '03 мая',
                    time: '09:55',
                    name: 'Колесов В.'
                },
                {
                    id: 11,
                    date: '04 мая',
                    time: '06:02',
                    name: 'Колесов В.'
                },
                {
                    id: 13,
                    date: '04 мая',
                    time: '08:25',
                    name: 'Авраменко А.'
                },
                {
                    id: 14,
                    date: '04 мая',
                    time: '08:41',
                    name: 'Колесов В.'
                },
                {
                    id: 15,
                    date: '06 мая',
                    time: '07:41',
                    name: 'Колесов В.'
                },
                {
                    id: 17,
                    date: '06 мая',
                    time: '08:25',
                    name: 'Колесов В.'
                },
                {
                    id: 18,
                    date: '06 мая',
                    time: '09:41',
                    name: 'Колесов В.'
                },
                {
                    id: 19,
                    date: '06 мая',
                    time: '09:55',
                    name: 'Колесов В.'
                }
            ]
        });
        this._columns = [{
            template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineDateTime',
            width: '125px',
            stickyProperty: ['date', 'time']
        }, {
            template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineName',
            width: '300px'
        }];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
