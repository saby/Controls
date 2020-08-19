import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls/addButton/addButton');
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';

interface INewButtonOptions {
    source: Memory;
    caption: string;
}

class Component extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    private _caption: string;
    protected _source: Memory;

    protected _beforeMount(options: INewButtonOptions): void {
        this._source = options.source;
    }

    protected _itemClickHandler(event: SyntheticEvent, item: Model): void {
        this._notify('menuItemActivate', [item]);
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls/addButton/addButton'];

    static getDefaultOptions(): object {
        return {
            caption: ''
        };
    }
}

export default Component;
