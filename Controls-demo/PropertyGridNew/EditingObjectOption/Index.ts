import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/EditingObjectOption/EditingObjectOption';
import {default as IPropertyGridItem} from 'Controls/_propertyGrid/IProperty';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import {getEditingObject, getSource} from '../resources/Data';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: RecordSet<IPropertyGridItem> = null;
    protected _editingObject: Model<IPropertyGridItem> = null;

    protected _beforeMount(): void {
        this._editingObject = new Model<IPropertyGridItem>({
            rawData: getEditingObject()
        });
        this._source = new RecordSet<IPropertyGridItem>({
            rawData: getSource()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
