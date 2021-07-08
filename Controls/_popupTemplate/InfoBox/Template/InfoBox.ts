import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/InfoBox/Template/InfoBox';
import {TVertical, THorizontal} from 'Controls/_popupTemplate/Sticky/StickyController';
import {IStickyPopupPosition} from 'Controls/popup';
import {ValidationStatus, IValidationStatusOptions} from 'Controls/interface';
import 'css!Controls/popupTemplate';

type TArrowPosition = 'start' | 'end' | 'center';
type TStyle = 'danger' | 'secondary' | 'warning' | 'success' | 'info' | 'primary' | 'unaccented' | ValidationStatus;

export interface IInfoboxTemplateOptions extends IControlOptions, IValidationStatusOptions {
    stickyPosition?: IStickyPopupPosition;
    template?: TemplateFunction | string;
    templateOptions?: object;
    style: TStyle;
    floatCloseButton?: boolean;
    closeButtonVisibility: boolean;
}
/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/infobox/ всплывающей подсказки}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/infobox/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/InfoBox
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @mixes Controls/interface:IValidationStatus
 * @demo Controls-demo/PopupTemplate/Infobox/Index
 */
export default class InfoboxTemplate extends Control<IInfoboxTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _arrowSide: THorizontal | TVertical;
    protected _arrowPosition: TArrowPosition;
    protected _borderStyle: TStyle;
    protected _beforeMount(newOptions: IInfoboxTemplateOptions): void {
        this._setPositionSide(newOptions.stickyPosition);
        this._borderStyle = InfoboxTemplate._setBorderStyle(newOptions.style, newOptions.validationStatus);
    }

    protected _beforeUpdate(newOptions: IInfoboxTemplateOptions): void {
        this._setPositionSide(newOptions.stickyPosition);
        this._borderStyle = InfoboxTemplate._setBorderStyle(newOptions.style, newOptions.validationStatus);
    }
    _setPositionSide(stickyPosition: IStickyPopupPosition): void {
        const {direction} = stickyPosition;
        if (direction.horizontal === 'left' && stickyPosition.targetPoint.horizontal === 'left') {
            this._arrowSide = 'right';
            this._arrowPosition = InfoboxTemplate._getArrowPosition(direction.vertical);
        } else if (direction.horizontal === 'right' && stickyPosition.targetPoint.horizontal === 'right') {
            this._arrowSide = 'left';
            this._arrowPosition = InfoboxTemplate._getArrowPosition(direction.vertical);
        } else if (direction.vertical === 'top' && stickyPosition.targetPoint.vertical === 'top') {
            this._arrowSide = 'bottom';
            this._arrowPosition = InfoboxTemplate._getArrowPosition(direction.horizontal);
        } else if (direction.vertical === 'bottom' && stickyPosition.targetPoint.vertical === 'bottom') {
            this._arrowSide = 'top';
            this._arrowPosition = InfoboxTemplate._getArrowPosition(direction.horizontal);
        }
    }

    protected _close(): void {
        this._notify('close', [], { bubbling: true });
    }

    private static _getArrowPosition(side: TVertical | THorizontal): TArrowPosition {
        if (side === 'left' || side === 'top') {
            return 'end';
        }
        if (side === 'right' || side === 'bottom') {
            return 'start';
        }
        return 'center';
    }

    private static _setBorderStyle(style: TStyle, validationStatus: ValidationStatus): TStyle {
        if (validationStatus !== 'valid') {
            return validationStatus;
        } else {
            return style;
        }
    }

    static getDefaultOptions(): IInfoboxTemplateOptions {
        return {
            closeButtonVisibility: true,
            validationStatus: 'valid',
            style: 'secondary'
        };
    }
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
 * @variant info
 * @variant unaccented
 * @variant secondary
 * @variant success
 * @variant danger
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

Object.defineProperty(InfoboxTemplate, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return InfoboxTemplate.getDefaultOptions();
   }
});
