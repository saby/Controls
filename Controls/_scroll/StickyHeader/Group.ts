import StickyHeaderContext = require('Controls/_scroll/StickyHeader/Context');
import {SyntheticEvent} from "Vdom/Vdom";
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {isStickySupport, getNextId, getOffset, POSITION, IOffset, IFixedEventData, TRegisterEventData} from 'Controls/_scroll/StickyHeader/Utils';
import template = require('wml!Controls/_scroll/StickyHeader/Group');
import {delay as runDelayed} from 'Types/function';

/**
 * Allows you to combine sticky headers with the same behavior. It is necessary if you need to make
 * several headers fixed at the same level, which should simultaneously stick and stick out.
 * Behaves like one fixed header.
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

export default class Group extends Control<IControlOptions> {
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
    protected _shadowVisible: boolean = false;

    protected _headers: IHeadersMap = {};
    protected _isRegistry: boolean = false;

    private _updateContext(position: POSITION, value: number) {
        this._stickyHeaderContext[position] = value;
        this._stickyHeaderContext.updateConsumers();
    }

    private _getOffset(parentElement: HTMLElement, element: HTMLElement, position: POSITION, key: string): number {
        const resetCacheDelay: number = 0;
        // Сценарий: проскролить список, вызвать перестроение заголовков. В этом случе offset будет отрицательным.
        // Физически заголовок не должен иметь такое смещение относительно группы. Это ошибка.
        // Разобраться по https://online.sbis.ru/opendoc.html?guid=243c78ec-7f27-4625-b347-d92523702e50

        // После регистрации каждого(!) нового заголовка в группе, вызыввается циклический обход уже всех(!)
        // зареганых заголовков и получение их размера через getBoundingClientRect, что заметно сказывается
        // на производительности. Для синхронных вызовов кэширую значение, на моем кейсе дает уменьшение вызовов на 66%.
        if (this._cachedOffset[key] !== undefined) {
            return this._cachedOffset[key];
        }
        this._cachedOffset[key] = Math.max(0, getOffset(parentElement, element, position));
        setTimeout(() => {
            this._cachedOffset[key] = undefined;
        }, resetCacheDelay);
        return this._cachedOffset[key];
    }
    protected _getChildContext() {
        return {
            stickyHeader: this._stickyHeaderContext
        };
    }

    protected _beforeMount(options: IControlOptions, context): void {
        this._isStickySupport = isStickySupport();
        this._index = getNextId();
        this._stickyHeaderContext = new StickyHeaderContext({
            shadowPosition: context?.stickyHeader?.shadowPosition
        });
    }

    protected _beforeUpdate(options: IControlOptions, context): void {
        this._stickyHeaderContext.shadowPosition = context?.stickyHeader?.shadowPosition;
        this._stickyHeaderContext.updateConsumers();
    }

    protected _afterMount(): void {
        this._notify('register', ['updateStickyShadow', this, this._updateStickyShadow], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('unregister', ['updateStickyShadow', this], {bubbling: true});
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        return getOffset(parentElement, this._container, position);
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

    private _setOffset(value: number, position: POSITION): void {
        for (let id in this._headers) {
            const positionValue: number = this._headers[id][position] + value;
            this._headers[id].inst[position] = positionValue;
            this._updateContext(position, positionValue);
        }
        this._offset[position] = value;
    }

    protected _fixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        event.stopImmediatePropagation();
        if (!!fixedHeaderData.fixedPosition) {
            this._stickyHeadersIds[fixedHeaderData.fixedPosition].push(fixedHeaderData.id);
            if (this._shadowVisible === true) {
                this._children.stickyHeaderShadow.start(this._stickyHeadersIds[fixedHeaderData.fixedPosition]);
            }
        } else if (!!fixedHeaderData.prevPosition && this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id) > -1) {
            this._stickyHeadersIds[fixedHeaderData.prevPosition].splice(this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id), 1);
        }

        if (!!fixedHeaderData.fixedPosition && !this._fixed) {
            this._fixed = true;
            this._notifyFixed(fixedHeaderData);
        } else if (!fixedHeaderData.fixedPosition && this._fixed &&
                this._stickyHeadersIds.top.length === 0 && this._stickyHeadersIds.bottom.length === 0) {
            this._fixed = false;
            this._notifyFixed(fixedHeaderData);
        }
    }

    protected _updateStickyShadow(ids: number[]): void {
        var shadowVisible = ids.indexOf(this._index) !== -1;
        if (this._shadowVisible !== shadowVisible) {
            this._shadowVisible = shadowVisible;
            if (shadowVisible) {
               this._children.stickyHeaderShadow.start(this._stickyHeadersIds.top.concat(this._stickyHeadersIds.bottom));
            } else {
               this._children.stickyHeaderShadow.start([]);
            }
        }
    }

    protected _updateTopBottom(): void {
        let offset: number = 0;
        for (const header of Object.keys(this._headers)) {
            for (const position of [POSITION.top, POSITION.bottom]) {
                offset = this._getOffset(this._container, this._headers[header].container, position, header);
                this._headers[header][position] = offset;
                const positionValue: number = this._offset[position] + offset;
                this._headers[header].inst[position] = positionValue;
                this._updateContext(position, positionValue);
            }
        }
    }

    protected _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
        event.stopImmediatePropagation();
        if (register) {
            let offset: number = 0;

            this._headers[data.id] = {
                ...data,
                top: 0,
                bottom: 0
            };

            for (const position of [POSITION.top, POSITION.bottom]) {
                offset = this._getOffset(this._container, data.inst._container, position, data.id);
                this._headers[data.id][position] = offset;
                const positionValue: number = this._offset[position] + offset;
                data.inst[position] = positionValue;
                this._updateContext(position, positionValue);
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
            } else if (this._container.childElementCount === Object.keys(this._headers).length) {
                /**При смене фильтрации (к примеру переход по кнопке назад) происходит обновление
                 *  смещения заголовков. В этот момент так же могут регистрировать новые заголовки.
                 *  Проблема заключается в том, что на момент регистрации новых - позиция существующих
                 *  может не успеть обновиться в DOM, из-за чего новые заголовки неверно высчитают
                 *  свое смещение.
                 *  Как временное решение запускаем отложенный пересчет позиции, чтобы заголовки имели
                 *  актуальное смещение. В первый цикл не всегда успевает обновиться позиция, поэтому делаем 2 пересчета.
                 */
                //TODO: https://online.sbis.ru/opendoc.html?guid=42232947-df0f-4a2b-9fbe-e3f9a9389263
                runDelayed(() => {
                    this._updateTopBottom();
                    this._notify(
                        'updateTopBottom',
                        [{updateTopBottom: true}],
                        {bubbling: true}
                    );
                    runDelayed(() => {
                        this._updateTopBottom();
                        this._notify(
                            'updateTopBottom',
                            [{updateTopBottom: true}],
                            {bubbling: true}
                        );
                    });
                });
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

    static contextTypes(): {} {
        return {
            stickyHeader: StickyHeaderContext
        };
    }
}
