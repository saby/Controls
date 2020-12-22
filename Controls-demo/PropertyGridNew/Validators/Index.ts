import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Validators/Validators';
import {showType} from 'Controls/Utils/Toolbar';
import {IItemAction} from 'Controls/itemActions';
import {Enum, RecordSet} from 'Types/collection';
import { Model } from 'Types/entity';
import {default as IPropertyGridItem} from 'Controls/_propertyGrid/IProperty';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: Model;
    protected _source: RecordSet;
    protected _itemActions: IItemAction[];

    protected _defaultValidator(value: any): boolean | string {
        return !!value || 'Значение обязательно для заполнения';
    }
    protected _beforeMount(): void {
        this._editingObject = new Model<IPropertyGridItem>({
            rawData: {
                description: '',
                tileView: true,
                showBackgroundImage: true,
                siteUrl: 'http://mysite.com',
                videoSource: 'http://youtube.com/video',
                backgroundType: new Enum({
                    dictionary: ['Фоновое изображение', 'Заливка цветом'],
                    index: 0
                }),
                function: '',
                validate: ''
            }
        });
        this._source = new RecordSet<IPropertyGridItem>({
            rawData: [
                {
                    name: 'description',
                    caption: 'Описание',
                    editorOptions: {
                        validators: [this._defaultValidator],
                        minLines: 3
                    },
                    editorClass: 'controls-demo-pg-text-editor',
                    group: 'text',
                    type: 'text'
                },
                {
                    name: 'tileView',
                    caption: 'Список плиткой',
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
                    group: 'string'
                },
                {
                    caption: 'Источник видео',
                    name: 'videoSource',
                    group: 'string'
                },
                {
                    caption: 'Тип фона',
                    name: 'backgroundType',
                    group: 'enum',
                    editorClass: 'controls-demo-pg-enum-editor'
                },
                {
                    name: 'function',
                    caption: '',
                    toggleEditorButtonIcon: 'icon-ArrangePreview',
                    type: 'text',
                    editorClass: 'controls-demo-pg-text-editor',
                    editorOptions: {
                        placeholder: 'Условие видимости поля',
                        minLines: 3
                    }
                },
                {
                    name: 'validate',
                    caption: '',
                    toggleEditorButtonIcon: 'icon-CreateFolder',
                    type: 'text',
                    editorClass: 'controls-demo-pg-text-editor',
                    editorOptions: {
                        placeholder: 'Условие валидации',
                        minLines: 3
                    }
                }
            ],
            keyProperty: 'name'
        });
        const source = this._source;
        this._itemActions = [
            {
                id: 2,
                icon: 'icon-ArrowUp',
                iconStyle: 'secondary',
                showType: showType.MENU,
                title: 'Переместить вверх',
                handler: (item: Model) => {
                    const sourceItemIndex = this._getSourceItemIndex(source, item);
                    source.move(sourceItemIndex, sourceItemIndex - 1);
                }
            },
            {
                id: 3,
                icon: 'icon-ArrowDown',
                iconStyle: 'secondary',
                showType: showType.MENU,
                title: 'Переместить вниз',
                handler: (item: Model) => {
                    const sourceItemIndex = this._getSourceItemIndex(source, item);
                    source.move(sourceItemIndex, sourceItemIndex + 1);
                }
            },
            {
                id: 1,
                icon: 'icon-Erase',
                iconStyle: 'danger',
                showType: showType.MENU,
                title: 'Удалить',
                handler: (item: Model) => {
                    const key = item.getKey();
                    source.remove(source.getRecordById(key));
                }
            }
        ];
    }

    private _getSourceItemIndex(source: RecordSet, item: Model): number {
        const key = item.getKey();
        const sourceItem = source.getRecordById(key);
        return source.getIndex(sourceItem);
    }

    protected _handleItemClick(event, item) {
        alert(`Clicked at ${item.getContents().getId()}`);
    }

    protected _validate() {
        this._children.validateController.submit();
    }

    static _styles: string[] = ['Controls-demo/PropertyGridNew/Editors/HighlightOnHover/Index',
        'Controls-demo/PropertyGridNew/PropertyGrid'];
}
