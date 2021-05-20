import { SyntheticEvent } from 'UICommon/Events';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    isStickySupport,
    getNextId,
    getOffset,
    POSITION,
    IOffset,
    IFixedEventData,
    TRegisterEventData,
    getGapFixSize,
    SHADOW_VISIBILITY_BY_CONTROLLER,
    MODE
} from 'Controls/_scroll/StickyHeader/Utils';
import template = require('wml!Controls/_scroll/StickyHeader/Group');
import {SHADOW_VISIBILITY} from './Utils';
import {RegisterClass} from 'Controls/event';
import fastUpdate from './FastUpdate';

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
    offsetTop: number;
}
/**
 * Allows you to combine sticky headers with the same behavior. It is necessary if you need to make
 * several headers fixed at the same level, which should simultaneously stick and stick out.
 * Behaves like one fixed header.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @class Controls/_scroll/StickyHeader/Group
 * @author Красильников А.С.
 * @public
 */
export default class Group extends Control<IStickyHeaderGroupOptions> {
    private _index: number = null;
    protected _template: TemplateFunction = template;
    protected _isStickySupport: boolean = false;

    protected _fixed: boolean = false;
    protected _cachedOffset: IOffsetCache = {};

    private _syncDomOptimization: boolean = true;

    protected _stickyHeadersIds: IHeadersIds = {
        top: [],
        bottom: []
    };
    protected _offset: IOffset = {
        top: 0,
        bottom: 0
    };
    protected _isFixed: boolean = false;
    protected _isShadowVisibleByController: { top: SHADOW_VISIBILITY_BY_CONTROLLER; bottom: SHADOW_VISIBILITY_BY_CONTROLLER; } = {
        top: SHADOW_VISIBILITY_BY_CONTROLLER.auto,
        bottom: SHADOW_VISIBILITY_BY_CONTROLLER.auto
    };

    protected _headers: IHeadersMap = {};
    protected _isRegistry: boolean = false;

    private _delayedHeaders: number[] = [];

    private _stickyMode: MODE;

    // Считаем заголовок инициализированным после того как контроллер установил ему top или bottom.
    // До этого не синхронизируем дом дерево при изменении состояния.
    private _initialized: boolean = false;

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

    get height(): number {
        // Group can be with style display: content. Use the height of the first header as the height of the group.
        const headersIds: number[] = Object.keys(this._headers);
        return headersIds.length ? this._headers[headersIds[0]].inst.height : 0;
    }

    get offsetTop(): number {
        return this._options.offsetTop
    }

    set top(value: number) {
        this._setOffset(value, POSITION.top);
    }

    set bottom(value: number) {
        this._setOffset(value, POSITION.bottom);
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        // TODO: сделать чтобы видимость теней явно задавалась через опцию на группе.
        // https://online.sbis.ru/opendoc.html?guid=4e5cd2c6-a2ec-4619-b9c4-fafbb21fc4b8
        for (let id in this._headers) {
            const shadowVisibility = this._headers[id].inst.shadowVisibility;
            if (shadowVisibility === SHADOW_VISIBILITY.visible ||
                shadowVisibility === SHADOW_VISIBILITY.lastVisible ||
                shadowVisibility === SHADOW_VISIBILITY.initial) {
                return shadowVisibility;
            }
        }
        return SHADOW_VISIBILITY.hidden;
    }

    getChildrenHeaders(): TRegisterEventData[] {
        return Object.keys(this._headers).map(id => this._headers[id]);
    }

    setSyncDomOptimization(value: boolean): void {
        if (this._syncDomOptimization !== value) {
            for (let id in this._headers) {
                this._headers[id].inst.setSyncDomOptimization(value);
            }
        }
    }

    private _setOffset(value: number, position: POSITION): void {

        this._offset[position] = value;

        if (this._initialized || !this._options.calculateHeadersOffsets) {
            for (let id in this._headers) {
                const positionValue: number = this._headers[id][position] + value;
                this._headers[id].inst[position] = positionValue;
            }
        }

        if (!this._initialized) {
            this._initialized = true;
            if (this._delayedHeaders.length && this._options.calculateHeadersOffsets) {
                Promise.resolve().then(this._updateTopBottomDelayed.bind(this));
            }
        }

    }

    setFixedPosition(position: string): void {
        for (const id in this._headers) {
            this._headers[id].inst.setFixedPosition(position);
        }
    }

