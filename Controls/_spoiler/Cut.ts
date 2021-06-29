import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IBackgroundStyle, IBackgroundStyleOptions, IExpandable, IExpandableOptions} from 'Controls/interface';
import Util from './Util';
import {ICutOptions} from './interface/ICut';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Cut/Cut';
import {Logger} from 'UI/Utils';
import 'css!Controls/spoiler';

enum SIZE_MAP {
    'xs'= 15,
    's' = 17,
    'm' = 18,
    'l' = 19,
    'xl' = 20,
    '2xl' = 22,
    '3xl' = 23,
    '4xl' = 26,
    '5xl' = 31
}

/**
 * Графический контрол, который ограничивает контент заданным числом строк.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/Cut
 * @extends UI/Base:Control
 * @implements Controls/spoiler:ICut
 * @public
 * @demo Controls-demo/Spoiler/Cut/Index
 *
 * @author Красильников А.С.
 */
class Cut extends Control<ICutOptions> implements IBackgroundStyle, IExpandable {
    private _lines: number | null = null;
    private _expanded: boolean = false;

    protected _template: TemplateFunction = template;
    protected _style: string = '';
    protected _cutButtonStyle: string = '';

    readonly '[Controls/_interface/IBackgroundStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    protected _beforeMount(options?: ICutOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        if (options.lines === undefined && !options.height) {
            Logger.error('Задайте одну из обязательных опций: lines или height');
            return;
        }
        this._expanded = Util._getExpanded(options, this._expanded);
        this._lines = Cut._calcLines(options.lines, this._expanded);
        this._calcStyle(options);
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: ICutOptions, contexts?: any): void {
        if (options.hasOwnProperty('expanded') && this._options.expanded !== options.expanded) {
            this._expanded = options.expanded;
        }
        this._lines = Cut._calcLines(options.lines, this._expanded);
        this._calcStyle(options);

        super._beforeUpdate(options, contexts);
    }

    protected _onExpandedChangedHandler(event: Event, expanded: boolean): void {
        if (!this._options.hasOwnProperty('expanded')) {
            this._expanded = expanded;
        }
        this._notify('expandedChanged', [expanded]);
    }

    private _calcStyle(options?: ICutOptions): void {
        if (options.height) {
            const globalHeight = options.height + SIZE_MAP[options.lineHeight];

            this._style = this._expanded ? '' : `max-height: ${globalHeight}px;`;
            this._cutButtonStyle = this._expanded ? '' : `margin-top: ${globalHeight}px;`;
        }
    }

    private static _calcLines(lines: number | null, expanded: boolean): number | null {
        return expanded ? null : lines;
    }

    static getOptionTypes(): object {
        return {
            lineHeight: descriptor(String),
            backgroundStyle: descriptor(String),
            lines: descriptor(Number, null)
        };
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

Object.defineProperty(Cut, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Cut.getDefaultOptions();
   }
});

export default Cut;
