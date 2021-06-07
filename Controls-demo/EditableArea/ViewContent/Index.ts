import {Record} from 'Types/entity';
import {main as editObject, date as editObjectRange} from '../Data';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/EditableArea/ViewContent/ViewContent';

class ViewContent extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editObject: Record = editObject;
    protected _editObjectRange: Record = editObjectRange;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewContent;
