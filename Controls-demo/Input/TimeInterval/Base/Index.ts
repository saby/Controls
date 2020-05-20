import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/TimeInterval/Base/Template');
import {TimeInterval as TTimeInterval} from 'Types/entity';

class Text extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: TTimeInterval = new TTimeInterval('P0DT12H30M00S');
    protected _value2: TTimeInterval = new TTimeInterval('P0DT12H30M00S');
    protected _value3: TTimeInterval = new TTimeInterval('P0DT120H00M00S');
    protected _value4: TTimeInterval = new TTimeInterval('P0DT9H35M27S');
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Text;
