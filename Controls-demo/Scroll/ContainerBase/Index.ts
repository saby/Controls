import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ContainerBase/Template');

export default class ContainerBaseDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _contentAdded: boolean = false;
    private _heightAdded: boolean = false;
    private _widthAdded: boolean = false;
    private _scrollTopChanged: boolean = false;
    private _scrollLeftChanged: boolean = false;
    private _eventStore: string[] = [];
    private _eventCounter: number = 0;
    private _state: object = null;

    scrollStateChangedHandler(event, state): void {
        this._eventStore.push('scrollStateChanged');
        this._eventCounter++;
        this._state = state.state;
    }

    _addContentHandler(): void {
        this._contentAdded = !this._contentAdded;
    }

    _changeHeightContentHandler(): void {
        this._heightAdded = !this._heightAdded;
    }

    _changeHeightAddContentHandler(): void {
        this._heightAdded = !this._heightAdded;
        this._contentAdded = !this._contentAdded;
        this._changeScrollTopHandler();
        this._changeScrollLeftHandler();
    }

    _changeWidthContentHandler(): void {
        this._widthAdded = !this._widthAdded;
    }

    _changeScrollTopHandler(): void {
        if (!this._scrollTopChanged) {
            this._children.containerBase._container.scrollTop = 30;
        } else {
            this._children.containerBase._container.scrollTop = 0;
        }
        this._scrollTopChanged = !this._scrollTopChanged;
    }

    _changeScrollLeftHandler(): void {
        if (!this._scrollLeftChanged) {
            this._children.containerBase._container.scrollLeft = 30;
        } else {
            this._children.containerBase._container.scrollLeft = 0;
        }
        this._scrollLeftChanged = !this._scrollLeftChanged;
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/ContainerBase/Style'];
}
