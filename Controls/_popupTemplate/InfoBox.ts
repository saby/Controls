import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/InfoBox/InfoBox');
import {IStickyPopupPosition, TVertical, THorizontal} from './Sticky/StickyController';
import {ValidationStatus, IValidationStatus, IValidationStatusOptions} from 'Controls/interface';

/**
 * Базовый шаблон {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/infobox/ всплывающей подсказки}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/openers/infobox/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less">переменные тем оформления</a>
 * 
 * @class Controls/_popupTemplate/InfoBox
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @mixes Controls/_interface/IValidationStatus
 */

type TArrowPosition = 'start' | 'end' | 'center';
type TStyle = 'danger' | 'secondary' | 'warning' | 'success' | 'info' | 'primary' | 'unaccented' | ValidationStatus;

export interface IInfoboxTemplateOptions extends IControlOptions, IValidationStatusOptions {
    stickyPosition?: IStickyPopupPosition;
    template?: TemplateFunction;
    templateOptions?: object;
    style: TStyle;
    floatCloseButton?: boolean;
    closeButtonVisibility: boolean;
}

export default class InfoboxTemplate extends Control<IInfoboxTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _arrowSide: THorizontal | TVertical;
    protected _arrowPosition: TArrowPosition;
    protected _borderStyle: TStyle;
    protected _beforeMount(newOptions: IInfoboxTemplateOptions): void {
        this._setPositionSide(newOptions.stickyPosition);
        this._borderStyle = this._setBorderStyle(newOptions.style, newOptions.validationStatus);
    }

    protected _beforeUpdate(newOptions: IInfoboxTemplateOptions): void {
        this._setPositionSide(newOptions.stickyPosition);
        this._borderStyle = this._setBorderStyle(newOptions.style, newOptions.validationStatus);
    }
    _setPositionSide(stickyPosition: IStickyPopupPosition): void {
        if (stickyPosition.direction.horizontal === 'left' && stickyPosition.targetPoint.horizontal === 'left') {
            this._arrowSide = 'right';
            this._arrowPosition = this._getArrowPosition(stickyPosition.direction.vertical);
        } else if (stickyPosition.direction.horizontal === 'right' && stickyPosition.targetPoint.horizontal === 'right') {
            this._arrowSide = 'left';
            this._arrowPosition = this._getArrowPosition(stickyPosition.direction.vertical);
        } else if (stickyPosition.direction.vertical === 'top' && stickyPosition.targetPoint.vertical === 'top') {
            this._arrowSide = 'bottom';
            this._arrowPosition = this._getArrowPosition(stickyPosition.direction.horizontal);
        } else if (stickyPosition.direction.vertical === 'bottom' && stickyPosition.targetPoint.vertical === 'bottom') {
            this._arrowSide = 'top';
            this._arrowPosition = this._getArrowPosition(stickyPosition.direction.horizontal);
        }
    }

    private _getArrowPosition(side: TVertical | THorizontal): TArrowPosition {
        if (side === 'left' || side === 'top') {
            return 'end';
        }
        if (side === 'right' || side === 'bottom') {
            return 'start';
        }
        return 'center';
    }

    private _setBorderStyle(style: TStyle, validationStatus: ValidationStatus): TStyle {
        if (validationStatus !== 'valid') {
            return validationStatus;
        } else {
            return style;
        }
    }

    protected _close(): void {
        this._notify('close', [], { bubbling: true });
    }

    static getDefaultOptions(): IInfoboxTemplateOptions {
        return {
            closeButtonVisibility: true,
            validationStatus: 'valid',
            style: 'secondary'
        };
    }

    static _theme: string[] = ['Controls/popupTemplate'];
}

/**
 * @name Controls/_popupTemplate/InfoBox#closeButtonVisibility
 * @cfg {Boolean} Устанавливает видимость кнопки для всплывающей подсказки.
 * @default true
 */
/**
 * @name Controls/_popupTemplate/InfoBox#style
 * @cfg {String} Устанавливает стиль отображения всплывающей подсказки.
 * @default secondary
 * @variant warning
 * @variant secondary
 * @variant success
 * @variant danger
 * @default secondary
 */
/**
 * @name Controls/_popupTemplate/InfoBox#stickyPosition
 * @cfg {StickyPosition} Содержит сведения о позиционировании всплывающей подсказки.
 * @remark
 * При открытии всплывающей подсказки с помощью {@link Controls/popup:Sticky}, в шаблон передаётся значение для опции stickyPosition.
 * Его рекомендуется использовать для конфигурации Controls/popupTemplate:InfoBox, что и показано в следующем примере.
 * <pre>
 * <Controls.popupTemplate:InfoBox stickyPosition="{{_options.stickyPosition}}" />
 * </pre>
 * Значение опции задавать вручную не нужно.
 */
/**
 * @typedef {Object} StickyPosition
 * @description Позиционирование всплывающей подсказки.
 * @property {TargetPoint} targetPoint Точка позиционирования относительно вызывающего элемента.
 * @property {Direction} direction Выравнивание относительно точки позиционирования.
 */

/**
 * @typedef {Object} TargetPoint
 * @description Точка позиционирования всплывающей подсказки относительно вызывающего элемента.
 * @property {String} vertical Выравнивание по вертикали.
 * Доступные значения: top, bottom.
 * @property {String} horizontal Выравнивание по горизонтали.
 * Доступные значения: right, left.
 */

/**
 * @typedef {Object} Direction
 * @description Выравнивание всплывающей подсказки относительно точки позиционирования.
 * @property {String} vertical Выравнивание по вертикали.
 * Доступные значения: top, bottom.
 * @property {String} horizontal Выравнивание по горизонтали.
 * Доступные значения: right, left.
 */

/**
 * @name Controls/_popupTemplate/InfoBox#content
 * @cfg {function|String} Шаблон, который будет отображать всплывающая подсказка.
 */
