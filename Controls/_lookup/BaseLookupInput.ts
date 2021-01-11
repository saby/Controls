import {TemplateFunction} from 'UI/Base';
import {default as BaseLookup, ILookupOptions} from 'Controls/_lookup/BaseLookup';
import * as template from 'wml!Controls/_lookup/BaseLookupInput/BaseLookupInput';
import * as clearRecordsTemplate from 'wml!Controls/_lookup/BaseLookupView/resources/clearRecordsTemplate';
import * as showSelectorTemplate from 'wml!Controls/_lookup/BaseLookupView/resources/showSelectorTemplate';
import {UnregisterUtil, RegisterUtil} from 'Controls/event';
import {DOMUtil} from 'Controls/sizeUtils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {List} from 'Types/collection';
import {Model} from 'Types/entity';
import {constants} from 'Env/Env';
import {ITextOptions, IValueOptions, IBaseOptions} from 'Controls/input';
import {IFontSizeOptions, ISelectorDialogOptions} from 'Controls/interface';
import {isEqual} from 'Types/object';
import {EventUtils} from 'UI/Events';
import {ICrudPlus} from 'Types/source';
import {IHashMap} from 'Types/declarations';
import InputRenderLookup from './BaseLookupView/InputRender';
import {DependencyTimer} from 'Controls/popup';
import {_InputController as LayoutInputContainer} from 'Controls/suggest';
import {load} from 'WasabyLoader/Library';

const KEY_CODE_F2 = 113;

export interface ILookupInputOptions extends
    ILookupOptions,
    ITextOptions,
    IValueOptions<string>,
    IBaseOptions,
    IFontSizeOptions,
    ISelectorDialogOptions {
    suggestSource?: ICrudPlus;
    multiLine?: boolean;
    autoDropDown?: boolean;
    comment?: string;
}

export default abstract class BaseLookupInput extends BaseLookup<ILookupInputOptions> {
    protected _template: TemplateFunction = template;
    protected _clearRecordsTemplate: TemplateFunction = clearRecordsTemplate;
    protected _showSelectorTemplate: TemplateFunction = showSelectorTemplate;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _itemTemplateClasses: string;
    private _fieldWrapper: HTMLElement;
    private _fieldWrapperWidth: number = null;
    private _inputValue: string;
    private _active: boolean = false;
    private _infoboxOpened: boolean = false;
    private _needSetFocusInInput: boolean = false;
    private _suggestState: boolean = false;
    private _subscribedOnResizeEvent: boolean = false;
    protected _maxVisibleItems: number = 0;
    protected _listOfDependentOptions: string[];

    private _loadSelectorTemplatePromise: Promise<unknown> = null;
    private _dependenciesTimer: DependencyTimer = null;

    protected _children: {
        inputRender: typeof InputRenderLookup;
        layout: LayoutInputContainer;
    };

    protected _inheritorBeforeMount(options: ILookupInputOptions): void {
        const itemsCount = this._items.getCount();

        if (!options.multiSelect || itemsCount === 1) {
            this._maxVisibleItems = 1;
        } else if (options.multiLine) {
            this._maxVisibleItems = options.maxVisibleItems;
        } else if (options.multiSelect && itemsCount > 1 && !options.readOnly) {
            this._maxVisibleItems = 0;
        } else {
            this._maxVisibleItems = itemsCount;
        }
    }

    protected _inheritorBeforeUpdate(newOptions: ILookupInputOptions): void {
        const currentOptions = this._options;
        let isNeedUpdate = !isEqual(newOptions.selectedKeys, this._options.selectedKeys);
        const valueChanged = currentOptions.value !== newOptions.value;

        if (valueChanged) {
            this._setInputValue(newOptions, newOptions.value);
        } else if (isNeedUpdate && !newOptions.comment) {
            this._resetInputValue();
        }

        if (!isNeedUpdate) {
            this._listOfDependentOptions.forEach((optName) => {
                if (newOptions[optName] !== currentOptions[optName]) {
                    isNeedUpdate = true;
                }
            });
        }

        if (isNeedUpdate) {
            this._calculateSizes(newOptions);
        }

        if (!this._isInputActive(newOptions)) {
            this.closeSuggest();
        }

        this._subscribeOnResizeEvent(newOptions);
    }

