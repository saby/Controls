import Control = require('Core/Control');
import template = require('wml!Controls/_scroll/StickyHeader/Controller/Controller');
import {debounce} from 'Types/function';
import {IFixedEventData, isHidden, POSITION, TRegisterEventData, TYPE_FIXED_HEADERS} from './Utils';
import StickyHeader, {SHADOW_VISIBILITY} from 'Controls/_scroll/StickyHeader/_StickyHeader';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import fastUpdate from './FastUpdate';
import StickyHeaderResizeObserver from './Utils/StickyHeaderResizeObserver';
import {detection} from 'Env/Env';

// @ts-ignore

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
    // Если созданный заголвок невидим, то мы не можем посчитать его позицию.
    // Учтем эти заголовки после ближайшего события ресайза.
    private _delayedHeaders: TRegisterEventData[] = [];
    private _stickyControllerMounted: boolean = false;
    private _updateTopBottomInitialized: boolean = false;
    private _stickyHeaderObserver: StickyHeaderResizeObserver;

    _beforeMount(options) {
        this._headersStack = {
            top: [],
            bottom: []
        };
        this._fixedHeadersStack = {
            top: [],
            bottom: []
        };
        this._headers = {};
        this._resizeHandlerDebounced = debounce(this._resizeHandler.bind(this), 50);
        this._stickyHeaderObserver = new StickyHeaderResizeObserver(this);
    }

    _afterMount(options) {
        this._stickyControllerMounted = true;
        this._stickyHeaderObserver.initialize();
        this._registerDelayed();
    }

    _beforeUnmount(): void {
        this._stickyHeaderObserver.terminate();
    }

    /**
     * Returns the true if there is at least one fixed header.
     * @param position
     */
    hasFixed(position: POSITION): boolean {
        return !!this._fixedHeadersStack[position].length;
    }

    hasShadowVisible(position: POSITION): boolean {
        const fixedHeaders = this._fixedHeadersStack[position];
        for (const id of fixedHeaders) {
            if (this._headers[id].inst.shadowVisibility === SHADOW_VISIBILITY.visible) {
                return true;
            }
        }

        return false;
    }

    /**
     * Возвращает высоты заголовков.
     * @function
     * @param {POSITION} [position] Высоты заголовков сверху/снизу
     * @param {TYPE_FIXED_HEADERS} [type]
     * @returns {Number}
     */
    getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
        // type, предпологается, в будущем будет иметь еще одно значение, при котором будет высчитываться
        // высота всех зафиксированных на текущий момент заголовков.
        let
            height: number = 0,
            replaceableHeight: number = 0,
            header;
        const headers = type === TYPE_FIXED_HEADERS.allFixed ? this._headersStack : this._fixedHeadersStack;
        for (let headerId of headers[position]) {
            header = this._headers[headerId];

            const ignoreHeight: boolean = type === TYPE_FIXED_HEADERS.initialFixed &&
                (!header || header.inst.shadowVisibility === SHADOW_VISIBILITY.hidden);
            if (ignoreHeight) {
                continue;
            }

            // If the header is "replaceable", we take into account the last one after all "stackable" headers.
            if (header.mode === 'stackable') {
                if (header.fixedInitially || type === TYPE_FIXED_HEADERS.allFixed) {
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
        const promise = this._register(data, register, true);
        this._clearOffsetCache();
        event.stopImmediatePropagation();
        return promise;
    }

    _register(data: TRegisterEventData, register: boolean, update: boolean): void {
        if (register) {
            this._headers[data.id] = {
                ...data,
                fixedInitially: false,
                offset: {}
            };

            // Проблема в том, что чтобы узнать положение заголовка нам надо снять position: sticky.
            // Это приводит к layout. И так для каждого заголовка. Создадим список всех заголовков
            // которые надо обсчитать в этом синхронном участке кода и обсчитаем их за раз в микротаске,
            // один раз сняв со всех загоовков position: sticky. Если контроллер не видим, или еще не замонтирован,
            // то положение заголовков рассчитается по событию ресайза или в хуке _afterMount.
            // Невидимые заголовки нельзя обсчитать, потому что нельзя узнать их размеры и положение.
            this._delayedHeaders.push(data);

            if (!isHidden(data.container) && this._stickyControllerMounted) {
                return Promise.resolve().then(this._registerDelayed.bind(this));
            }
            this._stickyHeaderObserver.observe(data.container);
        } else {
            this._stickyHeaderObserver.unobserve(this._headers[data.id].container);
            delete this._headers[data.id];
            this._removeFromHeadersStack(data.id, data.position);
            this._removeFromDelayedStack(data.id);
        }
        return Promise.resolve();
    }

    /**
     * @param {Vdom/Vdom:SyntheticEvent} event
     * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} fixedHeaderData
     * @private
     */
    _fixedHandler(event, fixedHeaderData: IFixedEventData) {
        event.stopImmediatePropagation();
        const isFixationUpdated = this._updateFixationState(fixedHeaderData);
        this._notify('fixed', [this.getHeadersHeight(POSITION.top, TYPE_FIXED_HEADERS.initialFixed), this.getHeadersHeight(POSITION.bottom, TYPE_FIXED_HEADERS.initialFixed)]);
        if (!isFixationUpdated) {
            return;
        }
        // If the header is single, then it makes no sense to send notifications.
        // Thus, we prevent unnecessary force updates on receiving messages.
        if (fixedHeaderData.fixedPosition && this._fixedHeadersStack[fixedHeaderData.fixedPosition].length === 1) {
            return;
        }
        this._children.stickyFixed.start([
            this._fixedHeadersStack.top[this._fixedHeadersStack.top.length - 1],
            this._fixedHeadersStack.bottom[this._fixedHeadersStack.bottom.length - 1]
        ]);
    }

    _updateTopBottomHandler(event: Event): void {
        event.stopImmediatePropagation();

        this._updateTopBottom();
    }

    _resizeHandler() {
        const isSimpleHeaders = this._headersStack.top.length <= 1 && this._headersStack.bottom.length <= 1;
        // Игнорируем все собятия ресайза до _afterMount.
        // В любом случае в _afterMount мы попробуем рассчитать положение заголовков.
        if (this._stickyControllerMounted) {
            // Отдельно вызываем пересчет стилей для сафари13, т.к стили "bottom" и "right" не работают
            // в стики элементах на ios 13
            if (detection.safariVersion >= 13) {
                this._updateBottomShadowStyle();
            }
            if (!isSimpleHeaders) {
                this._registerDelayed();
                this._updateTopBottom();
            }
        }
    }

    private _updateBottomShadowStyle(): void {
        for (const id in this._headers) {
            this._headers[id].inst.updateBottomShadowStyle();
        }
    }

    private _resetSticky(): void {
        for (const id in this._headers) {
            this._headers[id].inst.resetSticky();
        }
    }

    private _registerDelayed(): void {
        const delayedHeadersCount = this._delayedHeaders.length;

        if (!delayedHeadersCount) {
            return;
        }

        this._resetSticky();

        return fastUpdate.measure(() => {
            this._delayedHeaders = this._delayedHeaders.filter((header: TRegisterEventData) => {
                if (!isHidden(header.container)) {
                    this._addToHeadersStack(header.id, header.position);
                    return false;
                }
                return true;
            });

            if (delayedHeadersCount !== this._delayedHeaders.length) {
                this._updateFixedInitially(POSITION.top);
                this._updateFixedInitially(POSITION.bottom);
                this._updateTopBottomDelayed();
                this._clearOffsetCache();
            }
        });
    }

    /**
     * Update information about the fixation state.
     * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} data Data about the header that changed the fixation state.
     */
    private _updateFixationState(data: IFixedEventData) {
        let isFixationUpdated = false;
        if (!!data.fixedPosition && !data.isFakeFixed) {
            this._fixedHeadersStack[data.fixedPosition].push(data.id);
            isFixationUpdated = true;
        }
        if (!!data.prevPosition) {
            const positionInGroup = this._fixedHeadersStack[data.prevPosition].indexOf(data.id);
            if (positionInGroup !== -1 && !data.isFakeFixed) {
                this._fixedHeadersStack[data.prevPosition].splice(positionInGroup, 1);
                isFixationUpdated = true;
            }
        }
        return isFixationUpdated;
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

    private _removeFromDelayedStack(id: number): void {
        this._delayedHeaders.forEach((header, index) => {
            if (header.id === id) {
                this._delayedHeaders.splice(index, 1);
            }
        });
    }

    private _updateTopBottom() {
        // Обновляем положение заголовков один раз в микротаске
        if (this._updateTopBottomInitialized) {
            return;
        }
        this._updateTopBottomInitialized = true;
        return Promise.resolve().then(() => {
            return this._updateTopBottomDelayed();
        });
    }

    private _isLastIndex(srcArray: object[], index: number): boolean {
        return index === (srcArray.length - 1);
    }

    private _updateTopBottomDelayed(): void {
        const offsets: Record<POSITION, Record<string, number>> = {
                top: {},
                bottom: {}
            };

        this._resetSticky();

        fastUpdate.measure(() => {
            let header: TRegisterEventData,
                nextHeader: TRegisterEventData,
                prevHeader: TRegisterEventData,
                parentElementOfNextHeader: Node,
                parentElementOfPrevHeader: Node;

            for (const position of [POSITION.top, POSITION.bottom]) {
                this._headersStack[position].reduce((offset, headerId, i) => {
                    header = this._headers[headerId];
                    nextHeader = null;
                    offsets[position][headerId] = offset;
                    if (header.mode === 'stackable' && !isHidden(header.container)) {
                        // Проверяем, имеет ли заголовок в родителях прямых родителей предыдущих заголовков.
                        // Если имеет, значит заголовки находятся в одном контейнере -> высчитываем offset.
                        if (!this._isLastIndex(this._headersStack[position], i)) {
                            const nextHeaderId = this._headersStack[position][i + 1];
                            nextHeader = this._headers[nextHeaderId];
                            for (let j = 0; j <= i; j++) {
                                prevHeader = this._headers[this._headersStack[position][j]];
                                parentElementOfPrevHeader = prevHeader.container.parentElement;
                                parentElementOfNextHeader = nextHeader.container.parentElement;
                                while (parentElementOfNextHeader !== parentElementOfPrevHeader && parentElementOfNextHeader !== document.body) {
                                    parentElementOfNextHeader = parentElementOfNextHeader.parentElement;
                                }
                                if (parentElementOfNextHeader === parentElementOfPrevHeader) {
                                    return offset + header.inst.height;
                                }
                            }
                            return 0;
                        }
                    }
                    return offset;
                }, 0);
            }
        });
        fastUpdate.mutate(() => {
            for (const position of [POSITION.top, POSITION.bottom]) {
                let positionOffsets = offsets[position];
                for (const headerId in offsets[position]) {
                    this._headers[headerId].inst[position] = positionOffsets[headerId];
                }
            }
        });

        this._updateTopBottomInitialized = false;
    }
}

export default Component;
