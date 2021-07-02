import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import LookupTemplate = require('wml!Controls/_filterPanel/Editors/Lookup');
import {BaseEditor} from 'Controls/_filterPanel/Editors/Base';
import {Selector} from 'Controls/lookup';
import 'css!Controls/filterPanel';
import * as rk from 'i18n!Controls';
import {Model} from 'Types/entity';

interface ILookupOptions extends IControlOptions {
    propertyValue: number[] | string[];
}

interface ILookup {
    readonly '[Controls/_filterPanel/Editors/Lookup]': boolean;
}

/**
 * Контрол используют в качестве редактора для выбора значения из справочника.
 * @class Controls/_filterPanel/Editors/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:Lookup
 * @author Мельникова Е.А.
 * @public
 */

const MAX_VISIBLE_ITEMS = 7;

class LookupEditor extends BaseEditor implements ILookup {
    readonly '[Controls/_filterPanel/Editors/Lookup]': boolean = true;
    protected _template: TemplateFunction = LookupTemplate;
    protected _textValue: string = '';
    protected _showSelectorCaption: string = null;
    protected _children: {
        lookupEditor: Selector
    };

    protected _afterMount(options: IControlOptions): void {
        if (this._children.lookupEditor) {
            this._children.lookupEditor.showSelector();
        }
    }

    protected _handleCloseEditorClick(event: SyntheticEvent): void {
        const extendedValue = {
            value: this._options.propertyValue,
            textValue: '',
            viewMode: 'extended'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, value: number[] | string[]): void {
        const extendedValue = {
            value,
            textValue: this._textValue
        };
        this._notifyPropertyValueChanged(extendedValue);
        this._showSelectorCaption = this._getShowSelectorCaption(value);
    }

    protected _extendedCaptionClickHandler(event: SyntheticEvent): void {
        const popupOptions = {
            eventHandlers: {
                onResult: (result: Model[]) => {
                    const selectedKeys = [];
                    result.forEach((item) => {
                        selectedKeys.push(item.get(this._options.keyProperty));
                    });
                    this._handleSelectedKeysChanged(event, selectedKeys);
                }
            }
        };
        if (this._children.lookupEditor) {
            this._children.lookupEditor.showSelector(popupOptions);
        }
    }

    protected _handleTextValueChanged(event: SyntheticEvent, value: string): void {
        this._textValue = value;
    }

    private _getShowSelectorCaption(values: number[] | string []): string {
        const amount = values.length - this._options.maxVisibleItems;
        return  amount > 0 ? rk('Еще ') + amount : '';
    }

    static getDefaultOptions(): object {
        return {
            maxVisibleItems: MAX_VISIBLE_ITEMS
        };
    }
}

Object.defineProperty(LookupEditor, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return LookupEditor.getDefaultOptions();
    }
});

export default LookupEditor;
