import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import counterTemplate = require('wml!Controls/_heading/Counter/Counter');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {IFontColorStyle, IFontColorStyleOptions, IFontSize, IFontSizeOptions} from 'Controls/interface';
import {counterSize, counterStyle} from './_ActualAPI';

export interface ICounterOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions {
    style?: 'primary' | 'secondary' | 'disabled';
    size?: 's' | 'm' | 'l';
}

/**
 * Счетчик с поддержкой различных стилей отображения и размеров.
 * 
 * @remark
 * Используется в составе сложных заголовков, состоящих из {@link Controls/heading:Separator}, {@link Controls/heading:Counter} и {@link Controls/heading:Title}.
 * Для одновременной подсветки всех частей сложного заголовка при наведении используйте класс controls-Header_all__clickable на контейнере.
 * 
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/content-managment/heading/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_heading.less">переменные тем оформления</a>
 *
 * @class Controls/_heading/Counter
 * @extends Core/Control
 * @implements Controls/_interface/ICaption
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @control
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/Heading/Counters/Index
 */

/*
 * Counter with support different display styles and sizes. Used as part of complex headers(you can see it in Demo-example)
 * consisting of a <a href="/docs/js/Controls/_heading/?v=3.18.500">header</a>, a <a href="/docs/js/Controls/_heading/Separator/?v=3.18.500">header-separator</a> and a <a href="/docs/js/Controls/Button/Separator/?v=3.18.500">button-separator</a>.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">Demo-example</a>.
 *
 * @class Controls/_heading/Counter
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 *
 * @demo Controls-demo/Heading/Counters/Index
 */

/**
 * @name Controls/_heading/Counter#size
 * @cfg {String} Размер счетчика.
 * @variant l Большой счетчик.
 * @variant m Средний счетчик.
 * @variant s Маленький счетчик.
 * @default m
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте {@link Controls/_heading/Counter#fontSize}.
 */

/*
 * @name Controls/_heading/Counter#size
 * @cfg {String} Size of Counter.
 * @variant l Large counter size.
 * @variant m Medium counter size.
 * @variant s Small counter size.
 * @default m
 * @deprecated
 */

/**
 * @name Controls/_heading/Counter#style
 * @cfg {String} Стиль отображения счетчика.
 * @variant primary
 * @variant secondary
 * @variant disabled
 * @default primary
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте {@link Controls/_heading/Counter#fontColorStyle}.
 */

/*
 * @name Controls/_heading/Counter#style
 * @cfg {String} Counter displaying style.
 * @variant primary
 * @variant secondary
 * @variant disabled
 * @default primary
 * @deprecated
 */

class Counter extends Control<ICounterOptions> implements IFontColorStyle, IFontSize {
    '[Controls/_interface/IFontColorStyle]': boolean = true;
    '[Controls/_interface/IFontSize]': boolean = true;

    protected _template: TemplateFunction = counterTemplate;
    protected _fontSize: string;
    protected _fontColorStyle: string;

    protected _beforeMount(newOptions: ICounterOptions): void {
        this._fontSize = counterSize(newOptions.size, newOptions.fontSize);
        this._fontColorStyle = counterStyle(newOptions.style, newOptions.fontColorStyle);
    }

    protected _beforeUpdate(newOptions: ICounterOptions): void {
        this._fontSize = counterSize(newOptions.size, newOptions.fontSize);
        this._fontColorStyle = counterStyle(newOptions.style, newOptions.fontColorStyle);
    }

    static _theme: string[] = ['Controls/heading', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            style: 'primary',
            size: 'm'
        };
    }

    static getOptionTypes(): object {
        return {
            value: EntityDescriptor(Number),
            style: EntityDescriptor(String).oneOf([
                'primary',
                'secondary',
                'disabled'
            ]),
            size: EntityDescriptor(String).oneOf([
                'm',
                's',
                'l'
            ])
        };
    }
}

export default Counter;
