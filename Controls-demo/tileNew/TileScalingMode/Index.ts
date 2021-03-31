import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/TileScalingMode/template';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
