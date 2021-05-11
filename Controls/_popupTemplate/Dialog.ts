import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Dialog/Dialog');
import { SyntheticEvent } from 'UICommon/Events';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplate, IPopupTemplateOptions} from './interface/IPopupTemplate';
import 'css!Controls/popupTemplate';

export interface IDialogTemplateOptions extends IControlOptions, IPopupTemplateOptions {
   draggable?: boolean;
   headerBackgroundStyle?: string;
   headerBorderVisible?: boolean;
   backgroundStyle?: string;
}

interface IDragObject {
    offset: number;
}

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/#template диалогового окна}.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/#template руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Dialog
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/popupTemplate:IPopupTemplate
 * @implements Controls/popupTemplate:IPopupTemplateBase
 * @demo Controls-demo/PopupTemplate/Dialog/Index
 */

class DialogTemplate extends Control<IDialogTemplateOptions> implements IPopupTemplate {
    '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _headerTheme: string;

    protected _beforeMount(options: IDialogTemplateOptions): void {
        this._prepareTheme();
    }

    protected _beforeUpdate(options: IDialogTemplateOptions): void {
        this._prepareTheme();
    }

    private _onDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    private _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }

    private _prepareTheme(): void {
        this._headerTheme = ManagerController.getPopupHeaderTheme();
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        if (this._needStartDrag(event)) {
            this._startDragNDrop(event);
        }
    }

    private _needStartDrag(event: SyntheticEvent<MouseEvent>): boolean {
        const {target} = event;
        const isEventProcessed = event.nativeEvent.processed;
        return this._options.draggable && (target as HTMLElement).tagName !== 'INPUT' && !isEventProcessed;
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    static getDefaultOptions(): IDialogTemplateOptions {
        return {
            headingFontColorStyle: 'secondary',
            headerBackgroundStyle: 'default',
            headerBorderVisible: false,
            backgroundStyle: 'default',
            headingFontSize: '3xl',
            closeButtonVisibility: true,
            closeButtonViewMode: 'linkButton',
            closeButtonTransparent: true
        };
    }
}

Object.defineProperty(DialogTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DialogTemplate.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Dialog#draggable
 * @cfg {Boolean} Определяет, может ли окно перемещаться с помощью <a href='/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/'>d'n'd</a>.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Dialog#headerBorderVisible
 * @cfg {Boolean} Определяет, будет ли отображаться граница шапки панели.
 * @default false
 * @demo Controls-demo/PopupTemplate/Dialog/headerBorderVisible/Index
 */

/**
 * @name Controls/_popupTemplate/Dialog#headerBackgroundStyle
 * @cfg {String} Определяет цвет фона шапки диалогового окна.
 * @variant default
 * @variant unaccented
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/headerBackgroundStyle/Index
 * @remark Данная опция определяет префикс стиля для настройки фона шапки диалогового окна.
 * На шапку будет установлен класс **.controls-DialogTemplate&#95;&#95;top-area&#95;@{headerBackgroundStyle}**, который следует определить у себя в стилях.
 */

/**
 * @name Controls/_popupTemplate/Dialog#backgroundStyle
 * @cfg {String} Определяет цвет фона диалогового окна.
 * @variant default
 * @variant unaccented
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/backgroundStyle/Index
 * @remark Данная опция определяет префикс стиля для настройки фона диалогового окна.
 * На шаблон будет установлен класс **.controls-DialogTemplate&#95;backgroundStyle-@{headerBackgroundStyle}**, который следует определить у себя в стилях.
 */

export default DialogTemplate;
