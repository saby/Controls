import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/JumpingLabel/Index';
import {getEditingObject} from 'Controls-demo/PropertyGridNew/resources/Data';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: object;
    protected _source: object[];

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._source = [
                {
                    name: 'description',
                    caption: 'Описание',
                    editorOptions: {
                        minLines: 3,
                        jumpingLabel: true
                    },
                    editorClass: 'controls-demo-pg-text-editor',
                    type: 'text'
                },
                {
                    name: 'tileView',
                    caption: 'Список плиткой',
                    type: 'boolean'
                },
                {
                    caption: 'URL',
                    name: 'siteUrl',
                    editorOptions: {
                        jumpingLabel: true
                    },
                    type: 'string'
                },
                {
                    caption: 'Тип фона',
                    name: 'backgroundType',
                    type: 'enum',
                    editorClass: 'controls-demo-pg-enum-editor'
                }
            ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo',
        'Controls-demo/PropertyGridNew/PropertyGrid'];
}
