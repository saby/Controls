import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ActualApi, cssStyleGeneration, IButton, IButtonOptions} from 'Controls/buttons';
import ToggleButtonTemplate = require('wml!Controls/_toggle/Button/Button');
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {
        IFontColorStyle,
        IFontColorStyleOptions,
        IFontSize,
        IFontSizeOptions,
        IHeight,
        IHeightOptions,
        IIconSize,
        IIconSizeOptions,
        IIconStyle,
        IIconStyleOptions,
        ITooltip,
        ITooltipOptions } from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';

export interface IToggleButtonOptions extends
        IControlOptions,
        IButtonOptions,
        ICheckableOptions,
        IFontColorStyleOptions,
        IFontSizeOptions,
        IIconSizeOptions,
        IIconStyleOptions,
        IHeightOptions,
        ITooltipOptions {
    icons?: string[];
    captions?: string[];
    viewMode?: 'button' | 'link' | 'toolButton' | 'pushButton';
    // deprecated options
    icon?: string;
}

/**
 * Кнопка, которая переключается между двумя состояниями: включено и выключено.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">Демо-пример</a>.
 *
 * @class Controls/_toggle/Button
 * @extends Core/Control
 * @implements Controls/_buttons/interface/IButton
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @implements Controls/_interface/IIconSize
 * @implements Controls/_interface/IIconStyle
 * @implements Control
 * s/_interface/IHeight
 * @implements Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 *
 * @demo Controls-demo/toggle/Button/ViewModes/Index
 */

/*
 * Button that switches between two states: on-state and off-state.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/Button
 * @extends Core/Control
 * @implements Controls/_buttons/interface/IButton
 * @implements Controls/_toggle/interface/ICheckable
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @implements Controls/_interface/IIconSize
 * @implements Controls/_interface/IIconStyle
 * @implements Controls/_interface/IHeight
 * @implements Controls/_interface/ITooltip
 * @control
 * @public
 * @author Красильников А.С.
 * @category Toggle
 *
 * @demo Controls-demo/toggle/Button/ViewModes/Index
 */

/**
 * @name Controls/_toggle/Button#icons
 * @cfg {Array} Пара иконок.
 * Первая иконка отображается, когда переключатель выключен.
 * Вторая иконка отображается, когда переключатель включен.
 * @example
 * Переключатель с одной иконкой:
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03']}}" iconSize="s"  viewMode="link"/>
 * </pre>
 * Переключатель с двумя иконками:
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03', 'icon-ArrangeList04']}}" iconStyle="success" iconSize="s"  viewMode="link"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#icons
 * @cfg {Array} Pair of icons.
 * First icon displayed when toggle switch is off.
 * Second icon displayed when toggle switch is on.
 * @example
 * Toggle button with one icon.
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03']}}" viewMode="link"/>
 * </pre>
 * Toggle button with two icons.
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03', 'icon-ArrangeList04']}}" iconStyle="success" iconSize="s" viewMode="link"/>
 * </pre>
 */

/**
 * @name Controls/_toggle/Button#captions
 * @cfg {Array} Пара заголовков.
 * Первый заголовок отображается, когда переключатель в состоянии "выключено".
 * Второй заголовок отображается, когда переключатель в состоянии "включено".
 * @example
 * Переключатель с двумя заголовками:
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" size="m" captions="{{['Change', 'Save']}}" viewMode="link"/>
 * </pre>
 * Переключатель с одним заголовком
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" size="m" captions="{{['Save']}}" viewMode="link"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#captions
 * @cfg {Array} Pair of captions.
 * First caption displayed when toggle switch is off.
 * Second caption displayed when toggle switch is on.
 * @example
 * Toggle button with two captions.
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" size="m" captions="{{['Change', 'Save']}}" viewMode="link"/>
 * </pre>
 * Toggle button with one caption.
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" size="m" captions="{{['Save']}}" viewMode="link"/>
 * </pre>
 */

