import {TemplateFunction} from 'UI/Base';
/**
 * Шаблон для отображения элементов в режиме превью в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/IPreviewTemplate
 * @mixes Controls/tile:ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:PreviewTemplate"
 *                   titleStyle="dark"
 *                   gradientType="light"
 *                   titleLines="2">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/PreviewTemplate/Index
 */

export default interface IPreviewTemplateOptions {
    /**
     * @cfg {Number} Количество строк в заголовке.
     */
    titleLines?: number;
    /**
     * @typedef {String} TitleStyle
     * @variant light Светлый заголовок.
     * @variant dark Темный заголовок.
     */

    /**
     * @cfg {TitleStyle} Стиль отображения заголовка плитки.
     * @default light
     * @see gradientType
     */
    titleStyle?: 'light' | 'dark';
    /**
     * @typedef {String} GradientType
     * @variant light Светлый градиент у заголовка.
     * @variant dark Темный градиент у заголовока.
     * @variant custom Пользовательский цвет градиента.
     */

    /**
     * @cfg {GradientType} Тип отображения градиента.
     * @see gradientColor
     */
    gradientType?: 'light' | 'dark' | 'custom';

    /**
     * @cfg {String} Цвет градиента. Можно указывать в любом формате, который поддерживается в CSS.
     * @default #FFF
     * @see gradientType
     */
    gradientColor?: string;
    /**
     * @cfg {TemplateFunction} Шаблон справа от заголовка плитки.
     * @default undefined
     * @see gradientType
     */
    bottomRightTemplate: TemplateFunction;
    /**
     * @cfg {TemplateFunction} Шаблон подвала элемента.
     * @default undefined
     * @see gradientType
     */
    footerTemplate: TemplateFunction;

    /**
     * @cfg {TemplateFunction} Шаблон шапки элемента.
     * @default undefined
     * @see gradientType
     */
    topTemplate: TemplateFunction;
}
