import {EventUtils} from 'UI/Events';

import {Control, TemplateFunction} from 'UI/Base';
import {IHeading, IHeadingOptions, default as Heading} from 'Controls/_spoiler/Heading';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/View/View';
import {SyntheticEvent} from 'Vdom/Vdom';
import Util from './Util';

/**
 * Интерфейс опций контрола {@link Controls/spoiler:View}.
 *
 * @interface Controls/_spoiler/IViewOptions
 * @public
 * @author Красильников А.С.
 */
/**
 * @name Controls/_spoiler/IViewOptions#headerContentTemplate
 * @cfg {function|String} Контент, занимающий свободное пространство справа от заголовка. Если заголовка нет, то контент занимает все пространство шапки, в этом случае заголовок можно добавить вручную в любом месте.
 * @demo Controls-demo/Spoiler/Header/Index
 * @demo Controls-demo/Spoiler/HeaderRight/Index
 * @demo Controls-demo/Spoiler/HeadingLeft/Index
 */
/**
 * @name Controls/_spoiler/IViewOptions#content
 * @cfg {TemplateFunction} Шаблон скрываемой области.
 * @demo Controls-demo/Spoiler/View/Content/Index
 */

export interface IViewOptions extends IHeadingOptions {
    content: TemplateFunction;
    headerContentTemplate?: TemplateFunction;
}

export interface IView extends IHeading {
    readonly '[Controls/_spoiler/IView]': boolean;
}

/**
 * Графический контрол, отображаемый в виде загловка с контентной областью.
 * Предоставляет пользователю возможность управления видимостью области при нажатии на заголовок.
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_spoiler.less">переменные тем оформления</a>
 * * <a href="http://axure.tensor.ru/StandardsV8/%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D1%8B_%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0_%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D0%BE%D0%B2.html">стандарт</a>
 *
 * @class Controls/_spoiler/View
 * @extends UI/Base:Control
 * @mixes Controls/interface:IExpandable
 * @mixes Controls/spoiler:IHeadingOptions
 * @mixes Controls/spoiler:IViewOptions
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Spoiler/View/Index
 */
class View extends Control<IViewOptions> implements IView {
    protected _notifyHandler: Function = EventUtils.tmplNotify;

    protected _template: TemplateFunction = template;
    protected _expanded: boolean = false;

    readonly '[Controls/_spoiler/IView]': boolean = true;
    readonly '[Controls/_spoiler/IHeading]': boolean = true;
    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    protected _beforeMount(options?: IViewOptions, contexts?: object, receivedState?: void): void {
        this._expanded = Util._getExpanded(options, this._expanded);
    }

    protected _beforeUpdate(options?: IViewOptions, contexts?: any): void {
        this._expanded = Util._getExpanded(options, this._expanded);
    }

    private _expandedHandler(e: SyntheticEvent, state: boolean): void {
        this._notify('expandedChanged', [state]);
        this._expanded = state;
    }

    static _theme: string[] = ['Controls/spoiler'];

    static getDefaultOptions(): Partial<IViewOptions> {
        return Heading.getDefaultOptions();
    }

    static getOptionTypes(): Partial<IViewOptions> {
        return Heading.getOptionTypes();
    }
}

export default View;

/**
 * @name Controls/_spoiler/View#headingFontSize
 * @cfg {Enum} Размер шрифта заголовка.
 * @see Controls/spoiler:Heading#fontSize
 */
/**
 * @name Controls/_spoiler/View#headingFontWeight
 * @cfg {Enum} Начертание шрифта заголовка.
 * @see Controls/spoiler:Heading#fontWeight
 */
/**
 * @name Controls/_spoiler/View#headingFontColorStyle
 * @cfg {Enum} Стиль цвета текста и иконки заголовка.
 * @see Controls/spoiler:Heading#fontColorStyle
 */
