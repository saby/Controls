import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Toolbar/BoxView/SeparatorVisible/SeparatorVisible';
import {Memory} from 'Types/source';

class ToolbarBox extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _defaultSource: Memory;
    protected _currentClick: string;

    protected _beforeMount(): void {
        this._defaultSource = new Memory({
            keyProperty: 'id',
            data: [{
                id: '1',
                caption: 'Конфигурация',
                title: 'Конфигурация',
                icon: 'icon-Settings',
                iconStyle: 'secondary'
            }, {
                id: '2',
                caption: 'AB'
            }, {
                id: '3',
                icon: 'icon-Bell',
                iconStyle: 'secondary'
            }]
        });
    }
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ToolbarBox;