    protected _afterMount(options: ILookupInputOptions): void {
        if (!this._isEmpty()) {
            this._calculateSizes(options);
        }

        this._subscribeOnResizeEvent(options);
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'controlResize');
    }

    protected _afterUpdate(): void {
        if (this._needSetFocusInInput) {
            this._needSetFocusInInput = false;

            /* focus can be moved in choose event */
            if (this._active) {
                this.activate();

                if (this._determineAutoDropDown()) {
                    this._suggestState = true;
                }
            }
        }
    }

    protected _getFieldWrapper(): HTMLElement {
        if (!this._fieldWrapper) {
            // @ts-ignore
            const inputRenderContainer = this._children.inputRender._container;
            this._fieldWrapper = inputRenderContainer[0] || inputRenderContainer;
        }
        return this._fieldWrapper;
    }

    protected _isEmpty(): boolean {
        return !this._items.getCount();
    }

    protected _getInputValue(options: ILookupInputOptions): string {
        let result;

        if (options.hasOwnProperty('value')) {
            result = options.value;
        } else {
            result = this._inputValue;
        }

        return result;
    }

    protected _setInputValue(options: ILookupInputOptions, value: string): void {
        if (!options.hasOwnProperty('value')) {
            this._inputValue = value;

            // _inputValue - состояние, которое используется, если не задают опцию value
            // Т.к. _inputValue не реактивное св-во, и в шаблоне оно получается через getter (_getInputValue),
            // то необходимо звать forceUpdate
            this._forceUpdate();
        }
    }

    protected _itemsChanged(): void {
        this._calculateSizes(this._options);
    }

    private _activated(): void {
        this._active = true;
    }

    private _deactivated(): void {
        this._active = false;
        this.closeSuggest();
    }

    private _suggestStateChanged(event: SyntheticEvent, state: boolean): void {
        if (this._infoboxOpened || !this._isInputActive(this._options) || !state) {
            this.closeSuggest();
        }
    }

    private _determineAutoDropDown(): boolean {
        return this._options.autoDropDown && this._isInputActive(this._options);
    }

    private _resize(): void {
        if (this._isNeedCalculatingSizes(this._options)) {
            const oldFieldWrapperWidth = this._fieldWrapperWidth;
            const newFieldWrapperWidth = this._getFieldWrapperWidth(true);

            // if hidden, then there is no reason to recalc the sizes
            if (newFieldWrapperWidth > 0 && newFieldWrapperWidth !== oldFieldWrapperWidth) {
                this._calculateSizes(this._options);
            }
        }
    }

    protected _getFieldWrapperWidth(recount?: boolean): number {
        let resultWidth = this._fieldWrapperWidth;

        if (this._fieldWrapperWidth === null || recount) {
            // we cache width, since used in several places in the calculations and need to compare when resize
            resultWidth = DOMUtil.width(this._getFieldWrapper());

            if (resultWidth > 0) {
                this._fieldWrapperWidth = resultWidth;
            } else {
                this._fieldWrapperWidth = null;
            }
        }

        return resultWidth;
    }

    private _isInputActive(options: ILookupInputOptions): boolean {
        return !options.readOnly && this._isInputVisible(options) && (this._isEmpty() || options.multiSelect);
    }

    private _openInfoBox(event: SyntheticEvent, config: IHashMap<unknown>): void {
        config.width = this._getContainer().offsetWidth;
        config.offset = {
            horizontal: -this._getOffsetForInfobox()
        };
        this.closeSuggest();
        this._infoboxOpened = true;
        this._notify('openInfoBox', [config]);
    }

    private _getOffsetForInfobox(): number {
        const fieldWrapperStyles = getComputedStyle(this._getFieldWrapper());
        return parseInt(fieldWrapperStyles.paddingLeft, 10) +
               parseInt(fieldWrapperStyles.borderLeftWidth, 10);
    }

    private _closeInfoBox(): void {
        this._infoboxOpened = false;
        this._notify('closeInfoBox');
    }

    private _onMouseDownShowSelector(event: SyntheticEvent<MouseEvent>): void {
        this.closeSuggest();
        this._showSelector(event);
    }

    private _loadDependencies(): Promise<unknown> {
        const selectorTemplate = this._options.selectorTemplate;

        if (!this._loadSelectorTemplatePromise && selectorTemplate) {
            this._loadSelectorTemplatePromise = (typeof selectorTemplate.templateName === 'string') ?
                load(selectorTemplate.templateName) : null;
        }
        return this._loadSelectorTemplatePromise;
    }

    protected _linkMouseEnterHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
        }
    }

    protected _linkMouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    private _onClickClearRecords(): void {
        this._updateItems(new List());

        // When click on the button, it disappears from the layout and the focus is lost,
        // we return the focus to the input field.
        this.activate();
    }

    private _itemClick(event: SyntheticEvent, item: Model, nativeEvent: Event): void {
        this.closeSuggest();
        this._notify('itemClick', [item, nativeEvent]);
    }

    private _keyDown(event: SyntheticEvent, keyboardEvent): void {
        const items = this._items;
        const keyCodeEvent = keyboardEvent.nativeEvent.keyCode;
        const hasValueInInput = this._getInputValue(this._options);

        if (keyCodeEvent === KEY_CODE_F2) {
            this._showSelector();
        } else if (keyCodeEvent === constants.key.backspace &&
                   !hasValueInInput &&
                   !this._isEmpty()) {

            // if press backspace, the input field is empty and there are selected entries -  remove last item
            this._removeItem(items.at(items.getCount() - 1));
        }
    }

    private _activateLookup(enableScreenKeyboard: boolean = true): void {
        if (this._options.multiSelect) {
            this.activate({enableScreenKeyboard});
        } else {
            // activate method is focusing input.
            // for lookup with multiSelect: false input will be hidden after select item,
            // and focus will be lost.
            // for this case activate lookup in _afterUpdate hook.
            this._needSetFocusInInput = true;
        }
    }

    private _notifyValueChanged(value: string): void {
        this._notify('valueChanged', [value]);
    }

    private _resetInputValue(): void {
        if (this._getInputValue(this._options) !== '') {
            this._setInputValue(this._options, '');
            this._notifyValueChanged('');
        }
    }

    private _changeValueHandler(event: SyntheticEvent, value: string): void {
        this._setInputValue(this._options, value);
        this._notifyValueChanged(value);
    }

    private _choose(event: SyntheticEvent, item: Model): void {
        // move focus to input after select, because focus will be lost after closing popup
        this._activateLookup();

        // Сначало сбросим значение поля ввода,
        // необходимо что бы событие selectedKeysChanged сработало после valueChanged
        // дабы в propertyGrid панели фильтра выставилось значение из выбранных ключей а не из поля ввода
        this._resetInputValue();
        this._notify('choose', [item]);
        this._addItem(item);
    }

    private _crossClick(event: SyntheticEvent, item: Model): void {
        /* move focus to input, because focus will be lost after removing dom element */
        if (!this._infoboxOpened) {
            this._activateLookup(false);
        }
        this._resetInputValue();
        this._removeItem(item);
    }

    private _getContainer(): HTMLElement {
        return this._container[0] || this._container;
    }

    private _getPlaceholder(options: ILookupInputOptions): string | TemplateFunction {
        let placeholder;

        if (!options.multiSelect && !this._isEmpty()) {
            placeholder = options.comment;
        } else {
            placeholder = options.placeholder;
        }

        return placeholder;
    }

    private _isShowCollection(): boolean {
        return !this._isEmpty() && !!(this._maxVisibleItems || this._options.readOnly);
    }

    private _subscribeOnResizeEvent(options: ILookupInputOptions): void {
        if (!this._subscribedOnResizeEvent && this._isNeedCalculatingSizes(options)) {
            RegisterUtil(this, 'controlResize', this._resize);
            this._subscribedOnResizeEvent = true;
        }
    }

    closeSuggest(): void {
        this._suggestState = false;
    }

    paste(value: string): void {
        this._children.inputRender.paste(value);
    }

    protected abstract _calculateSizes(options: ILookupInputOptions): void;

    protected abstract _isNeedCalculatingSizes(options: ILookupInputOptions): boolean;

    protected abstract _isInputVisible(options: ILookupInputOptions): boolean;
}
