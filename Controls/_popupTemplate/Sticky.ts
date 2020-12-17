import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Sticky/Sticky';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplateBase, IPopupTemplateBaseOptions} from './interface/IPopupTemplateBase';

interface IStickyTemplateOptions extends IControlOptions, IPopupTemplateBaseOptions {
    shadowVisible?: boolean;
}

/**
 * Базовый шаблон для {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ прилипающих блоков}.
 * Имеет три контентные опции - для шапки, контента и подвала, а так же крестик закрытия, соответствующие стандарту выпадающих списков.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Sticky
 * @extends Core/Control
 * 
 * @public
 * @author Красильников А.С.
 * @implements Controls/_popupTemplate/interface/IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index
 * @demo Controls-demo/PopupTemplate/Sticky/CloseButtonVisibility/Index
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderContentTemplate/Index
 */

class StickyTemplate extends Control<IStickyTemplateOptions> implements IPopupTemplateBase {

    protected _template: TemplateFunction = template;
    protected _headerTheme: string;

    protected _beforeMount(options: IPopupTemplateBaseOptions): void {
        this._headerTheme = this._getTheme();
    }

    protected _beforeUpdate(options: IPopupTemplateBaseOptions): void {
        this._headerTheme = this._getTheme();
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _proxyEvent(event, eventName): void {
        this._notify(eventName, [event]);
    }

    private _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static _theme: string[] = ['Controls/popupTemplate'];

    static getDefaultOptions(): IStickyTemplateOptions {
        return {
            headingFontSize: 'l',
            headingFontColorStyle: 'secondary',
            closeButtonVisibility: true,
            shadowVisible: false
        };
    }
}
/**
 * @name Controls/_popupTemplate/Sticky#shadowVisible
 * @cfg {Boolean} Определяет, будет ли отображаться тень у прилипающего блока
 * @default false
 */
export default StickyTemplate;
