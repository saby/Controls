import Control = require('Core/Control');
import template = require('wml!Controls/_scroll/StickyHeader/Controller/Controller');
import {TRegisterEventData} from './Utils';
import StickyHeader from 'Controls/_scroll/StickyHeader/_StickyHeader';
import {POSITION} from 'Controls/_scroll/StickyHeader/Utils';

// @ts-ignore

const CONTENTS_STYLE: string = 'contents';

interface IShadowVisible {
    [id: number]: boolean;
}

class Component extends Control {
    protected _template: Function = template;

    // Register of all registered headers. Stores references to instances of headers.
    private _headers: object;
    // Ordered list of headers.
    private _headersStack: object;
    // The list of headers that are stuck at the moment.
    private _fixedHeadersStack: object;
    private _shadowVisibleStack: {
        top: IShadowVisible,
        bottom: IShadowVisible
    };
    // Если созданный заголвок невидим, то мы не можем посчитать его позицию.
    // Учтем эти заголовки после ближайшего события ресайза.
    private _delayedHeaders: TRegisterEventData[] = [];
    private _stickyControllerMounted = false;

    _beforeMount(options) {
        this._headersStack = {
            top: [],
            bottom: []
        };
        this._fixedHeadersStack = {
            top: [],
            bottom: []
        };
        this._shadowVisibleStack = {
            top: {},
            bottom: {}
        };
        this._headers = {};
    }

    _afterMount(options) {
        this._stickyControllerMounted = true;
        this._registerDelayed();
    }

    /**
     * Returns the tru if there is at least one fixed header.
     * @param position
     */
    hasFixed(position: string): boolean {
        return !!this._fixedHeadersStack[position].length;
    }

    hasShadowVisible(position: string): boolean {
        const arrShadowVisible = this._shadowVisibleStack[position];
        for (const id in arrShadowVisible) {
            if (arrShadowVisible[id]) {
                return true;
            }
        }

        return false;
    }

    getHeadersHeight(position: string): number {
        let
            height: number = 0,
            replaceableHeight: number = 0,
            header;
        for (let headerId of this._fixedHeadersStack[position]) {
            const ignoreHeight: boolean = !this._shadowVisibleStack[position][headerId];
            if (ignoreHeight) {
                continue;
            }
            header = this._headers[headerId];
            // If the header is "replaceable", we take into account the last one after all "stackable" headers.
            if (header.mode === 'stackable') {
                if (header.fixedInitially) {
                    height += header.inst.height;
                }
                replaceableHeight = 0;
            } else if (header.mode === 'replaceable') {
                replaceableHeight = header.inst.height;
            }
        }
        return height + replaceableHeight;
    }

    _stickyRegisterHandler(event, data: TRegisterEventData, register: boolean): void {
        this._register(data, register, true);
        this._clearOffsetCache();
        event.stopImmediatePropagation();
    }

    _register(data: TRegisterEventData, register: boolean, update: boolean): void {
        if (register) {
            this._headers[data.id] = {
                ...data,
                fixedInitially: false,
                offset: {}
            };
            // Если контрол невидимый или еще не замонтирован, то отложим регистрацию заголовков.
            // Невидимые заголовки мы не можем обсчитать, нельзя узнать их размеры. Обсчитаем их по событию ресайза.
            // Дети монтируются раньше родителей, и в скролируемой области может быть несколько заголовков.
            // Запускать рассчет положения заголвоков при каждой регистрации заголовка дорого.
            // Обсчитаем все зафиксированные заголовки за один проход после того как контроллер замонтировался
            // (все внутрение заголовки зарегистрировались).
            if (Component._isVisible(data.container) && this._stickyControllerMounted) {
                this._addToHeadersStack(data.id, data.position);
                if (update) {
                    this._updateFixedInitially('top');
                    this._updateFixedInitially('bottom');
                    this._updateTopBottom();
                }
            } else {
                this._delayedHeaders.push(data);
            }

        } else {
            delete this._headers[data.id];
            this._removeFromHeadersStack(data.id, data.position);
        }
    }

    /**
     * @param {Vdom/Vdom:SyntheticEvent} event
     * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} fixedHeaderData
     * @private
     */
    _fixedHandler(event, fixedHeaderData) {
        event.stopImmediatePropagation();
        this._updateFixationState(fixedHeaderData);
        if (fixedHeaderData.fixedPosition) {
            this._shadowVisibleStack[fixedHeaderData.fixedPosition][fixedHeaderData.id] = fixedHeaderData.shadowVisible;
        } else if (fixedHeaderData.prevPosition) {
            delete this._shadowVisibleStack[fixedHeaderData.prevPosition][fixedHeaderData.id];
        }
        this._notify('fixed', [this.getHeadersHeight('top'), this.getHeadersHeight('bottom')]);

        // If the header is single, then it makes no sense to send notifications.
        // Thus, we prevent unnecessary force updates on receiving messages.
        if (fixedHeaderData.fixedPosition && this._fixedHeadersStack[fixedHeaderData.fixedPosition].length === 1) {
            return;
        }
        this._children.stickyHeaderShadow.start([
            this._fixedHeadersStack.top[this._fixedHeadersStack.top.length - 1],
            this._fixedHeadersStack.bottom[this._fixedHeadersStack.bottom.length - 1]
        ]);
    }

