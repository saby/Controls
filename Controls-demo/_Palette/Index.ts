import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { Component } from 'react';
import * as ControlTemplate from 'wml!Controls-demo/_Palette/Template';
import {coef, coefAcc} from './Coef';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/_Palette/Style';
import {TColumns} from 'Controls/grid';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/_Palette/Cell';
import 'wml!Controls-demo/_Palette/Color';

interface IHSLColor {
    H: number;
    S: number;
    L: number;
}

interface IColorCoef {
    S: number;
    L: number;
}

class Palette extends Control<IControlOptions> {
    protected _template: TemplateFunction = ControlTemplate;
    private _hValue: number;
    private _sValue: number;
    private _lValue: number;
    protected _source: Memory = new Memory({
        keyProperty: 'name',
        data: coef
    });

    protected _columns: TColumns;

    protected _beforeMount(): void {
        this._hValue = 18;
        this._sValue = 85;
        this._lValue = 53;
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
                hoverBackgroundStyle: 'naebal',
                templateOptions: {
                    H: this._hValue,
                    S: this._sValue,
                    L: this._lValue,
                    Math
                }
            }
        ];
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
        const hex = Palette.hslToHex(h, corS, corL);
        console.log(hex);
    }

    static hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}
export default Palette;
