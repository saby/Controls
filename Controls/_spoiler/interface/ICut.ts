import {TemplateFunction} from 'UI/Base';
import {ICutButton} from '../CutButton';
import {IBackgroundStyleOptions, IExpandableOptions} from 'Controls/interface';

type TLineHeight = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type TIconSize = 's' | 'm' | 'l';

export interface ICutOptions extends ICutButton, IBackgroundStyleOptions, IExpandableOptions {
    lineHeight: TLineHeight;
    lines: number | null;
    content: TemplateFunction | string;
    iconSize?: TIconSize;
    contrastBackground: boolean;
    height?: number;
}

/**
 * Интерфейс для контролов, ограничивающих контент заданным числом строк.
 * @interface Controls/_spoiler/interface/ICut
 * @mixes Control/interface:IBackgroundStyle
 * @mixes Control/interface:IExpandable
 * @implements Controls/interface:IIconSize
 * @implements Controls/_interface:IHeight
 * @mixes Control/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */
export default interface ICut {
    readonly '[Controls/_spoiler/interface/ICut]': boolean;
}

/**
 * @name Controls/_spoiler/interface/ICut#buttonPosition
 * @cfg {String} Положение кнопки развертывания.
 * @variant start по левому краю контентной области
 * @variant center по центру контентной области
 * @default center
 * @demo Controls-demo/Spoiler/Cut/ButtonPosition/Index
 */

/**
 * @name Controls/_spoiler/interface/ICut#iconSize
 * @cfg {String} Размер иконки.
 * @variant s малый
 * @variant m средний
 * @variant l большой
 * @default default
 * @demo Controls-demo/Spoiler/Cut/IconSize/Index
 * @remark
 * Размер иконки задается константой из стандартного набора размеров, который определен для текущей темы оформления.
 * @example
 * Кнопка с размером иконки "s".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.spoiler:Cut lines="{{3}}" iconSize="s">
 * </pre>
 */

/**
 * @name Controls/_spoiler/interface/ICut#contrastBackground
 * @cfg {Boolean} Определяет контрастность фона.
 * @demo Controls-demo/Spoiler/Cut/ContrastBackground/Index
 */

/**
 * @name Controls/_spoiler/interface/ICut#inlineHeight
 * @cfg {String} Высота контрола.
 * Высота строки
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @default m
 * @demo Controls-demo/Spoiler/Cut/LineHeight/Index
 * @remark
 * Высота строки задается константой из стандартного набора размеров, который определен для текущей темы оформления.
 */

/**
 * @name Controls/_spoiler/interface/ICut#lines
 * @cfg {Number|null} Количество строк.
 * @remark
 * Указав значение null, контент не будет иметь ограничение.
 * @demo Controls-demo/Spoiler/Cut/Lines/Index
 */

/**
 * @name Controls/_spoiler/interface/ICut#height
 * @cfg {Number} Высота контента, после достижения которой он будет обрезан.
 * @default undefined
 * @demo Controls-demo/Spoiler/Cut/Height/Index
 */

/**
 * @name Controls/_spoiler/interface/ICut#content
 * @cfg {TemplateFunction|String} Контент контрола.
 * @demo Controls-demo/Spoiler/Cut/Content/Index
 */
