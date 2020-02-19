import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import backTemplate = require('wml!Controls/_heading/Back/Back');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {detection} from 'Env/Env';
import {Logger} from 'UI/Utils';

type TBackStyle = 'primary' | 'secondary';

export interface IBackOptions extends IControlOptions {
    style?: TBackStyle;
    size?: 's' | 'm' | 'l';
}

const MODERN_IE_VERSION = 11;

/**
 * Специализированный заголовок-кнопка для перехода на предыдущий уровень.
 *
 * <a href="/materials/demo-ws4-header-separator">Демо-пример</a>.
 *
 * @class Controls/_heading/Back
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/ITooltip
 * @mixes Controls/_heading/Back/BackStyles
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

/*
 * Specialized heading to go to the previous level.
 *
 * <a href="/materials/demo-ws4-header-separator">Demo-example</a>.
 *
 * @class Controls/_heading/Back
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/ITooltip
 * @mixes Controls/_heading/Back/BackStyles
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

/**
 * @name Controls/_heading/Back#style
 * @cfg {String} Стиль отображения заголовка-кнопки "Назад".
 * @variant primary
 * @variant secondary
 * @default primary
 * @example
 * Заголовок-кнопка со стилем по умолчанию.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Заголовок-кнопка со стилем "secondary".
 * <pre>
 *    <Controls.heading:Back style="secondary"/>
 * </pre>
 */

/*
 * @name Controls/_heading/Back#style
 * @cfg {String} Back heading display style.
 * @variant primary
 * @variant secondary
 * @default primary
 * @example
 * Back heading has default style.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Back heading has 'secondary' style.
 * <pre>
 *    <Controls.heading:Back style="secondary"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Back#size
 * @cfg {String} Размер заголовка-кнопки "Назад".
 * @variant s Маленький заголовок.
 * @variant m Средний заголовок.
 * @variant l Большой заголовок.
 * @default m
 * @example
 * Back heading has default size.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Back heading has 'l' size.
 * <pre>
 *    <Controls.heading:Back size="l"/>
 * </pre>
 */

/*
 * @name Controls/_heading/Back#size
 * @cfg {String} Back heading size.
 * @variant s Small heading size.
 * @variant m Medium heading size.
 * @variant l Large heading size.
 * @default m
 * @example
 * Back heading has default size.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Back heading has 'l' size.
 * <pre>
 *    <Controls.heading:Back size="l"/>
 * </pre>
 */

class Back extends Control<IBackOptions> {
    protected _template: TemplateFunction = backTemplate;
    protected _isOldIe: Boolean = false;
    protected _style: TBackStyle;

    private _convertOldStyleToNew(options: IBackOptions): void {
        if (options.style === 'default') {
            this._style = 'primary';
            Logger.warn('Heading.Back', 'Используются устаревшие стили. Используйте style primary вместо style default', this);
        } else {
            this._style = options.style;
        }
    }

    protected _beforeMount(options: IBackOptions): void {
        this._convertOldStyleToNew(options);
        this._isOldIe = detection.isIE && detection.IEVersion < MODERN_IE_VERSION;
    }

    protected _beforeUpdate(newOptions: IBackOptions): void {
        if (newOptions.style !== this._options.style) {
            this._convertOldStyleToNew(newOptions);
        }
    }

    static _theme: string[] = ['Controls/heading'];

    static getDefaultOptions(): object {
        return {
            style: 'primary',
            size: 'm'
        };
    }

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String).required(),
            style: EntityDescriptor(String).oneOf([
                'primary',
                'secondary',
                'default'
            ]),
            size: EntityDescriptor(String).oneOf([
                's',
                'm',
                'l'
            ])
        };
    }
}

export default Back;
