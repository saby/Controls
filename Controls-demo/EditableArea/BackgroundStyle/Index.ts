import {Record} from 'Types/entity';
import {main as editObject} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/BackgroundStyle/BackgroundStyle';

class BackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editObject: Record = editObject;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/EditableArea/BackgroundStyle/BackgroundStyle'];
}
export default BackgroundStyle;
