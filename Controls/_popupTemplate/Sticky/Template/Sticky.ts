import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Sticky/Template/Sticky';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplateBase, IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
import IBackgroundStyle, {IBackgroundStyleOptions} from 'Controls/_interface/IBackgroundStyle';
import 'css!Controls/popupTemplate';

interface IStickyTemplateOptions extends IControlOptions, IPopupTemplateBaseOptions, IBackgroundStyleOptions {
    shadowVisible?: boolean;
}

/**
 * Базовый шаблон для {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ прилипающих блоков}.
 * Имеет три контентные опции - для шапки, контента и подвала, а так же крестик закрытия, соответствующие стандарту выпадающих списков.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Sticky
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Sticky/FooterContentTemplate/Index
 * @demo Controls-demo/PopupTemplate/Sticky/CloseButtonVisibility/Index
 * @demo Controls-demo/PopupTemplate/Sticky/HeaderContentTemplate/Index
 */

class StickyTemplate extends Control<IStickyTemplateOptions> implements IPopupTemplateBase, IBackgroundStyle {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplateBase]': boolean;
    readonly '[Controls/_interface/IBackgroundStyle]': boolean;

    protected _template: TemplateFunction = template;
    protected _headerTheme: string;

    protected _beforeMount(options: IPopupTemplateBaseOptions): void {
        this._headerTheme = StickyTemplate._getTheme();
    }

    protected _beforeUpdate(options: IPopupTemplateBaseOptions): void {
        this._headerTheme = StickyTemplate._getTheme();
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _proxyEvent(event: Event, eventName: string): void {
        this._notify(eventName, [event]);
    }

    private static _getTheme(): string {
        return ManagerController.getPopupHeaderTheme();
    }

    static getDefaultOptions(): IStickyTemplateOptions {
        return {
            headingFontSize: 'l',
            headingFontColorStyle: 'secondary',
            closeButtonVisibility: true,
            shadowVisible: false,
            backgroundStyle: 'default'
        };
    }
}

Object.defineProperty(StickyTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return StickyTemplate.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Sticky#shadowVisible
 * @cfg {Boolean} Определяет, будет ли отображаться тень у прилипающего блока
 * @default false
 */
export default StickyTemplate;
