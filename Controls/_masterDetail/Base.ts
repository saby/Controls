import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_masterDetail/Base/Base';
import {debounce} from 'Types/function';
import { SyntheticEvent } from 'Vdom/Vdom';
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import {IPropStorageOptions} from 'Controls/interface';

/**
 * Контрол, который обеспечивает связь между двумя контролами для отображения подробной информации по выбранному элементу.
 * Подробное описание и инструкцию по настройке читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout/master-detail/'>здесь</a>.
 * @class Controls/_masterDetail/Base
 * @extends Core/Control
 * @mixes Controls/_interface/IPropStorage
 * @control
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/MasterDetail/Demo
 */

/*
 * Control that allows to implement the Master-Detail interface
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/master-detail/'>here</a>.
 * @class Controls/_masterDetail/Base
 * @extends Core/Control
 * @control
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/MasterDetail/Demo
 */
const RESIZE_DELAY = 50;

interface IMasterDetail extends IControlOptions, IPropStorageOptions {
    master: TemplateFunction;
    detail: TemplateFunction;
    masterWidth: number|string;
    masterMinWidth: number|string;
    masterMaxWidth: number|string;
    contrastBackground: boolean;
}

class Base extends Control<IMasterDetail> {
    /**
     * @name Controls/_masterDetail/Base#master
     * @cfg {Function} Задает шаблон контента master.
     */

    /*
     * @name Controls/_masterDetail/Base#master
     * @cfg {Function} Master content template
     */

    /**
     * @name Controls/_masterDetail/Base#detail
     * @cfg {Function} Задает шаблон контента detail.
     */

    /*
     * @name Controls/_masterDetail/Base#detail
     * @cfg {Function} Detail content template
     */

    /**
     * @name Controls/_masterDetail/Base#masterWidth
     * @cfg {Number|String} Ширина контентной области {@link master} при построении контрола.
     * Значение можно задавать как в пикселях, так и в процентах.
     */

    /**
     * @name Controls/_masterDetail/Base#masterMinWidth
     * @cfg {Number|String} Минимальная ширина контентной области до которой может быть уменьшена ширина {@link master}.
     * Значение можно задавать как в пикселях, так и в процентах.
     */

    /**
     * @name Controls/_masterDetail/Base#masterMaxWidth
     * @cfg {Number|String} Максимальная ширина контентной области до которой может быть увеличена ширина {@link master}
     * Значение можно задавать как в пикселях, так и в процентах.
     */

    /**
     * @name Controls/_interface/IPropStorage#propStorageId
     * @cfg {String} Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     * С помощью этой опции включается функционал движения границ.
     * Помимо propStorageId необходимо задать опции {@link masterWidth}, {@link masterMinWidth}, {@link masterMaxWidth}.
     */

    /**
     * @name Controls/_masterDetail/Base#contrastBackground
     * @cfg {Boolean} Определяет контрастность фона контента detail по отношению к контенту master.
     * @default true
     * @remark
     * * true - контрастный фон.
     * * false - фон, гармонично сочетающийся с окружением.
     */

    protected _template: TemplateFunction = template;
    protected _selected: boolean|null;
    protected _canResizing: boolean = false;
    protected _minOffset: number;
    protected _maxOffset: number;
    protected _prevCurrentWidth: string;
    protected _currentWidth: string;
    protected _currentMaxWidth: string;
    protected _currentMinWidth: string;
    protected _containerWidth: number;
    protected _updateOffsetDebounced: Function;

    protected _beforeMount(options: IMasterDetail, context: object, receivedState: string): Promise<number> | void {
        this._updateOffsetDebounced = debounce(this._updateOffsetDebounced.bind(this), RESIZE_DELAY);
        this._canResizing = this._isCanResizing(options);
        this._prepareLimitSizes(options);
        if (receivedState) {
            this._currentWidth = receivedState;
        } else if (options.propStorageId) {
            return new Promise((resolve) => {
                this._getSettings(options).then((storage) => {
                    const width = storage && storage[options.propStorageId];
                    if (width) {
                        this._currentWidth = width + 'px';
                        this._updateOffset(options);
                    } else {
                        this.initCurrentWidth(options.masterWidth);
                    }
                    this._prepareLimitSizes(options);
                    resolve(this._currentWidth);
                });
            });
        } else {
            this.initCurrentWidth(options.masterWidth);
        }
    }

    private _getSettings(options: IMasterDetail): Promise<object> {
        return getSettings([options.propStorageId]);
    }

    private _setSettings(width: number): void {
        const propStorageId = this._options.propStorageId;
        if (propStorageId) {
            setSettings({[propStorageId]: width});
        }
    }

    private _prepareLimitSizes(options: IMasterDetail): void {
        // Если _currentWidth задан в процентах, а minWidth и maxWidth в пикселях, может получиться ситуация, что
        // _currentWidth больше допустимого значения. Узнаем мы это только на клиенте, когда будут размеры контрола.
        // Чтобы верстка визуально не прыгала после оживления, вешаю minWidth и maxWidth сразу на контейнер мастера.
        if (this._isPercentValue(options.masterMaxWidth)) {
            this._currentMaxWidth = options.masterMaxWidth as string;
        } else if (options.masterMaxWidth !== undefined) {
            this._currentMaxWidth = `${options.masterMaxWidth}px`;
        }

        if (this._isPercentValue(options.masterMinWidth)) {
            this._currentMinWidth = options.masterMinWidth as string;
        } else if (options.masterMinWidth !== undefined) {
            this._currentMinWidth = `${options.masterMinWidth}px`;
        }
    }

