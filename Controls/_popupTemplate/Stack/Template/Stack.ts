import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/Stack/Stack';
import * as rk from 'i18n!Controls';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplate, IPopupTemplateOptions} from 'Controls/_popupTemplate/interface/IPopupTemplate';
import 'css!Controls/popupTemplate';

export interface IStackTemplateOptions extends IControlOptions, IPopupTemplateOptions {
    headerBackgroundStyle: string;
    maximizeButtonVisibility?: boolean;
    workspaceWidth?: number;
    headerBorderVisible?: boolean;
    maximized?: boolean;
    stackMaxWidth?: number;
    stackMinWidth?: number;
    stackMinimizedWidth?: number;
    stackWidth?: number;
    rightPanelOptions?: object;
}

const MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON = 100;

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стекового окна}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Stack
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplate
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
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

    toggleMaximizeState(maximized?: boolean): void {
        /**
         * @event maximized
         * Occurs when you click the expand / collapse button of the panels.
         */
        let calcMaximized = maximized;
        if (calcMaximized === undefined) {
            calcMaximized = !StackTemplate._calculateMaximized(this._options);
        }
        this._notify('maximized', [calcMaximized], {bubbling: true});
    }

    protected changeMaximizedState(): void {
        this.toggleMaximizeState();
    }

    private _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    }

    private static _calculateMaximized(options: IStackTemplateOptions): boolean {
        // TODO: https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        if (!options.stackMinimizedWidth && options.stackMinWidth && options.stackMaxWidth) {
            const middle = (options.stackMinWidth + options.stackMaxWidth) / 2;
            return options.stackWidth - middle > 0;
        }
        return options.maximized;
    }

    static getDefaultOptions(): IStackTemplateOptions {
        return {
            headingFontSize: '3xl',
            headerBackgroundStyle: 'unaccented',
            headingFontColorStyle: 'secondary',
            closeButtonVisibility: true,
            closeButtonViewMode: 'toolButton',
            closeButtonTransparent: true,
            headerBorderVisible: true
        };
    }
}

Object.defineProperty(StackTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return StackTemplate.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Stack#headerBackgroundStyle
 * @cfg {String} Определяет цвет фона шапки стекового окна.
 * @variant default
 * @variant unaccented
 * @variant success
 * @variant danger
 * @default unaccented
 * @demo Controls-demo/PopupTemplate/Stack/headerBackgroundStyle/Index
 * @remark Данная опция определяет префикс стиля для настройки фона шапки стекового окна.
 * На шапку будет установлен класс **.controls-StackTemplate&#95;&#95;top-area&#95;@{headerBackgroundStyle}**, который следует определить у себя в стилях.
 */

/**
 * @name Controls/_popupTemplate/Stack#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */

/**
 * @name Controls/_popupTemplate/Stack#toolbarContentTemplate
 * @cfg {function|String} Шаблон контента под крестиком закрытия для размещения тулбара, расположенного в правой панели.
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
 * Позволяет скрыть отображение нижней границы {@link Controls/popupTemplate:IPopupTemplateBase#headerContentTemplate headerContentTemplate}. Используется для построения двухуровневых шапок.
 * Необходимо поместить свой контейнер с шапкой в {@link Controls/popupTemplate:IPopupTemplateBase#bodyContentTemplate bodyContentTemplate} и навесить:
 *
 * 1. класс, добавляющий фон для шапки:
 * <pre class="brush: css">
 * controls-StackTemplate__top-area_default
 * </pre>
 * 2. класс, добавляющий нижнюю границу для шапки:
 * <pre class="brush: css">
 * controls-StackTemplate__top-area-border
 * </pre>
 * @demo Controls-demo/PopupTemplate/Stack/HeaderBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Stack#workspaceWidth
 * @cfg {Number} Текущая ширина шаблона стековой панели
 * @remark
 * Опция только для чтения, значение устанавливается контролом Controls/popup исходя из заданной конфигурации окна
 */

/**
 * @name Controls/_popupTemplate/Stack#toggleMaximizeState
 * @function
 * @description Переключает состояние разворота панели.
 * @param {Boolean} maximize Определяет новое состояние разворота панели. Если аргумент не передан, то новое состояние задается противоположным текущему.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <ws:template name="StackTemplate">
 *  <Controls.popupTemplate:Stack name="my_stack">
 *      <ws:bodyContentTemplate>
 *          <Controls.input:Text value="_value" />
 *          <Controls.buttons:Button caption="maximized" on:click="_maximized()"/>
 *      </ws:bodyContentTemplate>
 *  </Controls.popupTemplate:Stack>
 * </ws:template>
 *
 * <Controls.popup:Stack name="stack" template="StackTemplate"/>
 *
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *
 *    _beforeMount() {
 *      var popupOptions = {
 *          autofocus: true
 *      }
 *      this._children.stack.open(popupOptions)
 *    }
 *
 *    _maximized() {
 *       this._children.my_stack.toggleMaximizeState()
 *    }
 *
 *    ...
 * }
 * </pre>
 */

/**
 * @name Controls/_popupTemplate/Stack#rightPanelOptions
 * @cfg {Object} Опции правой панели.
 */

export default StackTemplate;
