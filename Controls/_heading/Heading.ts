import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import headingTemplate = require('wml!Controls/_heading/Heading/Heading');
import {descriptor as EntityDescriptor} from 'Types/entity';
import 'css!Controls/heading';
import {
    ITooltip,
    ITooltipOptions,
    ICaption,
    ICaptionOptions,
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions
} from 'Controls/interface';

export interface IHeadingOptions
    extends IControlOptions, ICaptionOptions, ITooltipOptions, IFontColorStyleOptions, IFontSizeOptions {
    textTransform: 'none' | 'uppercase';
}

/**
 * Простой заголовок с поддержкой различных стилей отображения и размеров.
 *
 * @remark
 * Может использоваться самостоятельно или в составе сложных заголовков, состоящих из {@link Controls/heading:Separator}, {@link Controls/heading:Counter} и {@link Controls/heading:Title}.
 * Для одновременной подсветки всех частей сложного заголовка при наведении используйте класс controls-Header_all__clickable на контейнере.
 * Кликабельность заголовка зависит от {@link readOnly режима отображения}.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/content-managment/heading/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_heading.less переменные тем оформления}
 *
 * @class Controls/_heading/Heading
 * @extends UI/Base:Control
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:ICaption
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 *
 */
class Header extends Control<IHeadingOptions> implements ICaption, ITooltip, IFontColorStyle, IFontSize {
    protected _template: TemplateFunction = headingTemplate;

    readonly '[Controls/_interface/ICaption]': boolean = true;
    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;

    static _theme: string[] = ['Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            fontSize: 'l',
            fontColorStyle: 'secondary',
            textTransform: 'none'
        };
    }

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String)
        };
    }
}

Object.defineProperty(Header, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Header.getDefaultOptions();
   }
});

/**
 * @typedef {String} TTextTransform
 * @variant none Без изменения регистра символов.
 * @variant uppercase Все символы текста становятся прописными (верхний регистр).
 */

/**
 * @name Controls/_heading/Heading#textTransform
 * @cfg {TTextTransform} Управляет преобразованием текста элемента в заглавные или прописные символы
 * @default none
 * @demo Controls-demo/Heading/Title/TextTransform/Index
 * @remark
 * Вместе с установкой преобразования текста, меняется так же расстояние между буквами.
 */

/**
 * @name Controls/_heading/Heading#fontSize
 * @cfg
 * @default l
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Heading#fontColorStyle
 * @cfg
 * @default secondary
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Heading#caption
 * @cfg
 * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
 * @example
 * <pre class="brush: html">
 * <Controls.heading:Title caption="Heading" fontColorStyle="primary" fontSize="xs"/>
 * </pre>
 */

export default Header;