    protected _fixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        event.stopImmediatePropagation();
        if (!fixedHeaderData.isFakeFixed) {
            if (!!fixedHeaderData.fixedPosition) {
                const headersIds: number[] = this._stickyHeadersIds[fixedHeaderData.fixedPosition]
                headersIds.push(fixedHeaderData.id);
                // Если это не первый заголовок в группе, то группа уже знает надо ли отображить тень,
                // сообщим это заголовку.
                if (headersIds.length > 1) {
                    if (this._isFixed) {
                        this._headers[fixedHeaderData.id].inst.updateFixed([fixedHeaderData.id]);
                    } else {
                        this._headers[fixedHeaderData.id].inst.updateFixed([]);
                    }
                }
            } else if (!!fixedHeaderData.prevPosition && this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id) > -1) {
                this._stickyHeadersIds[fixedHeaderData.prevPosition].splice(this._stickyHeadersIds[fixedHeaderData.prevPosition].indexOf(fixedHeaderData.id), 1);
            }
        }

        if (!!fixedHeaderData.fixedPosition && !this._fixed) {
            if (!fixedHeaderData.isFakeFixed) {
                // Эти 2 поля означают одно и то же но со нюансами. _isFixed когда то назывался _shadowVisible.
                // Свести к одному полю, либо дать адекватные названия.
                // https://online.sbis.ru/opendoc.html?guid=08a36766-8ac6-4884-bd3b-c28514c9574c
                this._fixed = true;
                this._isFixed = true;
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

    protected updateShadowVisibility(visibility: SHADOW_VISIBILITY_BY_CONTROLLER, position: POSITION): void {
        if (this._isShadowVisibleByController[position] !== visibility) {
            this._isShadowVisibleByController[position] = visibility;
            for (const id in this._headers) {
                this._headers[id].inst.updateShadowVisibility(visibility, position);
            }
        }
    }

    getHeaderContainer(): HTMLElement {
        return this._container;
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

            const isShadowVisible = this._isShadowVisibleByController[POSITION.top] !== SHADOW_VISIBILITY_BY_CONTROLLER.hidden &&
                this._isShadowVisibleByController[POSITION.bottom] !== SHADOW_VISIBILITY_BY_CONTROLLER.hidden;
            if (this._isFixed && isShadowVisible) {
                data.inst.updateFixed([data.inst.index], true);
            }

            data.inst.setSyncDomOptimization(this._syncDomOptimization);

            // Register group after first header is registered
            if (!this._isRegistry) {
                this._notify('stickyRegister', [{
                    id: this._index,
                    inst: this,
                    position: data.position,
                    mode: data.mode,
                }, true], {bubbling: true});
                this._isRegistry = true;
            }
        } else {
            delete this._headers[data.id];
            const index = this._delayedHeaders.indexOf(data.id);
            if (index > -1) {
                this._delayedHeaders.splice(index, 1);
            }

            // Unregister group after last header is unregistered
            if (!Object.keys(this._headers).length) {
                this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
                this._isRegistry = false;
            }
        }
    }

    protected _stickyModeChanged(event: SyntheticEvent<Event>, stickyId: number, newMode: MODE): void {
        // Если мы поменяли mode у заголовков внутри группы, метод вызовется несколько раз, в этом случае
        // будем реагировать только на первый вызов
        if (this._stickyMode !== newMode) {
            this._stickyMode = newMode;
            this._notify('stickyModeChanged', [this._index, newMode], {bubbling: true});
        }
        event.stopPropagation();
    }

    private _updateTopBottom(data: TRegisterEventData): void {
        // Проблема в том, что чтобы узнать положение заголовка относительно группы нам надо снять position: sticky.
        // Это приводит к layout. И так для каждой ячейки для заголвков в таблице. Создадим список всех заголовков
        // которые надо обсчитать в этом синхронном участке кода и обсчитаем их за раз в микротаске,
        // один раз сняв со всех загоовков position: sticky.
        if (this._initialized && !this._delayedHeaders.length) {
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
            calculateHeadersOffsets: true,
            offsetTop: 0
        };
    }
}
/**
 * @name Controls/_scroll/StickyHeader/Group#content
 * @cfg {Function} Content in which several fixed headers are inserted.
 */

/**
 * @event Change the fixation state.
 * @name Controls/_scroll/StickyHeader/Group#fixed
 * @param {UICommon/Events:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

Object.defineProperty(Group, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Group.getDefaultOptions();
   }
});
