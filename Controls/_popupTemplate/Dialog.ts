import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Dialog/Dialog');
import {SyntheticEvent} from 'Vdom/Vdom';
import {Controller as ManagerController} from 'Controls/popup';
import {default as IPopupTemplate, IPopupTemplateOptions} from './interface/IPopupTemplate';
import {goUpByControlTree} from 'UI/Focus';

export interface IDialogTemplateOptions extends IControlOptions, IPopupTemplateOptions {
   draggable?: boolean;
   headerBackgroundStyle?: string;
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
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Dialog
 * @extends UI/Base:Control
 * 
 * @public
 * @author Красильников А.С.
 * @implements Controls/_popupTemplate/interface/IPopupTemplate
 * @implements Controls/_popupTemplate/interface/IPopupTemplateBase
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

    private _onMouseDown(event: SyntheticEvent<Event>): void {
        if (this._needStartDrag(event.target)) {
            this._startDragNDrop(event);
        }
    }

    private _needStartDrag(target: EventTarget): boolean {
        return this._options.draggable && target.tagName !== 'INPUT';
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    static _theme: string[] = ['Controls/popupTemplate'];
    static getDefaultOptions(): IDialogTemplateOptions {
        return {
            headingFontColorStyle: 'secondary',
            headerBackgroundStyle: 'default',
            backgroundStyle: 'default',
            headingFontSize: '3xl',
            closeButtonVisibility: true,
            closeButtonViewMode: 'toolButton',
            closeButtonTransparent: true
        };
    }
}

/**
 * @name Controls/_popupTemplate/Dialog#draggable
 * @cfg {Boolean} Определяет, может ли окно перемещаться с помощью <a href='/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/'>d'n'd</a>.
 * @default false
 */

/**
 * @name Controls/_popupTemplate/Dialog#headerBackgroundStyle
 * @cfg {String} Определяет цвет фона шапки диалогового окна.
 * @variant default
 * @variant unaccented
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/headerBackgroundStyle/Index
 * @remark Данная опция определяет префикс стиля для настройки фона шапки диалогового окна.
 * На шапку будет установлен класс **.controls-DialogTemplate&#95;&#95;top-area&#95;@{headerBackgroundStyle}&#95;theme&#95;@{themeName}**, который следует определить у себя в стилях.
 */

/**
 * @name Controls/_popupTemplate/Dialog#backgroundStyle
 * @cfg {String} Определяет цвет фона диалогового окна.
 * @variant default
 * @variant unaccented
 * @default default
 * @demo Controls-demo/PopupTemplate/Dialog/backgroundStyle/Index
 * @remark Данная опция определяет префикс стиля для настройки фона диалогового окна.
 * На шаблон будет установлен класс **.controls-DialogTemplate&#95;backgroundStyle-@{headerBackgroundStyle}&#95;theme&#95;@{themeName}**, который следует определить у себя в стилях.
 */

export default DialogTemplate;
