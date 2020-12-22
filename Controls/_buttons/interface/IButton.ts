import {IContrastBackground} from 'Controls/interface';

export interface IButtonOptions {
    contrastBackground?: boolean;
    buttonStyle?: string;
}
/**
 * Интерфейс для стилевого оформления кнопки.
 *
 * @interface Controls/_buttons/interface/IButton
 * @implements Controls/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for Button control.
 *
 * @interface Controls/_buttons/interface/IButton
 * @public
 * @author Красильников А.С.
 */
export interface IButton extends IContrastBackground {
    readonly '[Controls/_buttons/interface/IButton]': boolean;
}

/**
 * @name Controls/_buttons/interface/IButton#contrastBackground
 * @cfg
 * @default false
 * @remark
 * Опция используется для акцентирования внимания на кнопке, и ее визуального выделения относительно окружения.
 * @demo Controls-demo/Buttons/ContrastBackground/Index
 * @example
 * У кнопки контрастный фон.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="toolButton" contrastBackground="{{true}}" />
 * </pre>
 * @see style
 */

/*
 * @name Controls/_buttons/interface/IButton#contrastBackground
 * @cfg
 * @default true
 * @example
 * Button has transparent background.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="toolButton" contrastBackground="{{false}}" inlineHeight="xl"/>
 * </pre>
 * Button hasn't transparent background.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="toolButton" />
 * </pre>
 * @see style
 */

/**
 * @name Controls/_buttons/interface/IButton#buttonStyle
 * @cfg {Enum} Стиль отображения кнопки.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant danger
 * @variant unaccented
 * @default secondary
 * @remark
 * Стиль может влиять на цвет фона или цвет границы для различных значений режима отображения (viewMode).
 * @demo Controls-demo/Buttons/ButtonStyle/Index
 * @example
 * Кнопка со стилем "Primary" с иконкой по умолчанию.
 * <pre>
 *    <Controls.buttons:Button viewMode="button" buttonStyle="primary"/>
 * </pre>
 */

/*
 * @name Controls/_buttons/interface/IButton#buttonStyle
 * @cfg {Enum} Set style parameters for button. These are background color or border color for different values of viewMode
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @default secondary
 * @example
 * Primary button with default icon style.
 * <pre>
 *    <Controls.buttons:Button viewMode="button" buttonStyle="primary"/>
 * </pre>
 */
