import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/PropertyGridNew/Editors/FlatEnum/Demo';
import {Enum} from 'Types/collection';

export default class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _source: object[] = [
        {
            name: 'alignment',
            caption: 'FlatEnum',
            editorTemplateName: 'Controls/propertyGrid:FlatEnumEditor',
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
        }
    ];
    protected _editingObject: object = {
        alignment: new Enum({
            dictionary: ['left', 'right', 'center', 'justify'],
            index: 0
        })
    };
}