/**
 * @name Controls/_toggle/Button#viewMode
 * @cfg {Enum} Режим отображения кнопки.
 * @variant link В виде гиперссылки.
 * @variant toolButton В виде кнопки для панели инструментов.
 * @variant pushButton В виде гиперссылки, которая меняет свой внешний в зажатом состоянии
 * @default link
 * @example
 * Кнопка-переключатель в режиме отображения - 'link'.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="link" size="xl"/>
 * </pre>
 * Кнопка-переключатель в режиме отображения - 'toolButton'.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Кнопка-переключатель в режиме отображения - 'pushButton'.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="pushButton"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#viewMode
 * @cfg {Enum} Toggle button view mode.
 * @variant link Decorated hyperlink.
 * @variant pushButton Decorated hyperlink transform to toolbar button.
 * @variant toolButton Toolbar button.
 * @default link
 * @example
 * Toggle button with 'link' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" style="primary" viewMode="link" size="xl"/>
 * </pre>
 * Toggle button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" style="danger" viewMode="toolButton"/>
 * </pre>
 * Toggle button with 'pushButton' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" style="primary" viewMode="pushButton"/>
 * </pre>
 */
class ToggleButton extends Control<IToggleButtonOptions> implements IButton,
    ICheckable,
    IFontColorStyle,
    IFontSize,
    IHeight,
    IIconSize,
    IIconStyle,
    ITooltip {
    '[Controls/_toggle/interface/ICheckable]': true;
    '[Controls/_buttons/interface/IButton]': true;
    '[Controls/_interface/IIconStyle]': true;
    '[Controls/_interface/ITooltip]': true;
    '[Controls/_interface/IFontColorStyle]': true;
    '[Controls/_interface/IFontSize]': true;
    '[Controls/_interface/IHeight]': true;
    '[Controls/_interface/IIconSize]': true;

    // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
    protected _template: TemplateFunction = ToggleButtonTemplate;

    protected _buttonStyle: string;
    protected _fontColorStyle: string;
    protected _fontSize: string;
    protected _contrastBackground: boolean;
    protected _hasIcon: boolean;
    protected _viewMode: string;
    protected _height: string;
    private _caption: string | TemplateFunction;
    protected _stringCaption: boolean;
    private _icon: string;
    protected _iconSize: string;
    protected _iconStyle: string;
    protected _hoverIcon: boolean = true;

    private _calculateState(newOptions: IToggleButtonOptions): void {
        const value = newOptions.value;
        this._icon = (newOptions.icons ? (!value && newOptions.icons[1] ? newOptions.icons[1]
                                                                        : newOptions.icons[0]) : '');
        this._hasIcon = !!this._icon;

        this._caption = (newOptions.captions ? (!newOptions.value && newOptions.captions[1] ? newOptions.captions[1]
                                                                                        : newOptions.captions[0]) : '');
        this._stringCaption = typeof this._caption === 'string';

        const clonedOptions = {...newOptions};
        clonedOptions.icon = this._icon;
        this._iconSize = this._icon ? ActualApi.iconSize(newOptions.iconSize, this._icon) : '';
        this._iconStyle = this._icon ? ActualApi.iconStyle(newOptions.iconStyle, this._icon,
            newOptions.readOnly, false) : '';

        if (newOptions.viewMode === 'pushButton' || newOptions.viewMode === 'toolButton') {
            this._hoverIcon = !newOptions.value;
        } else {
            this._hoverIcon = true;
        }
    }

    protected _clickHandler(): void {
        if (!this._options.readOnly) {
            this._notify('valueChanged', [!this._options.value]);
        }
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.enter && !this._options.readOnly) {
            this._notify('click');
        }
    }

    protected _beforeMount(newOptions: IToggleButtonOptions): void {
        // TODO удалить когда актуализируем опции в кнопках у прикладников
        cssStyleGeneration.call(this, newOptions);
        this._calculateState(newOptions);
    }

    protected _beforeUpdate(newOptions: IToggleButtonOptions): void {
        // TODO удалить когда актуализируем опции в кнопках у прикладников
        cssStyleGeneration.call(this, newOptions);
        this._calculateState(newOptions);
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/toggle', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            viewMode: 'button',
            iconStyle: 'secondary',
            theme: 'default'
        };
    }
}

export default ToggleButton;
