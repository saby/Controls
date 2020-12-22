import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {SCROLL_POSITION} from '../Utils/Scroll';
import {IScrollState} from '../Utils/ScrollState';
import {IArrowState} from '../../_paging/Paging';

export type TPagingModeScroll = 'hidden' | 'basic' | 'edge' | 'end';

export default class PagingModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;

    private _arrowState: IArrowState = {};
    private _isVisible: boolean = false;
    private _position: SCROLL_POSITION;
    private _pagingMode: TPagingModeScroll = 'hidden';

    update(scrollState: IScrollState): void {
        if (this._position !== scrollState.verticalPosition) {
            this._position = scrollState.verticalPosition;
            if (scrollState.verticalPosition === SCROLL_POSITION.START) {
                this._arrowState = {
                    begin: 'readonly',
                    prev: 'readonly',
                    next: 'visible',
                    end: 'hidden'
                };
            } else if (scrollState.verticalPosition === SCROLL_POSITION.END) {
                this._arrowState = {
                    begin: 'visible',
                    prev: 'visible',
                    next: 'readonly',
                    end: 'hidden'
                };
            } else {
                this._arrowState = {
                    begin: 'visible',
                    prev: 'visible',
                    next: 'visible',
                    end: 'hidden'
                };
            }

            if (this._isVisible) {
                this._nextVersion();
            }
        }
    }

    set isVisible(value: boolean) {
        if (value !== this._isVisible) {
            this._isVisible = value;
            this._nextVersion();
        }
    }

    get isVisible(): boolean {
        return this._isVisible;
    }

    get arrowState(): IArrowState {
        switch (this.pagingMode) {
            case 'edge':
                if (this._arrowState.next === 'visible' || this._arrowState.end === 'visible') {
                    this._arrowState.begin = 'hidden';
                    this._arrowState.end = 'visible';
                } else if (this._arrowState.begin === 'visible') {
                    this._arrowState.end = 'hidden';
                }
                this._arrowState.prev = 'hidden';
                this._arrowState.next = 'hidden';
                break;

            case 'end':
                if (this._arrowState.next === 'visible' || this._arrowState.end === 'visible') {
                    this._arrowState.end = 'visible';
                } else {
                    this._arrowState.end = 'hidden';
                }
                this._arrowState.prev = 'hidden';
                this._arrowState.next = 'hidden';
                this._arrowState.begin = 'hidden';
                break;
        }
        return this._arrowState;
    }

    set pagingMode(pagingMode: TPagingModeScroll): void {
        this._pagingMode = pagingMode;
    }

    get pagingMode(): TPagingModeScroll {
        return this._pagingMode || 'basic';
    }
}
