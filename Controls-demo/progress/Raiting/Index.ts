import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Raiting/Template';
import {Memory} from 'Types/source';

class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;
    protected _readOnly: boolean = false;
    protected _precision: number = 0;
    protected _iconSize: string = 's';
    protected _iconPadding: string = '3xs';
    protected _iconStyle: string = 'warning';
    protected _emptyIconStyle: string = 'readonly';
    protected _sourceIconSize: Memory;
    protected _sourceIconStyle: Memory;
    protected _sourceIconPadding: Memory;

    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _beforeMount(): void {
        const values = ['default', '2xs', 'xs', 's', 'm', 'l'];
        const valuesIconPadding = ['null', '3xs'].concat(values, 'xl');
        const valuesIconStyle = ['warning', 'info', 'success', 'danger', 'secondary', 'primary', 'default',
            'contrast', 'readonly'];
        this._sourceIconSize = this.getSource(values);
        this._sourceIconPadding = this.getSource(valuesIconPadding);
        this._sourceIconStyle = this.getSource(valuesIconStyle);
    }

    private getSource(values: string[]): Memory {
        return new Memory({
            keyProperty: 'id',
            data: values.map((value) => {
                return {
                    id: value
                };
            })
        });
    }
}

export default Rating;
