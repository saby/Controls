import {Record} from 'Types/entity';
import {Memory} from 'Types/source';
import {main as editObject} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/EditableArea/Buttons/Buttons';

class BackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editObject: Record = editObject;
    protected  _periodType: Memory = null;
    protected  _periodQuarter: Memory = null;
    protected _periodTypeKey: string = '0';
    protected _periodQuarterKey: string = '01';

    protected _beforeMount(): void {
        this._periodType = new Memory({
            keyProperty: 'id',
            data: [
                { id: 'МС', title: 'МС - месячный' },
                { id: 'КВ', title: 'КВ - квартальный' },
                { id: 'ПЛ', title: 'ПЛ - полугодовой' },
                { id: 'ГД', title: 'ГД - годовой' },
                { id: 'КД', title: 'конкретная дата' },
                { id: '0', title: 'не указывается' }
            ]
        });
        this._periodQuarter = new Memory({
            keyProperty: 'id',
            data: [
                { id: '01', title: '01 - квартал' },
                { id: '02', title: '02 - квартал' },
                { id: '03', title: '03 - квартал' },
                { id: '04', title: '04 - квартал' }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/EditableArea/Buttons/ButtonsStyle'];
}
export default BackgroundStyle;