    _updateTopBottomHandler(event: Event): void {
        event.stopImmediatePropagation();

        this._updateTopBottom();
    }

    _resizeHandler() {
        // Игнорируем все собятия ресайза до _afterMount.
        // В любом случае в _afterMount мы попробуем рассчитать положение заголовков.
        if (this._stickyControllerMounted) {
            this._updateTopBottom();
            this._registerDelayed();
        }
    }

    _registerDelayed() {
        const delayedHeadersCount = this._delayedHeaders.length;

        if (!delayedHeadersCount) {
            return;
        }

        this._delayedHeaders = this._delayedHeaders.filter((header: TRegisterEventData) => {
            if (Component._isVisible(header.container)) {
                // Регистрируем заголовок, но не обновляем его положение,
                // сделаем это после того как зарегистрируем все заголовки.
                this._register(header, true, false);
                return false;
            }
            return true;
        });

        if (delayedHeadersCount !== this._delayedHeaders.length) {
            this._updateFixedInitially('top');
            this._updateFixedInitially('bottom');
            this._updateTopBottom();
            this._clearOffsetCache();
        }
    }

    /**
     * Update information about the fixation state.
     * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} data Data about the header that changed the fixation state.
     */
    private _updateFixationState(data: TRegisterEventData) {
        if (!!data.fixedPosition) {
            this._fixedHeadersStack[data.fixedPosition].push(data.id);
        }
        if (!!data.prevPosition && this._fixedHeadersStack[data.prevPosition].indexOf(data.id) !== -1) {
            this._fixedHeadersStack[data.prevPosition].splice(this._fixedHeadersStack[data.prevPosition].indexOf(data.id), 1);
        }
    }

    /**
     * Возвращает смещение заголовка относительно контейнера контроллера.
     * Кэширует вычисленные положения заголовков чтобы не вычислять их повторно. Несмотря на то, что мы не вносим
     * изменений в дом дерево, вызовы getBoundingClientRect выполняются достаточно долго.
     * После всех рассчетов необходимо вызывать _clearOffsetCache, что бы очистить кэш.
     * @param id
     * @param position
     * @private
     */
    private _getHeaderOffset(id: number, position: string) {
        const header = this._headers[id];
        if (header.offset[position] === undefined) {
            header.offset[position] = header.inst.getOffset(this._container, position);
        }
        return header.offset[position];
    }

    /**
     * Очищает кэш вычисленных смещений заголовков относительно контроллера.
     * @private
     */
    private _clearOffsetCache() {
        for (let headerId: number in this._headers) {
            this._headers[headerId].offset = {};
        }
    }

    private _addToHeadersStack(id: number, position: string) {
        if (position === 'topbottom') {
            this._addToHeadersStack(id, 'top');
            this._addToHeadersStack(id, 'bottom');
            return;
        }
        //TODO https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        const container = (this._container && this._container.get) ? this._container.get(0) : this._container,
            headersStack = this._headersStack[position],
            offset = this._getHeaderOffset(id, position);

        // We are looking for the position of the first element whose offset is greater than the current one.
        // Insert a new header at this position.
        let index = headersStack.findIndex((headerId) => {
            const headerInst = this._headers[headerId].inst;
            return this._getHeaderOffset(headerId, position) > offset;
        });
        index = index === -1 ? headersStack.length : index;
        headersStack.splice(index, 0, id);
    }

    private _updateFixedInitially(position: POSITION): void {
        const
            container: HTMLElement = this._container,
            headersStack: number[] = this._headersStack[position];

        let
            headersHeight: number = 0,
            headerInst: StickyHeader;

        if ((position === 'top' && !container.scrollTop) ||
            (position === 'bottom' && container.scrollTop + container.clientHeight >= container.scrollHeight)) {
            for (let headerId: number of headersStack) {
                headerInst = this._headers[headerId].inst;
                if (headersHeight === this._getHeaderOffset(headerId, position)) {
                    this._headers[headerId].fixedInitially = true;
                }
                headersHeight += headerInst.height;
            }
        }
    }

    private _removeFromHeadersStack(id: number, position: string) {
        var index = this._headersStack['top'].indexOf(id);
        if (index !== -1) {
            this._headersStack['top'].splice(index, 1);
        }
        index = this._headersStack['bottom'].indexOf(id);
        if (index !== -1) {
            this._headersStack['bottom'].splice(index, 1);
        }

        this._updateTopBottom();
    }

    private _updateTopBottom() {
        let offset = 0,
            header;
        for (let headerId of this._headersStack['top']) {
            header = this._headers[headerId];
            header.inst.top = offset;
            if (header.mode === 'stackable' && Component._isVisible(header.container)) {
                offset += header.inst.height;
            }
        }
        offset = 0;
        for (let headerId of this._headersStack['bottom']) {
            header = this._headers[headerId];
            header.inst.bottom = offset;
            if (header.mode === 'stackable' && Component._isVisible(header.container)) {
                offset += header.inst.height;
            }
        }
    }

    static _isVisible(element: HTMLElement): boolean {
        if (element.offsetParent !== null) {
            return true;
        } else {
            const styles = getComputedStyle(element);
            if (styles.display === CONTENTS_STYLE) {
                return Component._isVisible(element.parentElement);
            }
        }
        return false;
    }
}

export default Component;
