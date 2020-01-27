import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Stack/Stack');
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplate, IPopupTemplateOptions} from "./interface/IPopupTemplate";

export interface IStackTemplateOptions extends IControlOptions, IPopupTemplateOptions{
    maximizeButtonVisibility?: boolean;
    workspaceWidth?: number;
    headerBorderVisible?: boolean;
    //TODO: will be deleted after https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
    maximized?: boolean;
    stackMaxWidth?: number;
    stackMinWidth?: number;
    stackMinimizedWidth?: number;
    stackWidth?: number;

}

const MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON = 100;

/**
 * Базовый шаблон {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/stack/ стекового окна}.
 * @class Controls/_popupTemplate/Stack
 * @extends Core/Control
 * @control
 * @public
 * @category Popup
 * @author Красильников А.С.
 * @implements Controls/_popupTemplate/interface/IPopupTemplate
 * @implements Controls/_popupTemplate/interface/IPopupTemplateBase
 * @demo Controls-demo/Popup/Templates/StackTemplatePG
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#maximizeButtonVisibility
 * @cfg {Boolean} Определяет, будет ли отображаться кнопка изменения размера.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Stack#headerBorderVisible
 * @cfg {Boolean} Определяет, будет ли отображаться граница шапки панели.
 * @default true
 * @remark
 * Позволяет скрыть отображение нижней границы headerContentTemplate. Используется для построения двухуровневых шапок.
 * Необходимо поместить свой контейнер с шапкой в bodeContentTemplate и навесить класс,
 * добавляющий фон для шапки: controls-StackTemplate__top-area-background_theme_{{_options.theme}},
 * и класс, добавляющий нижнюю границу для шапки: controls-StackTemplate__top-area-border_theme_{{_options.theme}}
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#workspaceWidth
 * @cfg {Number} Текущая ширина шаблона стековой панели
 * @remark
 * Опция только для чтения, значение устанавливается контролом Controls/popup исходя из заданной конфигурации окна
 */

class StackTemplate extends Control<IStackTemplateOptions> implements IPopupTemplate {
    '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _headerTheme: string;
    protected _maximizeButtonTitle: string;
    protected _maximizeButtonVisibility: boolean = false;

    protected _beforeMount(options: IStackTemplateOptions): void {
        this._maximizeButtonTitle = `${rk('Свернуть')}/${rk('Развернуть', 'окно')}`;
        this._updateMaximizeButton(options);
        this._prepareTheme();
    }

    protected _beforeUpdate(options: IStackTemplateOptions): void {
        this._updateMaximizeButton(options);
        this._prepareTheme();
    }
    protected _afterUpdate(oldOptions: IStackTemplateOptions): void {
        if (this._options.maximized !== oldOptions.maximized) {
            this._notify('controlResize', [], {bubbling: true});
        }
    }

    private _updateMaximizeButton(options: IStackTemplateOptions): void {
        if (options.stackMaxWidth - options.stackMinWidth < MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON) {
            this._maximizeButtonVisibility = false;
        } else {
            this._maximizeButtonVisibility = options.maximizeButtonVisibility;
        }
    }

    protected close() : void {
        this._notify('close', [], {bubbling: true});
    }

    protected changeMaximizedState() : void {
        /**
         * @event maximized
         * Occurs when you click the expand / collapse button of the panels.
         */
        const maximized = this._calculateMaximized(this._options);
        this._notify('maximized', [!maximized], {bubbling: true});
    }

    private _calculateMaximized(options: IStackTemplateOptions) : boolean {
        // TODO: https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        if (!options.stackMinimizedWidth && options.stackMinWidth && options.stackMaxWidth) {
            const middle = (options.stackMinWidth + options.stackMaxWidth) / 2;
            return options.stackWidth - middle > 0;
        }
        return options.maximized;
    }

    private _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    }

    static _theme: string[] = ['Controls/popupTemplate'];

    static getDefaultOptions(): IStackTemplateOptions {
        return {
            headingStyle: 'secondary',
            closeButtonVisibility: true,
            headingSize: 'l',
            closeButtonViewMode: 'toolButton',
            closeButtonTransparent: true,
            headerBorderVisible: true,
        };
    }
}

export default StackTemplate;
