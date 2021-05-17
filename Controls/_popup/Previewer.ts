import {Control, TemplateFunction} from 'UI/Base';
import {IPreviewerPopupOptions} from 'Controls/_popup/interface/IPreviewerOpener';
import {IPreviewer, IPreviewerOptions} from 'Controls/_popup/interface/IPreviewer';
import {debounce} from 'Types/function';
import {SyntheticEvent} from 'Vdom/Vdom';
import PreviewerOpener from './Opener/Previewer';
import {goUpByControlTree} from 'UI/Focus';
import 'css!Controls/popup';
import template = require('wml!Controls/_popup/Previewer/Previewer');
import {CalmTimer} from 'Controls/_popup/fastOpenUtils/FastOpen';

const CALM_DELAY: number = 300; // During what time should not move the mouse to start opening the popup.
/**
 * Контрол, отображающий всплывающее окно - превьювер, относительно указанного элемента. Открытие превьювера вызывает событие, указанное в опции trigger. В один момент времени на странице может отображаться только один превьювер.
 * @class Controls/_popup/Previewer
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 *
 * @mixes Controls/popup:IPreviewer
 * @public
 * @author Красильников А.С.
 */
class PreviewerTarget extends Control<IPreviewerOptions> implements IPreviewer {
    readonly '[Controls/_popup/interface/IPreviewer]': boolean;

    _template: TemplateFunction = template;
    _previewerId: IPreviewerPopupOptions;
    _calmTimer: CalmTimer;
    _isOpened: boolean = false;
    _enableClose: boolean = true;

    protected _beforeMount(options: IPreviewerOptions): void {
        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
        this._debouncedAction = debounce(this._debouncedAction, 10);
        this._calmTimer = new CalmTimer();
    }

    protected _beforeUnmount(): void {
        this._calmTimer.resetTimeOut();
    }

    /**
     * @param type
     * @variant hover
     * @variant click
     */
    open(type: string): Promise<void> {
        if (!this._isPopupOpened()) {
            const newConfig: IPreviewerPopupOptions = this._getConfig();
            this._isOpened = true;
            return PreviewerOpener.openPopup(newConfig, type).then((id: IPreviewerPopupOptions) => {
                this._previewerId = id;
            });
        }
    }

    /**
     * @param type
     * @variant hover
     * @variant click
     */
    close(type: string): void {
        PreviewerOpener.closePopup(this._previewerId, type);
    }

    private _getConfig(): IPreviewerPopupOptions {
        const config: IPreviewerPopupOptions = {
            fittingMode: {
                vertical: 'adaptive',
                horizontal: 'overflow'
            },
            autofocus: false,
            opener: this,
            target: this._container,
            template: 'Controls/popup:PreviewerTemplate',
            targetPoint: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            isCompoundTemplate: this._options.isCompoundTemplate,
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: this._closeHandler
            },
            templateOptions: {
                template: this._options.template,
                templateOptions: this._options.templateOptions
            }
        };

        if (this._options.targetPoint) {
            config.targetPoint = this._options.targetPoint;
        }
        if (this._options.direction) {
            config.direction = this._options.direction;
        }
        if (this._options.offset) {
            config.offset = this._options.offset;
        }
        if (this._options.delay) {
            config.delay = this._options.delay;
        }
        return config;
    }

    protected _open(event: SyntheticEvent<MouseEvent>): void {
        const type: string = this._getType(event.type);
        this.open(type);
    }

    private _close(event: SyntheticEvent<MouseEvent>): void {
        const type: string = this._getType(event.type);
        this.close(type);
    }

    private _isPopupOpened(): boolean {
        return PreviewerOpener.isOpenedPopup(this._previewerId);
    }

    private _getType(eventType: string): string {
        if (eventType === 'mousemove' || eventType === 'mouseleave') {
            return 'hover';
        }
        return 'click';
    }

    // Pointer action on hover with content and popup are executed sequentially.
    // Collect in package and process the latest challenge
    private _debouncedAction(method: string, args: any): void {
        this[method].apply(this, args);
    }

    private _cancel(event: SyntheticEvent<MouseEvent>, action: string): void {
        PreviewerOpener.cancelPopup(this._previewerId, action);
    }

    protected _scrollHandler(event: SyntheticEvent<MouseEvent>): void {
        if (this._options.actionOnScroll === 'close') {
            this._close(event);
        }
    }

    protected _contentMouseenterHandler(event: SyntheticEvent<MouseEvent>): void {
        if (this._options.trigger === 'hover' || this._options.trigger === 'hoverAndClick') {
            // We will cancel closing of the popup, if it is already open
            if (this._isOpened) {
                this._cancel(event, 'closing');
            }
        }
    }

    protected _contentMouseleaveHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly && (this._options.trigger === 'hover' || this._options.trigger === 'hoverAndClick')) {
            this._calmTimer.resetTimeOut();
            const callback = () => {
                if (this._isPopupOpened()) {
                    this._debouncedAction('_close', [event]);
                } else {
                    this._cancel(event, 'opening');
                }
            };
            this._calmTimer.stop(callback.bind(this));
        }
    }

    protected _contentMousemoveHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly && (this._options.trigger === 'hover' || this._options.trigger === 'hoverAndClick')) {
            this._calmTimer.setCallback(() => {
                if (!this._isPopupOpened()) {
                    this._debouncedAction('_open', [event]);
                }
            });
            this._calmTimer.start();
        }
    }

    protected _contentMouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
        const isLeftMouseButton = event.nativeEvent.which === 1;
        if (!this._options.readOnly && (this._options.trigger === 'click' || this._options.trigger === 'hoverAndClick')
            && isLeftMouseButton) {
            /**
             * When trigger is set to 'hover', preview shouldn't be shown when user clicks on content.
             */
            if (!this._isPopupOpened()) {
                this._debouncedAction('_open', [event]);
            }
            event.preventDefault();
            event.stopPropagation();
            // preventDefault stopped the focus => active elements don't deactivated.
            // activate control manually
            this.activate();
        }
    }

    protected _contentClickHandler(event: SyntheticEvent<MouseEvent>): void {
        // Stopping mousedown event doesn't stop click event
        if (this._options.trigger === 'click' || this._options.trigger === 'hoverAndClick') {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _resultHandler(event: SyntheticEvent<MouseEvent>): void {
        switch (event.type) {
            case 'menuclosed':
                this._enableClose = true;
                event.stopPropagation();
                break;
            case 'menuopened':
                this._enableClose = false;
                event.stopPropagation();
                break;
            case 'mouseenter':
                this._debouncedAction('_cancel', [event, 'closing']);
                break;
            case 'mouseleave':
                const isHoverType = this._options.trigger === 'hover' || this._options.trigger === 'hoverAndClick';
                if (isHoverType && this._enableClose && !this._isLinkedPreviewer(event)) {
                    this._debouncedAction('_close', [event]);
                }
                break;
        }
    }

    private _isLinkedPreviewer(event: SyntheticEvent<MouseEvent>): boolean {
        const parentControls = goUpByControlTree(event.nativeEvent.relatedTarget);
        for (let i = 0; i < parentControls.length; i++) {
            if (parentControls[i] === this) {
                return true;
            }
        }
        return false;
    }

    private _closeHandler(): void {
        this._isOpened = false;
        this._notify('close', []);
    }

    static getDefaultOptions(): IPreviewerOptions {
        return {
            trigger: 'hoverAndClick',
            actionOnScroll: 'close'
        };
    }
}

Object.defineProperty(PreviewerTarget, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return PreviewerTarget.getDefaultOptions();
    }
});

export default PreviewerTarget;
