import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as ControlTemplate from 'wml!Controls-demo/_Palette/Template';
import {coef, coefAcc} from './Coef';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/_Palette/Style';
import {TColumns} from 'Controls/grid';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/_Palette/Cell';
import 'wml!Controls-demo/_Palette/Color';
import {query} from 'Application/Env';
import {editing} from 'Controls/list';

class Palette extends Control<IControlOptions> {
    protected _template: TemplateFunction = ControlTemplate;
    private _hValue: number;
    private _sValue: number;
    private _lValue: number;
    protected _source: Memory;

    protected _columns: TColumns;

    protected _beforeMount(): void {

        let sourceData;
        if (query?.get?.acc) {
            sourceData = coefAcc;
            this._hValue = 210;
            this._sValue = 29;
            this._lValue = 24;
        } else {
            sourceData = coef;
            this._hValue = 18;
            this._sValue = 85;
            this._lValue = 53;
        }

        this._source = new Memory({
            keyProperty: 'name',
            data: sourceData
        });

        this._columns = [
            {
                displayProperty: 'name',
                width: '500px'
            },
            {
                displayProperty: 'S',
                width: '100px',
                template: 'wml!Controls-demo/_Palette/Cell'
            },
            {
                displayProperty: 'L',
                width: '100px',
                template: 'wml!Controls-demo/_Palette/Cell'
            },
            {
                displayProperty: 'color',
                width: '100px',
                template: 'wml!Controls-demo/_Palette/Color',
                backgroundColorStyle: 'complex',
                templateOptions: {
                    H: this._hValue,
                    S: this._sValue,
                    L: this._lValue,
                    Math
                }
            }
        ];
    }

    _beforeBeginEditHandler(e, options): string {
        if (options.item.get('isStrict')) {
            return editing.CANCEL;
        }
    }

    protected _mainParamChanged(): void {
        this._columns[3].templateOptions = {
            H: this._hValue,
            S: this._sValue,
            L: this._lValue,
            Math
        };

        this._columns = [...this._columns];
    }

    protected _copyColor(e: Event, h: number, s: number, l: number): void {
        const corS = s > 100 ? 100 : s;
        const corL = l > 100 ? 100 : l;
        const hex = Palette.HSLToRGB(h, corS, corL);

        const clipboardField = document.querySelector('.input_clipboard');
        clipboardField.value = hex;
        clipboardField.select();
        document.execCommand('copy');
    }

    static HSLToRGB(h, s, l): string {
        // Must be fractions of 1
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if (r.length == 1)
            r = '0' + r;
        if (g.length == 1)
            g = '0' + g;
        if (b.length == 1)
            b = '0' + b;

        return '#' + r + g + b;
    }
}
export default Palette;
