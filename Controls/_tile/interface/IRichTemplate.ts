import {TemplateFunction} from 'UI/Base';

/**
 * @typedef {Object} ICharacteristicsItem
 * @description Элемент харастеристики для отображения на плитке.
 * @property {String} icon Название иконки.
 * @property {String} title Подпись рядом с иконкой.
 * @property {String} tooltip Текст при наведении на характеристику.
 */
interface ICharacteristicsItem {
    icon: string;
    title: string;
    tooltip: string;
}

/**
 * "Богатый" шаблон отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/IRichTemplate
 * @mixes Controls/tile:ItemTemplate
 * @author Михайлов С.Е
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html; highlight: [3-11]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:RichTemplate"
 *          description="Описание"
 *          descriptionLines="5"
 *          imagePosition="top"
 *          titleLines="2"
 *          imageSize="m">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/Index
 * @remark
 * Шаблон автоматическую высоту. Плитка вытягивается по высоте максимального элемента в строке. Опция tileHeight не учитывается.
 * Подробнее о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tile/item/rich/ здесь}.
 */

export default interface IRichTemplateOptions {
    /**
     * @typedef {String} ImageSize
     * @variant s Размер, соответствующий размеру s.
     * @variant m Размер, соответствующий размеру m.
     * @variant l Размер, соответствующий размеру l.
     */
    /**
     * @cfg {ImageSize} Размер изображения.
     * @remark При вертикальном расположении изображений размер фото фиксированный.
     * @default s
     * @see imagePosition
     * @see imageViewMode
     * @see imageEffect
     */
    imageSize?: 's' | 'm' | 'l';
    /**
     * @typedef {String} ImagePosition
     * @variant top Изображение отображается сверху.
     * @variant left Изображение отображается слева.
     * @variant right Изображение отображается справа.
     */
    /**
     * @cfg {ImagePosition} Размер изображения.
     * @see imageSize
     * @see imageViewMode
     * @see nodesScaleSize
     * @see imageEffect
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
     * @cfg {ImageViewMode} Вид отображения изображения.
     * @default rectangle
     * @see imageSize
     * @see imagePosition
     * @see nodesScaleSize
     * @see imageEffect
     */
    imageViewMode?: 'rectangle' | 'circle' | 'ellipse' | 'none';

    /**
     * @typedef {String} NodesScaleSize
     * @variant s Изображение будет уменьшено на 50%.
     * @variant m Изображение будет уменьшено на 25%.
     * @variant l Изображение будет иметь оригинальный размер.
     */
    /**
     * @cfg {NodesScaleSize} Коэффициент для уменьшения высоты изображения у папок.
     * @default l
     * @see imageSize
     * @see imagePosition
     * @see imageViewMode
     * @see imageEffect
     */
    nodesScaleSize?: 's' | 'm' | 'l';

    /**
     * @typedef {String} ImageEffect
     * @variant none Изображение отображается без эффектов.
     * @variant gradient Изображение отображается с градиентом.
     * @see gradientColor
     */
    /**
     * @cfg {ImageEffect} Эффект у изображения.
     * @default none
     * 
     * @see nodesScaleSize
     */
    imageEffect?: 'none' | 'gradient';

    /**
     * @cfg {String} Цвет градиента. Можно указывать в любом формате, который поддерживается в CSS.
     * @default #FFF
     * @see imageSize
     * @see imagePosition
     * @see imageViewMode
     * @see imageEffect
     */
    gradientColor?: string;

    /**
     * @cfg {Number} Количество строк в заголовке.
     * @default 1
     * @see titleColorStyle
     */
    titleLines?: number;

    /**
     * @cfg {String} Цвет заголовка.
     * @default default
     * @see titleLines
     */
    titleColorStyle?: string;

    /**
     * @cfg {Number} Количество строк в описании.
     * @default 1
     * @see description
     */
    descriptionLines?: number;

    /**
     * @cfg {String} Текст описания.
     * @see descriptionLines
     */
    description?: string;

    /**
     * @cfg {TemplateFunction | String} Шаблон подвала элемента.
     */
    footerTemplate?: TemplateFunction | string;

    /**
     * @cfg {Array<ICharacteristicsItem>} Конфигурация характеристик для вывода под заголовком плитки.
     */
    characteristics?: ICharacteristicsItem;

    /**
     * @cfg {TemplateFunction} Шаблон редактирования для заголовка.
     * @see descriptionEditor
     * @see footerEditor
     * @see afterImageTemplate
     */
    titleEditor?: TemplateFunction;

    /**
     * @cfg {TemplateFunction} Шаблон редактирования для описания.
     * @see titleEditor
     * @see footerEditor
     * @see afterImageTemplate
     */
    descriptionEditor?: TemplateFunction;

    /**
     * @cfg {TemplateFunction} Шаблон редактирования для подвала.
     * @see titleEditor
     * @see descriptionEditor
     * @see afterImageTemplate
     */
    footerEditor?: TemplateFunction;

    /**
     * @cfg {TemplateFunction} Шаблон, отображаемый после изображения и до заголовка.
     * @see titleEditor
     * @see descriptionEditor
     * @see footerEditor
     */
    afterImageTemplate?: TemplateFunction;
}
