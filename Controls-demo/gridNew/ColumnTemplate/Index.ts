import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnTemplate/ColumnTemplate';
import * as withBackgroundColorStyle from 'wml!Controls-demo/gridNew/ColumnTemplate/withBackgroundColorStyle';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

interface IColorColumn extends IColumn {
    getColor?: (n: number) => string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColorColumn[] = Countries.getColumns();

    protected _beforeMount(): void {
        const populationColumn = this._columns.find((column) => column.displayProperty === 'populationDensity');
        populationColumn.template = withBackgroundColorStyle;
        populationColumn.getColor = (populationDensity: number) => {
            // tslint:disable-next-line
            if (populationDensity > 100) {
                return 'danger';
            }
            // tslint:disable-next-line
            if (populationDensity < 10) {
                return 'warning';
            }

            return 'success';
        };

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
