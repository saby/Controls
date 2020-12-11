import {TemplateFunction} from 'UI/Base';

/**
 * "Богатый" шаблон отображения элементов в  {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/IRichTemplate
 * @mixes Controls/_tile/interface/ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:RichTemplate"
 *                   description="Описание"
 *                   descriptionLines="5"
 *                   imagePosition="top"
 *                   titleLines="2"
 *                   imageSize="m">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/RichTemplate/Index
 * @remark
 * Шаблон автоматическую высоту. Плитка вытягивается по высоте максимального элемента в строке. Опция tileHeight не учитывается.
 */

export default interface IRichTemplateOptions {
    /**
     * @typedef {String} ImageSize
     * @variant s Размер, соответствующий размеру s.
     * @variant m Размер, соответствующий размеру m.
     * @variant l Размер, соответствующий размеру l.
     */
    /**
     * @name Controls/_tile/interface/IRichTemplate#imageSize
     * @default s
     * @cfg {ImageSize} Размер изображения.
     * @remark При вертикальном располажении изображении размер фото фиксированный.
     * @see imagePosition
     */
    imageSize?: 's' | 'm' | 'l';
    /**
     * @typedef {String} ImagePosition
     * @variant top Изображение отображается сверху.
     * @variant left Изображение отображается слева.
     * @variant right Изображение отображается справа.
     */
    /**
     * @name Controls/_tile/interface/IRichTemplate#imagePosition
     * @cfg {ImagePosition} Размер изображения.
     */
    imagePosition?: 'top' | 'left' | 'right';

    /**
     * @typedef {String} ImageViewMode
     * @variant rectangle Изображение отображается в виде прямоугольника.
     * @variant circle Изображение отображается в виде круга.
     * @variant ellipse Изображение отображается в виде суперэллипса.
     * @variant none Изображение не отображается.
     */
    /**
     * @name Controls/_tile/interface/IRichTemplate#imageViewMode
     * @cfg {ImageViewMode} Вид отображения изображения.
     * @default rectangle
     */
    imageViewMode?: 'rectangle' | 'circle' | 'ellipse' | 'none';

    /**
     * @typedef {String} NodesScaleSize
     * @variant s Изображение будет уменьшено на 50%;
     * @variant m Изображение будет уменьшено на 25%;.
     * @variant l Изображение будет иметь оригинальный размер.
     */
    /**
     * @name Controls/_tile/interface/IRichTemplate#nodesScaleSize
     * @cfg {NodesScaleSize} Коэффициент для уменьшения высоты изображения у папок.
     * @default l
     */
    nodesScaleSize?: 's' | 'm' | 'l';

    /**
     * @typedef {String} ImageEffect
     * @variant none Изображение отображается без эффектов.
     * @variant gradient Изображение отображается с градиентом.
     * @see gradientColor
     */
    /**
     * @name Controls/_tile/interface/IRichTemplate#imageEffect
     * @cfg {ImageEffect} Эффект у изображения.
     * @default none
     */
    imageEffect?: 'none' | 'gradient';

    /**
     * @name Controls/_tile/interface/IRichTemplate#gradientColor
     * @cfg {String} Цвет градиента. Можно указывать в любом формате, который поддерживается в CSS.
     * @default #FFF
     * @see imageEffect
     */
    gradientColor?: string;

    /**
     * @name Controls/_tile/interface/IRichTemplate#titleLines
     * @cfg {Number} Количество строк в заголовке.
     * @default 1
     */
    titleLines?: number;

    /**
     * @name Controls/_tile/interface/IRichTemplate#titleColorStyle
     * @cfg {String} Цвет заголовка.
     * @default default
     */
    titleColorStyle?: string;

    /**
     * @name Controls/_tile/interface/IRichTemplate#descriptionLines
     * @cfg {Number} Количество строк в описании.
     * @default 1
     */
    descriptionLines?: number;

    /**
     * @name Controls/_tile/interface/IRichTemplate#description
     * @cfg {String} Текст описания.
     */
    description?: string;

    /**
     * @name Controls/_tile/interface/IRichTemplate#footerTemplate
     * @cfg {TemplateFunction | String} Шаблон подвала элемента.
     */
    footerTemplate?: TemplateFunction | string;
}
