import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_masterDetail/Base/Base';
import 'css!theme?Controls/masterDetail';
import {debounce} from 'Types/function';
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import {IPropStorage, IPropStorageOptions} from 'Controls/interface';

/**
 * Контрол, который обеспечивает связь между двумя контролами для отображения подробной информации по выбранному элементу.
 * Подробное описание и инструкцию по настройке читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/layout/master-detail/'>здесь</a>.
 * @class Controls/_masterDetail/Base
 * @extends Core/Control
 * @mixes Controls/_masterDetail/List/Styles
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
 * @mixes Controls/_masterDetail/List/Styles
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

    protected _template: TemplateFunction = template;
    protected _selected: boolean|null;
    protected _canResizing: boolean = false;
    protected _minOffset: number;
    protected _maxOffset: number;
    protected _currentWidth: string;
    protected _containerWidth: number;
    protected _updateOffsetDebounced: Function;

    protected _beforeMount(options: IMasterDetail, context: object, receivedState: number): Promise<number> | void {
        this._updateOffsetDebounced = debounce(this._updateOffset.bind(this), RESIZE_DELAY);
        this._canResizing = this._isCanResizing(options);
        if (receivedState) {
            this._currentWidth = receivedState + 'px';
        } else if (options.propStorageId) {
            return new Promise((resolve) => {
                getSettings([options.propStorageId]).then((storage) => {
                    const width = storage && storage[options.propStorageId];
                    if (width) {
                        this._currentWidth = width + 'px';
                    } else {
                        this.initCurrentWidth(options.masterWidth);
                    }
                    resolve(width);
                });
            });
        } else {
            this.initCurrentWidth(options.masterWidth);
        }
    }

    private initCurrentWidth(width: string|number): void {
        if (this._isPercentValue(width)) {
            this._currentWidth = String(width);
        } else if (width) {
            this._currentWidth = width + 'px';
        }
    }

    protected _afterMount(options: IMasterDetail): void {
        if (this._isPercentValue(options.masterWidth)) {
            this._updateOffset(options);
        }
    }

    protected _beforeUpdate(options: IMasterDetail): void {
        if (options.masterMinWidth !== this._options.masterMinWidth ||
            options.masterWidth !== this._options.masterWidth ||
            options.masterMaxWidth !== this._options.masterMaxWidth) {
            this._currentWidth = null;
            this._canResizing = this._isCanResizing(options);
            this._updateOffset(options);
        }
    }

    private _selectedMasterValueChangedHandler(event: Event, value: boolean): void {
        this._selected = value;
        event.stopPropagation();
    }

    private _updateOffset(options: IMasterDetail): void {
        if (options.masterWidth && options.masterMaxWidth && options.masterMinWidth) {
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

    private _offsetHandler(event: Event, offset: number): void {
        if (offset !== 0) {
            const width = parseInt(this._currentWidth, 10) + offset;
            this._currentWidth = width + 'px';
            this._updateOffset(this._options);
            const propStorageId = this._options.propStorageId;
            if (propStorageId) {
                setSettings({[propStorageId]: width});
            }
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
            // FIXME: https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
            const container = this._container;
            this._containerWidth = container.getBoundingClientRect().width;
        }
        return this._containerWidth;
    }

    private _resizeHandler(): void {
        this._containerWidth = null;
        this._updateOffsetDebounced(this._options);
    }
}

export default Base;
