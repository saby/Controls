import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/TabbedView/TabbedView';

import {Enum} from 'Types/collection';

export default class TabbedViewDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _editingObject: Record<string, unknown> = {
        description: 'This is http://mysite.com',
        tileView: true,
        showBackgroundImage: true,
        siteUrl: 'http://mysite.com',
        videoSource: 'http://youtube.com/video',
        backgroundType: new Enum({
            dictionary: ['Фоновое изображение', 'Заливка цветом'],
            index: 0
        }),
        alignment: new Enum({
            dictionary: ['left', 'right', 'center', 'justify'],
            index: 0
        }),
        decoration: [true, true, false, true],
        count: 750
    };

    protected _source: unknown[] = [
        {
            name: 'description',
            caption: 'Описание',
            editorOptions: {
                minLines: 3
            },
            editorClass: 'controls-demo-pg-text-editor',
            group: 'text',
            type: 'text',
            tab: 'Текстовые свойства'
        },
        {
            name: 'tileView',
            caption: 'Список плиткой',
            group: 'boolean',
            tab: 'Булевы свойства'
        },
        {
            name: 'showBackgroundImage',
            caption: 'Показывать изображение',
            group: 'boolean',
            tab: 'Булевы свойства'
        },
        {
            caption: 'URL',
            name: 'siteUrl',
            group: 'string',
            tab: 'Строковые свойства'
        },
        {
            caption: 'Источник видео',
            name: 'videoSource',
            group: 'string',
            tab: 'Строковые свойства'
        },
        {
            caption: 'Тип фона',
            name: 'backgroundType',
            group: 'enum',
            tab: 'Выбор из многих',
            editorClass: 'controls-demo-pg-enum-editor'
        },
        {
            name: 'alignment',
            caption: 'Выравнивание',
            tab: 'Выбор из многих',
            editorTemplateName: 'Controls/propertyGrid:FlatEnumEditor',
            group: 'flatEnum',
            editorOptions: {
                buttons: [{
                    id: 'left',
                    icon: 'icon-AlignmentLeft',
                    tooltip: 'По левому краю'
                }, {
                    id: 'center',
                    icon: 'icon-AlignmentCenter',
                    tooltip: 'По центру'
                }, {
                    id: 'right',
                    icon: 'icon-AlignmentRight',
                    tooltip: 'По правому краю'
                }, {
                    id: 'justify',
                    icon: 'icon-AlignmentWidth',
                    tooltip: 'По ширине'
                }]
            }
        },
        {
            name: 'decoration',
            caption: 'Насыщенность и стиль',
            group: 'booleanGroup',
            tab: 'Сложные редакторы',
            editorTemplateName: 'Controls/propertyGrid:BooleanGroupEditor',
            editorOptions: {
                buttons: [{
                    id: 0,
                    tooltip: 'Полужирный',
                    icon: 'icon-Bold'
                }, {
                    id: 1,
                    tooltip: 'Курсив',
                    icon: 'icon-Italic'
                }, {
                    id: 2,
                    tooltip: 'Подчеркнутый',
                    icon: 'icon-Underline'
                }, {
                    id: 3,
                    tooltip: 'Зачёркнутый',
                    icon: 'icon-Stroked'
                }]
            }
        },
        {
            name: 'count',
            caption: 'Количество',
            group: 'number',
            tab: 'Сложные редакторы',
            editorOptions: {
                inputConfig: {
                    useGrouping: false,
                    showEmptyDecimals: false,
                    integersLength: 4,
                    precision: 0,
                    onlyPositive: true
                }
            }
        }
    ];
}
