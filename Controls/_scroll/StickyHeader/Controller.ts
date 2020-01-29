import Control = require('Core/Control');
import template = require('wml!Controls/_scroll/StickyHeader/Controller/Controller');
import {TRegisterEventData} from './Utils';
import StickyHeader from 'Controls/_scroll/StickyHeader/_StickyHeader';
import {POSITION} from 'Controls/_scroll/StickyHeader/Utils';

// @ts-ignore

class Component extends Control {
    private _template: Function = template;

    // Register of all registered headers. Stores references to instances of headers.
    private _headers: object;
    // Ordered list of headers.
    private _headersStack: object;
    // The list of headers that are stuck at the moment.
    private _fixedHeadersStack: object;

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
    }

    /**
     * Returns the tru if there is at least one fixed header.
     * @param position
     */
    hasFixed(position: string): boolean {
        return !!this._fixedHeadersStack[position].length;
    }

    getHeadersHeight(position: string): number {
        let
            height: number = 0,
            replaceableHeight: number = 0,
            header;
        for (let headerId of this._fixedHeadersStack[position]) {
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
        if (register) {
            this._headers[data.id] = {
                ...data,
                fixedInitially: false
            };
            this._addToHeadersStack(data.id, data.position);
        } else {
            delete this._headers[data.id];
            this._removeFromHeadersStack(data.id, data.position);
        }
        event.stopImmediatePropagation();
    }

    /**
     * @param {Vdom/Vdom:SyntheticEvent} event
     * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} fixedHeaderData
     * @private
     */
    _fixedHandler(event, fixedHeaderData) {
        event.stopImmediatePropagation();
        this._updateFixationState(fixedHeaderData);
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

    _resizeHandler() {
        this._updateTopBottom();
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

    private _addToHeadersStack(id: number, position: string) {
        if (position === 'topbottom') {
            this._addToHeadersStack(id, 'top');
            this._addToHeadersStack(id, 'bottom');
            return;
        }
        //TODO https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        const container = (this._container && this._container.get) ? this._container.get(0) : this._container,
            headersStack = this._headersStack[position],
            offset = this._headers[id].inst.getOffset(container, position);

        // We are looking for the position of the first element whose offset is greater than the current one.
        // Insert a new header at this position.
        let index = headersStack.findIndex((headerId) => {
            const headerInst = this._headers[headerId].inst;
            return headerInst.getOffset(container, position) > offset;
        });
        index = index === -1 ? headersStack.length : index;
        headersStack.splice(index, 0, id);

        this._updateFixedInitially(position);

        this._updateTopBottom();
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
                if (headersHeight === headerInst.getOffset(container, position)) {
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
        let offset = 0;
        for (let headerId of this._headersStack['top']) {
            this._headers[headerId].inst.top = offset;
            if (this._headers[headerId].mode === 'stackable') {
                offset += this._headers[headerId].inst.height;
            }
        }
        offset = 0;
        for (let headerId of this._headersStack['bottom']) {
            this._headers[headerId].inst.bottom = offset;
            if (this._headers[headerId].mode === 'stackable') {
                offset += this._headers[headerId].inst.height;
            }
        }
    }
}

export default Component;
