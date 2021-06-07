import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/progress/StateIndicator/SectorSize/SectorSize');

interface IStateIndicatorDemoData {
    value: number;
    className: string;
    title: string;
}
class SectorSize extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _data: IStateIndicatorDemoData[] = [
        {value: 20, className: '', title: 'Положительно'},
        {value: 80, className: '', title: 'В работе'}
    ];
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default SectorSize;
