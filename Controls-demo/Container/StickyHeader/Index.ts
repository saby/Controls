import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Container/StickyHeader/StickyHeader');
import {Memory} from 'Types/source';

const VAT = 18;
const COEFFICIENT_OF_PROFIT = 1.25;
class ButtonStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _gridColumns: object[];
    protected _gridHeader: object[];
    protected _viewSource: Memory;
    private _currentId: number = 0;
    private _demoText: string = 'Develop the theme of the "Scroll Container" component for Presto and Retail projects.\
            In the repository https://git.sbis.ru/sbis/themes in the corresponding modules it is necessary to determine\
            less-variable for the theme\'s coefficients in accordance with the specification and the auto-documentation\
            for the component (see references in the overarching task).';

    protected _beforeMount(): void {
        this._gridColumns = [{
            width: '40%',
            displayProperty: 'name'
        }, {
            displayProperty: 'amount'
        }, {
            displayProperty: 'costPrice'
        }, {
            displayProperty: 'price'
        }, {
            displayProperty: 'VAT_sum'
        }, {
            displayProperty: 'VAT'
        }, {
            displayProperty: 'sum'
        }];
        this._gridHeader = [{
            title: 'Name'
        }, {
            title: 'Amount'
        }, {
            title: 'Cost price'
        }, {
            title: 'Price'
        }, {
            title: 'VAT'
        }, {
            title: '%'
        }, {
            title: 'Sum'
        }];

        this._viewSource = new Memory({
            data: this._getDemoData(),
            keyProperty: 'id'
        });
    }

    private _getDemoData(): object[] {
        return [
            this._generateData('Keyboard SVEN s707', 2, 2540),
            this._generateData('Mouse Logitech PS 15', 17, 1050),
            this._generateData('Storage device', 11, 750),
            this._generateData('The right to use sbis.ru account for one year', 1, 4500),
            this._generateData('Software Dr.Web', 100, 1570),
            this._generateData('Mouse Logitech PS 15', 100, 1050),
            this._generateData('Storage device', 35, 1150),
            this._generateData('Keyboard SVEN s707', 2, 2540),
            this._generateData('The right to use sbis.ru account for one year', 2, 4500),
            this._generateData('Storage device', 11, 750),
            this._generateData('Keyboard SVEN s707', 2, 2540),
            this._generateData('Mouse Logitech PS 15', 17, 1050),
            this._generateData('Keyboard SVEN s707', 2, 2540),
            this._generateData('The right to use sbis.ru account for one year', 1, 4500),
            this._generateData('Software Dr.Web', 100, 1570)
        ];
    }

     private _generateData(name: string, amount: number, costPrice: number): object {
        const price = costPrice * COEFFICIENT_OF_PROFIT;
        const sum = amount * price;

        return {
            id: this._currentId++,
            name,
            amount,
            costPrice,
            price,
            VAT,
            VAT_sum: sum * VAT / 100,
            sum
        };
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Container/standardDemoScroll'];
}
export default ButtonStyle;
