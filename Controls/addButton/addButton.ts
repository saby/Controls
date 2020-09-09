import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls/addButton/addButton');
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';

interface INewButtonOptions {
    source: Memory;
}

class Component extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    private _caption: string;
    protected _source: Memory;
    protected _captionItem: Model;

    protected _beforeMount(options: INewButtonOptions): void {
        this._source = options.source;
        this._caption = this._source.data[0].title;
        this._captionItem = this._source.data[0];
    }

    protected _itemClickHandler(event: SyntheticEvent, item: Model): void {
        this._caption = item.get('title');
        this._captionItem = item;
        this._notify('menuItemActivate', [item]);
    }

    protected _proxyEvent(event: SyntheticEvent): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    static _theme: string[] = ['Controls/buttonsAdd', 'Controls/Classes'];

    static _styles: string[] = ['Controls/addButton/addButton'];

    static getDefaultOptions(): object {
        return {
            iconSize: 's',
            iconStyle: 'contrast',
            inlineHeight: 'm',
            buttonStyle: 'secondary',
            fontSize: 'm',
            icon: 'icon-RoundPlus'
        };
    }
}

export default Component;
