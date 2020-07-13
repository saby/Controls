import {SyntheticEvent} from "Vdom/Vdom";
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    isStickySupport,
    getNextId,
    getOffset,
    POSITION,
    IOffset,
    IFixedEventData,
    TRegisterEventData,
    getGapFixSize
} from 'Controls/_scroll/StickyHeader/Utils';
import template = require('wml!Controls/_scroll/StickyHeader/Group');
import {SHADOW_VISIBILITY} from './_StickyHeader';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import fastUpdate from './FastUpdate';

/**
 * Allows you to combine sticky headers with the same behavior. It is necessary if you need to make
 * several headers fixed at the same level, which should simultaneously stick and stick out.
 * Behaves like one fixed header.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
 *
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader/Group
 * @author Красильников А.С.
 * @public
 */

/**
 * @name Controls/_scroll/StickyHeader/Group#content
 * @cfg {Function} Content in which several fixed headers are inserted.
 */

/**
 * @event Controls/_scroll/StickyHeader/Group#fixed Change the fixation state.
 * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

interface IHeaderData extends TRegisterEventData {
    top: number;
    bottom: number;
}

interface IHeadersMap {
    [key: string]: IHeaderData;
}

interface IHeadersIds {
    top: number[];
    bottom: number[];
}

interface IOffsetCache {
    [key: string]: number;
}

interface IStickyHeaderGroupOptions extends IControlOptions {
    calculateHeadersOffsets?: boolean;
}

export default class Group extends Control<IStickyHeaderGroupOptions> {
    protected _template: TemplateFunction = template;
    private _index: number = null;
    protected _isStickySupport: boolean = false;

    protected _fixed: boolean = false;
    protected _cachedOffset: IOffsetCache = {};

    protected _stickyHeadersIds: IHeadersIds = {
        top: [],
        bottom: []
    };
    protected _offset: IOffset = {
        top: 0,
        bottom: 0
    };
    protected _isFixed: boolean = false;

    protected _headers: IHeadersMap = {};
    protected _isRegistry: boolean = false;

    private _delayedHeaders: number[] = [];

    protected _beforeMount(options: IControlOptions, context): void {
        this._isStickySupport = isStickySupport();
        this._index = getNextId();
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        let offset: number = getOffset(parentElement, this._container, position);
        if (this._fixed) {
            offset += getGapFixSize();
        }
        return offset;
    }

    resetSticky(): void {
        for (const id in this._headers) {
            this._headers[id].inst.resetSticky();
        }
    }

    updateBottomShadowStyle(): void {
        for (const id in this._headers) {
            this._headers[id].inst.updateBottomShadowStyle();
        }
    }

    get height(): number {
        // Group can be with style display: content. Use the height of the first header as the height of the group.
        const headersIds: number[] = Object.keys(this._headers);
        return headersIds.length ? this._headers[headersIds[0]].inst.height : 0;
    }

    set top(value: number) {
        this._setOffset(value, POSITION.top);
    }

    set bottom(value: number) {
        this._setOffset(value, POSITION.bottom);
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        for (let id in this._headers) {
            if (this._headers[id].inst.shadowVisibility === SHADOW_VISIBILITY.visible) {
                return SHADOW_VISIBILITY.visible;
            }
        }
        return SHADOW_VISIBILITY.hidden;
    }

    getChildrenHeaders(): TRegisterEventData[] {
        return Object.keys(this._headers).map(id => this._headers[id]);
    }

    private _setOffset(value: number, position: POSITION): void {
        for (let id in this._headers) {
            const positionValue: number = this._headers[id][position] + value;
            this._headers[id].inst[position] = positionValue;
        }
        this._offset[position] = value;
    }

    protected _fixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        event.stopImmediatePropagation();
        if (!fixedHeaderData.isFakeFixed) {
            if (!!fixedHeaderData.fixedPosition) {
                this._stickyHeadersIds[fixedHeaderData.fixedPosition].push(fixedHeaderData.id);
                if (this._isFixed === true) {
                    this._children.stickyFixed.start(this._stickyHeadersIds[fixedHeaderData.fixedPosition]);
                }
            } else if (!!fixedHeaderData.prevPosition && this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id) > -1) {
                this._stickyHeadersIds[fixedHeaderData.prevPosition].splice(this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id), 1);
            }
        }

        if (!!fixedHeaderData.fixedPosition && !this._fixed) {
            if (!fixedHeaderData.isFakeFixed) {
                this._fixed = true;
            }
            this._notifyFixed(fixedHeaderData);
        } else if (!fixedHeaderData.fixedPosition && this._fixed &&
                this._stickyHeadersIds.top.length === 0 && this._stickyHeadersIds.bottom.length === 0) {
            if (!fixedHeaderData.isFakeFixed) {
                this._fixed = false;
            }
            this._notifyFixed(fixedHeaderData);
        }
    }

    protected updateFixed(ids: number[]): void {
        var isFixed = ids.indexOf(this._index) !== -1;
        if (this._isFixed !== isFixed) {
            this._isFixed = isFixed;
            if (isFixed) {
               this._updateFixed(this._stickyHeadersIds.top.concat(this._stickyHeadersIds.bottom));
            } else {
               this._updateFixed([]);
            }
        }
    }

    _updateFixed(ids: number[]): void {
        for (const id in this._headers) {
            this._headers[id].inst.updateFixed(ids);
        }
    }

    protected _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
        event.stopImmediatePropagation();
        if (register) {
            this._headers[data.id] = {
                ...data,
                top: 0,
                bottom: 0
            };

            if (this._options.calculateHeadersOffsets) {
                this._updateTopBottom(data);
            } else {
                data.inst[POSITION.top] = this._offset[POSITION.top];
                data.inst[POSITION.bottom] = this._offset[POSITION.bottom];
            }

            if (this._isFixed) {
                this._children.stickyFixed.start([data.id].concat(this._stickyHeadersIds[data.position]));
            }

            // Register group after first header is registered
            if (!this._isRegistry) {
                this._notify('stickyRegister', [{
                    id: this._index,
                    inst: this,
                    container: this._container,position: data.position,
                    mode: data.mode,
                }, true], {bubbling: true});
                this._isRegistry = true;
            }
        } else {
            delete this._headers[data.id];

            // Unregister group after last header is unregistered
            if (!Object.keys(this._headers).length) {
                this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
                this._isRegistry = false;
            }
        }
    }

    private _updateTopBottom(data: TRegisterEventData): void {
        // Проблема в том, что чтобы узнать положение заголовка относительно группы нам надо снять position: sticky.
        // Это приводит к layout. И так для каждой ячейки для заголвков в таблице. Создадим список всех заголовков
        // которые надо обсчитать в этом синхронном участке кода и обсчитаем их за раз в микротаске,
        // один раз сняв со всех загоовков position: sticky.
        if (!this._delayedHeaders.length) {
            Promise.resolve().then(this._updateTopBottomDelayed.bind(this));
        }
        this._delayedHeaders.push(data.id);
    }

    private _updateTopBottomDelayed(): void {
        let
            offsets: Record<POSITION, Record<string, number>> = {
                top: {},
                bottom: {}
            },
            data: TRegisterEventData,
            offset: number;

        this.resetSticky();

        fastUpdate.measure(() => {
            for (const id of this._delayedHeaders) {
                data = this._headers[id];
                for (const position of [POSITION.top, POSITION.bottom]) {
                    if (data.inst._options.position.indexOf(position) !== -1) {
                        offset = data.inst.getOffset(this._container, position);
                        this._headers[data.id][position] = offset;
                        offsets[position][data.id] = this._offset[position] + offset;
                    }
                }
            }
            this._delayedHeaders = [];
        });

        fastUpdate.mutate(() => {
            for (const position of [POSITION.top, POSITION.bottom]) {
                let positionOffsets = offsets[position];
                let headerId;
                for (headerId in offsets[position]) {
                    this._headers[headerId].inst[position] = positionOffsets[headerId];
                }
            }
        });
    }

    private _notifyFixed(fixedHeaderData: IFixedEventData): void {
        this._notify(
            'fixed',
            [{
                ...fixedHeaderData,
                id: this._index
            }],
            {bubbling: true}
        );
    }

    static getDefaultOptions(): Partial<IStickyHeaderGroupOptions> {
        return {
            calculateHeadersOffsets: true
        };
    }
}
