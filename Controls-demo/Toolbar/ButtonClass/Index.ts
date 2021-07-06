import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Toolbar/ButtonClass/Template';
import {Memory} from 'Types/source';
import {data} from '../resources/toolbarItems';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _buttonsSource: Memory;

    protected _beforeMount(): void {
        const itemsData = data.getItemsWithDirection();
        itemsData[0].buttonClass = 'controls-Button_functionalButton_style-translucent';
        itemsData[0].iconStyle = 'contrast';
        this._buttonsSource = new Memory({
            keyProperty: 'id',
            data: itemsData
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
