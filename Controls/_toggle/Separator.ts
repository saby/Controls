import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import SeparatorTemplate = require('wml!Controls/_toggle/Separator/Separator');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';

export interface ISeparatorOptions extends IControlOptions, ICheckableOptions {
    style?: 'primary' | 'secondary' | 'unaccented';
    bold?: boolean;
}

/**
 * Кнопка-разделитель с поддержкой различных стилей отображения и жирным шрифтом. Может использоваться как самостоятельно, так и в составе {@link Controls/heading сложных заголовков}.
 *
 * <a href="/materials/demo-ws4-header-separator">Демо-пример</a>.
 *
 * @class Controls/_toggle/Separator
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @implements Controls/_toggle/interface/ICheckable
 *
 * @demo Controls-demo/toggle/Separator/Index
 *
 */

/*
 * Button separator with support different display styles and can be bold thickness. Can be used independently or as part of complex headers(you can see it in Demo-example)
 * consisting of a <a href="/docs/js/Controls/Heading/?v=3.18.500">header</a>, a <a href="/docs/js/Controls/Heading/Separator/?v=3.18.500">header-separator</a> and a <a href="/docs/js/Controls/Heading/Counter/?v=3.18.500">counter</a>.
 *
 * <a href="/materials/demo-ws4-header-separator">Demo-example</a>.
 *
 * @class Controls/_toggle/Separator
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @implements Controls/_toggle/interface/ICheckable
 *
 * @demo Controls-demo/toggle/Separator/Index
 *
 */

/**
 * @name Controls/_toggle/Separator#style
 * @cfg {String} Стиль отображения разделителя.
 * @variant secondary
 * @variant unaccented
 * @variant primary
 */

/*
 * @name Controls/_toggle/Separator#style
 * @cfg {String} Separator display style.
 * @variant secondary
 * @variant additional
 * @variant primary
 */

/**
 * @name Controls/_toggle/Separator#bold
 * @cfg {Boolean} Определяет толщину двойного разделителя.
 */

/*
 * @name Controls/_toggle/Separator#bold
 * @cfg {Boolean} Determines the double separator thickness.
 */

class Separator extends Control<ISeparatorOptions> implements ICheckable {
    '[Controls/_toggle/interface/ICheckable]': true;

    // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
    protected _template: TemplateFunction = SeparatorTemplate;

    protected _icon: String;

    protected _clickHandler(): void {
        this._notify('valueChanged', [!this._options.value]);
    }

    private _iconChangedValue(options: ISeparatorOptions): void {
        if (options.value) {
            this._icon = 'icon-' + (options.bold ? 'MarkCollapseBold ' : 'CollapseLight ');
        } else {
            this._icon = 'icon-' + (options.bold ? 'MarkExpandBold ' : 'ExpandLight ');
        }
    }

    protected _beforeMount(options: ISeparatorOptions): void {
        this._iconChangedValue(options);
    }

    protected _beforeUpdate(newOptions: ISeparatorOptions): void {
        this._iconChangedValue(newOptions);
    }

    static _theme: string[] = ['Controls/toggle', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            style: 'secondary',
            value: false,
            bold: false
        };
    }

    static getOptionTypes(): object {
        return {
            bold: EntityDescriptor(Boolean),
            style: EntityDescriptor(String).oneOf([
                'secondary',
                'primary',
                'unaccented'
            ]),
            value: EntityDescriptor(Boolean)
        };
    }
}

export default Separator;
