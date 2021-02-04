import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/CaptionOptions/Index';
import {getEditingObject} from 'Controls-demo/PropertyGridNew/resources/Data';
import {IProperty} from 'Controls/propertyGrid';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: object;
    protected _source: IProperty[];

    protected _beforeMount(): void {
        this._editingObject = getEditingObject();
        this._source = [
            {
                name: 'description',
                caption: 'Описание',
                captionOptions: {
                    fontSize: 'xl'
                },
                editorOptions: {
                    minLines: 3
                },
                editorClass: 'controls-demo-pg-text-editor',
                group: 'text',
                type: 'text'
            },
            {
                name: 'tileView',
                caption: 'Список плиткой',
                captionOptions: {
                    underline: 'hovered'
                },
                group: 'boolean'
            },
            {
                name: 'showBackgroundImage',
                caption: 'Показывать изображение',
                group: 'boolean'
            },
            {
                caption: 'URL',
                name: 'siteUrl',
                captionOptions: {
                    required: true
                },
                group: 'string'
            },
            {
                caption: 'Источник видео',
                name: 'videoSource',
                captionOptions: {
                    required: true
                },
                group: 'string'
            },
            {
                caption: 'Тип фона',
                captionOptions: {
                    underline: 'fixed'
                },
                name: 'backgroundType',
                group: 'enum',
                editorClass: 'controls-demo-pg-enum-editor'
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo',
        'Controls-demo/PropertyGridNew/PropertyGrid'];
}
