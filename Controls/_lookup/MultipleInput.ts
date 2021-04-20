import * as itemTemplate from 'wml!Controls/_lookup/SelectedCollection/ItemTemplate';
import {TemplateFunction} from 'UI/Base';
import {default as BaseLookupInput, ILookupInputOptions} from 'Controls/_lookup/BaseLookupInput';
import showSelector from 'Controls/_lookup/showSelector';
import {default as BaseLookup} from 'Controls/_lookup/BaseLookup';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {getWidth} from 'Controls/sizeUtils';
import * as showSelectorTemplate from 'wml!Controls/_lookup/BaseLookupView/resources/showSelectorTemplate';
import * as inputRender from 'wml!Controls/_lookup/MultipleInput/resources/inputRender';

let SHOW_SELECTOR_WIDTH = 0;
let OUTER_INDENT_INPUT = 0;
/**
 * Поле ввода с автодополнением и возможностью выбора значений из справочника.
 *
 * @remark
 * Отличается от {@link Controls/_lookup/Lookup поля связи} выводом выбранных значений.
 * Ширина выбранных занчений будет пропорционально распределена по ширине контрола, чтобы все значения поместились.
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/directory/lookup/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/MultipleInput
 * @extends UI/Base:Control
 * @mixes Controls/interface:ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:ITextValue
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IMultiSelectable
 * @mixes Controls/interface:ISorting
 * @mixes Controls/input:IBase
 * @mixes Controls/interface:IInputPlaceholder
 * @mixes Controls/input:IText
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IInputTag
 * @mixes Controls/input:IValue
 *
 * @public
 * @author Герасимов А.М.
 */
/*
 * “Lookup:MultipleInput” is an input field with auto-completion and the ability to select a value from the directory. It differs from the usual lookup: input in that only one value can be selected from each directory.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 *
 * @class Controls/_lookup/MultipleInput
 * @extends UI/Base:Control
 * @mixes Controls/interface:ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:ITextValue
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IMultiSelectable
 * @mixes Controls/interface:ISorting
 * @mixes Controls/input:IBase
 * @mixes Controls/input:IText
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IInputTag
 * @mixes Controls/input:IValue
 *
 * @public
 * @author Герасимов А.М.
 */
export default class MultipleInput extends BaseLookupInput {
    protected _rootContainerClasses: string = 'controls-Lookup controls-MultipleInput';
    protected _itemTemplateClasses: string = 'controls-MultipleInput__SelectedCollection_item';
    protected _listOfDependentOptions: string[] = ['displayProperty', 'readOnly', 'placeholder', 'isInputVisible'];
    protected _availableWidthCollection: number;

    showSelector(popupOptions?: IStackPopupOptions): boolean {
        this.closeSuggest();
        return showSelector(this, popupOptions, false);
    }

    _calculateSizes(options: ILookupInputOptions): void {
        this._maxVisibleItems = this._items.getCount();
        this._availableWidthCollection = this._getAvailableWidthCollection(options);
    }

    _isInputVisible(options: ILookupInputOptions): boolean {
        return (!options.readOnly || this._getInputValue(options)) && this._items.getCount() < options.maxVisibleItems;
    }

    _isNeedCalculatingSizes(options: ILookupInputOptions): boolean {
        return !options.readOnly && !this._isEmpty();
    }

    private _getAvailableWidthCollection(options: ILookupInputOptions): number {
        let placeholderWidth;
        let availableWidthCollection = this._getFieldWrapperWidth();

        this._initializeConstants();

        if (!options.readOnly) {
            availableWidthCollection -= SHOW_SELECTOR_WIDTH;
        }

        if (this._isInputVisible(options)) {
            placeholderWidth = MultipleInput._getPlaceholderWidth(options.placeholder);
            availableWidthCollection -= placeholderWidth + OUTER_INDENT_INPUT;
        }

        return availableWidthCollection;
    }

    private _initializeConstants(): void {
        if (!SHOW_SELECTOR_WIDTH) {
            // The template runs in isolation from the application, so the theme will not be inherited from Application.
            SHOW_SELECTOR_WIDTH = getWidth(showSelectorTemplate({theme: this._options.theme}));
            OUTER_INDENT_INPUT = getWidth(inputRender());
        }
    }

    private static _getPlaceholderWidth(placeholder?: string | TemplateFunction): number {
        let placeHolderTpl;

        if (placeholder) {
            if (placeholder.isDataArray) {
                placeHolderTpl = placeholder.reduce((currentPlaceholder: string, template: TemplateFunction) => {
                    return currentPlaceholder + template.func();
                }, '');
            } else if (placeholder.func instanceof Function) {
                placeHolderTpl = placeholder.func();
            } else {
                placeHolderTpl = placeholder;
            }
        }

        return placeholder ? getWidth(placeHolderTpl) : 0;
    }

    static getDefaultOptions(): object {
        return {
            ...BaseLookup.getDefaultOptions(),
            ...{
                itemTemplate,
                multiSelect: true,
                showClearButton: false
            }
        };
    }
}

/**
 * @name Controls/_lookup/MultipleInput#fontSize
 * @cfg
 * @demo Controls-demo/Lookup/MultipleInput/Index
 */

Object.defineProperty(MultipleInput, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MultipleInput.getDefaultOptions();
   }
});