    private initCurrentWidth(width: string|number): void {
        if (this._isPercentValue(width)) {
            this._currentWidth = String(width);
        } else if (width !== undefined) {
            this._currentWidth = width + 'px';
        }
    }

    private _updateOffsetDebounced(): void {
        this._updateOffset(this._options);
    }

    protected _afterMount(options: IMasterDetail): void {
        this._prevCurrentWidth = this._currentWidth;
        if (this._canResizing) {
            this._updateOffset(options);
        }
    }

    protected _beforeUpdate(options: IMasterDetail): void {
        // Если изменилась текущая ширина, то сбросим состояние, иначе работаем с тем, что выставил пользователь
        if (options.masterWidth !== this._options.masterWidth) {
            this._currentWidth = null;
        }

        if (this._isSizeOptionsChanged(options, this._options)) {
            this._canResizing = this._isCanResizing(options);
            this._prepareLimitSizes(options);
            this._updateOffset(options);
        }
    }

    protected _afterRender(): void {
        if (this._prevCurrentWidth !== this._currentWidth) {
            this._prevCurrentWidth = this._currentWidth;
            this._startResizeRegister();
            this._setSettings(parseInt(this._currentWidth, 10));
        }
    }

    private _startResizeRegister(): void {
        const eventCfg = {
            type: 'controlResize',
            target: this._container,
            _bubbling: true
        };
        // https://online.sbis.ru/opendoc.html?guid=8aa1c2d6-f471-4a7e-971f-6ff9bfe72079
        this._children.resizeDetectMaster.start(new SyntheticEvent(null, eventCfg));
        this._children.resizeDetectDetail.start(new SyntheticEvent(null, eventCfg));
    }

    private _isSizeOptionsChanged(oldOptions: IMasterDetail, newOptions: IMasterDetail): boolean {
        return oldOptions.masterMinWidth !== newOptions.masterMinWidth ||
            oldOptions.masterWidth !== newOptions.masterWidth ||
            oldOptions.masterMaxWidth !== newOptions.masterMaxWidth;
    }

    protected _selectedMasterValueChangedHandler(event: Event, value: boolean): void {
        this._selected = value;
        event.stopPropagation();
    }

    private _updateOffset(options: IMasterDetail): void {
        if (options.masterWidth !== undefined &&
            options.masterMaxWidth !== undefined &&
            options.masterMinWidth !== undefined) {
            let currentWidth = this._getOffsetValue(this._currentWidth || options.masterWidth);
            this._currentWidth = currentWidth + 'px';
            this._maxOffset = this._getOffsetValue(options.masterMaxWidth) - currentWidth;
            // Protect against window resize
            if (this._maxOffset < 0) {
                currentWidth += this._maxOffset;
                this._maxOffset = 0;
            }
            this._minOffset = currentWidth - this._getOffsetValue(options.masterMinWidth);
            // Protect against window resize
            if (this._minOffset < 0) {
                currentWidth -= this._minOffset;
                this._minOffset = 0;
            }
            this._currentWidth = currentWidth + 'px';
        }
    }

    private _isCanResizing(options: IMasterDetail): boolean {
        const canResizing = options.masterWidth && options.masterMaxWidth && options.masterMinWidth &&
            options.masterMaxWidth !== options.masterMinWidth;
        return !!canResizing;
    }

    protected _offsetHandler(event: Event, offset: number): void {
        if (offset !== 0) {
            const width = parseInt(this._currentWidth, 10) + offset;
            this._currentWidth = width + 'px';
            this._updateOffset(this._options);
        }
    }

    private _isPercentValue(value: string|number): boolean {
        return `${value}`.includes('%');
    }

    private _getOffsetValue(value: string|number): number {
        const MaxPercent: number = 100;
        const intValue: number = parseInt(String(value), 10);
        if (!this._isPercentValue(value)) {
            return intValue;
        }
        return Math.round(this._getContainerWidth() * intValue / MaxPercent);
    }

    private _getContainerWidth(): number {
        if (!this._containerWidth) {
            this._containerWidth = this._container ? this._container.getBoundingClientRect().width : 0;
        }
        return this._containerWidth;
    }

    protected _resizeHandler(): void {
        // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
        // Не запускаем реакцию на ресайз, если контрол скрыт (к примеру лежит внутри скпытой области switchableArea)
        if (!this._container.closest('.ws-hidden')) {
            this._containerWidth = null;
            this._updateOffsetDebounced(this._options);
            // Нужно чтобы лисенеры, лежащие внутри нашего регистратора, реагировали на ресайз страницы.
            // Код можно будет убрать, если в регистраторах дадут возможность не стопать событие регистрации лисенера,
            // чтобы лисенер мог регистрироваться в 2х регистраторах.
            this._startResizeRegister();
        }
    }

    static _theme: string[] = ['Controls/masterDetail'];

    static getDefaultOptions(): Partial<IMasterDetail> {
        return {
            contrastBackground: true
        };
    }
}

export default Base;
