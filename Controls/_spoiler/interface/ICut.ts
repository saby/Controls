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
 * @name Controls/_spoiler/interface/ICut#lineHeight
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
 * @variant Кастомное значение.
 * @example
 * В данном примере зададим lineHeight с кастомным значением.
 * <pre class="brush: html">
 * <Controls.spoiler:Cut lineHeight="xxs" lines="{{3}}">
 *       <ws:content>
 *          ...
 *       </ws:content>
 *  </Controls.spoiler:Cut>
 * </pre>
 * <pre class="brush: css">
 * .controls-Cut_lineHeight-xxs {
 *    line-height: 14px;
 * }
 * .controls-Cut_lineHeight-xxs_lines-3_maxHeight {
 *    max-height: calc((3 + 1) * 14px);
 * }
 * .controls-Cut_lineHeight-xxs_lines-3_height {
 *    margin-top: calc((3 + 1) * 14px);
 * }
 * .controls-CutButton__container_lineHeight-xxs {
 *    height: 14px;
 * }
 * </pre>
 * @default m
 * @demo Controls-demo/Spoiler/Cut/LineHeight/Index
 * @remark
 * Высота строки задается константой из стандартного набора размеров, который определен для текущей темы оформления.
 * В случае задания кастомного значения в lineHeight нужно описать следующие классы со свойствами:
 * <ul>
 *    <li>controls-Cut_lineHeight-{{lineHeight}} определить line-height</li>
 *    <li>controls-Cut_lineHeight-{{lineHeight}}_lines-{{lines}}_maxHeight определить max-height</li>
 *    <li>controls-Cut_lineHeight-{{lineHeight}}_lines-{{lines}}_height определить margin-top</li>
 *    <li>controls-CutButton__container_lineHeight-{{lineHeight}} определить height</li>
 * </ul>
 */

/**
 * @name Controls/_spoiler/interface/ICut#lines
 * @cfg {Number|null} Количество строк.
 * @remark
 * Указав значение null, контент не будет иметь ограничение.
 * @demo Controls-demo/Spoiler/Cut/Lines/Index
 */

/**
 * @name Controls/_spoiler/interface/ICut#content
 * @cfg {TemplateFunction|String} Контент контрола.
 * @demo Controls-demo/Spoiler/Cut/Content/Index
 */
