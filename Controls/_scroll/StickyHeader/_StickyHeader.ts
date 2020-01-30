import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import Context = require('Controls/_scroll/StickyHeader/Context');
import {getNextId, getOffset, POSITION, MODE, IOffset} from 'Controls/_scroll/StickyHeader/Utils';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import Model = require('Controls/_scroll/StickyHeader/_StickyHeader/Model');
import template = require('wml!Controls/_scroll/StickyHeader/_StickyHeader/StickyHeader');
import tmplNotify = require('Controls/Utils/tmplNotify');
import 'css!theme?Controls/scroll';

export const enum SHADOW_VISIBILITY {
    visible = 'visible',
    hidden = 'hidden'
}

export interface IStickyHeaderOptions extends IControlOptions {
    position: POSITION;
    mode: MODE;
    fixedZIndex: number;
    shadowVisibility: SHADOW_VISIBILITY;
    backgroundVisible: boolean;
}

/**
 * Ensures that content sticks to the top of the parent container when scrolling down.
 * Occurs at the moment of intersection of the upper part of the content and the parent container.
 *
 * @private
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader
 * @css @background-color_StickyHeader Background color of StickyHeader.
 */

/**
 * @name Controls/_scroll/StickyHeader#content
 * @cfg {Function} Sticky header content.
 */

/**
 * @event Controls/_scroll/StickyHeader#fixed Change the fixation state.
 * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

// For android, use a large patch, because 1 pixel is not enough. For all platforms we use the minimum values since
// there may be layout problems if the headers will have paddings, margins, etc.
const
    ANDROID_GAP_FIX_OFFSET: number = 2,
    MOBILE_GAP_FIX_OFFSET: number = 1;

interface IStickyHeaderContext {
    stickyHeader: Function;
}

export default class StickyHeader extends Control<IStickyHeaderOptions> {

    /**
     * @type {Function} Component display template.
     * @private
     */
    protected _template: TemplateFunction = template;

    /**
     * @type {IntersectionObserver}
     * @private
     */
    private _observer: IntersectionObserver;

    private _model: Model;

    /**
     * type {Boolean} Determines whether the component is built on the Android mobile platform.
     * @private
     */
    protected _isMobilePlatform: boolean = detection.isMobilePlatform;
    protected _isMobileAndroid: boolean = detection.isMobileAndroid;
    protected _isSafari13: boolean = StickyHeader._isSafari13();

    private _shadowVisible: boolean = true;
    private _stickyHeadersHeight: IOffset = {
        top: null,
        bottom: null
    };

    private _index: number = null;

    private _height: number = 0;

    private _reverseOffsetStyle: string = null;
    private _minHeight: number = 0;
    private _cachedStyles: CSSStyleDeclaration = null;
    private _cssClassName: string = null;

    protected _notifyHandler: Function = tmplNotify;

    protected _bottomShadowStyle: string = '';

    private _stickyDestroy: boolean = false;

    protected _beforeMount(): void {
        this._observeHandler = this._observeHandler.bind(this);
        this._index = getNextId();
    }

    protected _afterUpdate(): void {
        this._updateBottomShadowStyle();
    }

    protected _afterMount(): void {
        const children = this._children;

        this._notify('stickyRegister', [{
            id: this._index,
            inst: this,
            position: this._options.position,
            mode: this._options.mode
        }, true], {bubbling: true});
        this._observer = new IntersectionObserver(this._observeHandler);
        this._model = new Model({
            topTarget: children.observationTargetTop,
            bottomTarget: children.observationTargetBottom,
            position: this._options.position,
        });

        this._observer.observe(children.observationTargetTop);
        this._observer.observe(children.observationTargetBottom);

        this._updateBottomShadowStyle();
    }

    protected _beforeUnmount(): void {
        this._model.destroy();
        this._stickyDestroy = true;

        // его может и не быть, если контрол рушится не успев замаунтиться
        if (this._observer) {
            this._observer.disconnect();
        }

        //Let the listeners know that the element is no longer fixed before the unmount.
        this._fixationStateChangeHandler('', this._model.fixedPosition);
        this._observeHandler = undefined;
        this._observer = undefined;
        this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        return getOffset(parentElement, this._container, position);
    }

    get height(): number {
        const container: HTMLElement = this._container;
        if (container.offsetParent !== null) {
            this._height = container.offsetHeight;
        }
        return this._height;
    }

    get top(): number {
        return this._stickyHeadersHeight.top;
    }

    set top(value: number) {
        if (this._stickyHeadersHeight.top !== value) {
            this._stickyHeadersHeight.top = value;
            this._forceUpdate();
        }
    }

    get bottom(): number {
        return this._stickyHeadersHeight.bottom;
    }

    set bottom(value: number) {
        if (this._stickyHeadersHeight.bottom !== value) {
            this._stickyHeadersHeight.bottom = value;
            this._forceUpdate();
        }
    }

    protected _resizeHandler(): void {
        this._notify('stickyHeaderResize', [], {bubbling: true});
    }

    /**
     * Handles changes to the visibility of the target object of observation at the intersection of the root container.
     * @param {IntersectionObserverEntry[]} entries The intersections between the target element and its root container at a specific moment of transition.
     * @private
     */
    private _observeHandler(entries: IntersectionObserverEntry[]): number {
        /**
         * Баг IntersectionObserver на Mac OS: сallback может вызываться после отписки от слежения. Отписка происходит в
         * _beforeUnmount. Устанавливаем защиту.
         */
        if (this._stickyDestroy) {
            return;
        }
        const popupContainer: HTMLElement = this._container.closest('.controls-Popup__template');

        // Stack popups can be hidden when child popup has a large width.
        // In this case don't start observable handler.
        if (popupContainer && popupContainer.classList.contains('ws-hidden')) {
            return;
        }
        const fixedPosition: POSITION = this._model.fixedPosition;

        this._model.update(entries);

        if (this._model.fixedPosition !== fixedPosition) {
            this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
            this._forceUpdate();
        }
    }

    /**
     * To inform descendants about the fixing status. To update the state of the instance.
     * @private
     */
    protected _fixationStateChangeHandler(newPosition: POSITION, prevPosition: POSITION): void {
        // If the header is hidden we cannot calculate its current height.
        // Use the height that it had before it was hidden.
        if (this._container.offsetParent !== null) {
            this._height = this._container.offsetHeight;
        }
        const information = {
            id: this._index,
            fixedPosition: newPosition,
            offsetHeight: this._height,
            prevPosition,
            mode: this._options.mode
        };

        this._shadowVisible = !!newPosition;
        this._notify('fixed', [information], {bubbling: true});
    }

    protected _getStyle(): string {
        let
            offset: number = 0,
            container: HTMLElement,
            top: number,
            bottom: number,
            fixedPosition: POSITION,
            styles: CSSStyleDeclaration,
            style: string = '',
            minHeight: number;

        /**
         * On android and ios there is a gap between child elements.
         * When the header is fixed, there is a space between the container, relative to which it is fixed,
         * and the header, through which you can see the scrolled content. Its size does not exceed one pixel.
         * https://jsfiddle.net/tz52xr3k/3/
         *
         * As a solution, move the header up and increase its size by an offset, using padding.
         * In this way, the content of the header does not change visually, and the free space disappears.
         * The offset must be at least as large as the free space. Take the nearest integer equal to one.
         */
        if (this._isMobileAndroid) {
            offset = ANDROID_GAP_FIX_OFFSET;
        } else if (this._isMobilePlatform) {
            offset = MOBILE_GAP_FIX_OFFSET;
        }

        fixedPosition = this._model ? this._model.fixedPosition : undefined;

        if (this._options.position.indexOf(POSITION.top) !== -1 && this._stickyHeadersHeight.top !== null) {
            top = this._stickyHeadersHeight.top;

            if (this._context.stickyHeader) {
                top += this._context.stickyHeader.top;
            }

            style += 'top: ' + (top - (fixedPosition ? offset : 0)) + 'px;';
        }

        if (this._options.position.indexOf(POSITION.bottom) !== -1 && this._stickyHeadersHeight.bottom !== null) {
            bottom = this._stickyHeadersHeight.bottom;

            if (this._context.stickyHeader) {
                bottom += this._context.stickyHeader.bottom;
            }

            style += 'bottom: ' + (bottom - offset) + 'px;';
        }

        if (fixedPosition) {
            if (offset) {
                container = this._getNormalizedContainer();

                styles = this._getComputedStyle();
                minHeight = parseInt(styles.minHeight, 10);
                // Increasing the minimum height, otherwise if the content is less than the established minimum height,
                // the height is not compensated by padding and the header is shifted. If the minimum height is already
                // set by the style attribute, then do not touch it.
                if (styles.boxSizing === 'border-box' && minHeight && !container.style.minHeight) {
                    this._minHeight = minHeight + offset;
                }
                if (this._minHeight) {
                    style += 'min-height:' + this._minHeight + 'px;';
                }
                // Increase border or padding by offset.
                // If the padding or border is already set by the style attribute, then don't change it.
                if (this._reverseOffsetStyle === null) {
                    const borderWidth: number = parseInt(styles['border-' + fixedPosition + '-width'], 10);

                    if (borderWidth) {
                        this._reverseOffsetStyle = 'border-' + fixedPosition + '-width:' + (borderWidth + offset) + 'px;';
                    } else {
                        this._reverseOffsetStyle = 'padding-' + fixedPosition + ':' + (parseInt(styles.paddingTop, 10) + offset) + 'px;';
                    }
                }

                style += this._reverseOffsetStyle;
                style += 'margin-' + fixedPosition + ': -' + offset + 'px;';
            }

            style += 'z-index: ' + this._options.fixedZIndex + ';';
        }

        //убрать по https://online.sbis.ru/opendoc.html?guid=ede86ae9-556d-4bbe-8564-a511879c3274
        if (this._options.task1177692247 && this._options.fixedZIndex) {
            style += 'z-index: ' + this._options.fixedZIndex + ';';
        }

        return style;
    }

    protected _getObserverStyle(position: POSITION): string {
        // The top observer has a height of 1 pixel. In order to track when it is completely hidden
        // beyond the limits of the scrollable container, taking into account round-off errors,
        // it should be located with an offset of -3 pixels from the upper border of the container.
        let coord: number = this._stickyHeadersHeight[position] + 3;
        if (position === POSITION.top && this._options.offsetTop && this._options.shadowVisibility === SHADOW_VISIBILITY.visible) {
            coord += this._options.offsetTop;
        }

        // "bottom" and "right" styles does not work in list header control on ios 13. Use top instead.
        const container: HTMLElement = this._getNormalizedContainer();
        if (this._isSafari13 && position === POSITION.bottom) {
            return 'top: ' + (coord + (container ? container.offsetHeight : 0)) + 'px;';
        }

        return position + ': -' + coord + 'px;';
    }

    protected _updateBottomShadowStyle(): void {
        if (this._isSafari13) {
            const container: HTMLElement = this._getNormalizedContainer();
            // "bottom" and "right" styles does not work in list header control on ios 13. Use top instead.
            // There's no container at first building of template.
            if (container) {
                this._bottomShadowStyle = 'bottom: unset; right: unset; top:' + container.offsetHeight + 'px;' +
                    'width:' + container.offsetWidth + 'px;';
            }
        }
    }

    protected _updateStickyShadow(e, ids): void {
        const shadowVisible: boolean = ids.indexOf(this._index) !== -1;
        if (this._shadowVisible !== shadowVisible) {
            this._shadowVisible = shadowVisible;
            this._forceUpdate();
        }
    }

    protected _isShadowVisible(shadowPosition: POSITION): void {
        //The shadow from above is shown if the element is fixed from below, from below if the element is fixed from above.
        const fixedPosition: POSITION = shadowPosition === POSITION.top ? POSITION.bottom : POSITION.top;

        return !! ((this._context.stickyHeader?.shadowPosition &&
               this._context.stickyHeader.shadowPosition.indexOf(fixedPosition) !== -1) &&
            (this._model && this._model.fixedPosition === fixedPosition) &&
          this._options.shadowVisibility === SHADOW_VISIBILITY.visible &&
            (this._options.mode === MODE.stackable || this._shadowVisible));
    }

    private _getComputedStyle(): CSSStyleDeclaration {
        const container: HTMLElement = this._getNormalizedContainer();
        if (this._cssClassName !== container.className) {
            this._cssClassName = container.className;
            this._cachedStyles = getComputedStyle(container);
        }
        return this._cachedStyles;
    }

    private _getNormalizedContainer(): HTMLElement {
        //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        // There's no container at first building of template.
        if (!this._container) {
            return;
        }
        return this._container.get ? this._container.get(0) : this._container;
    }

    static _isSafari13(): boolean {
        // TODO remove after complete https://online.sbis.ru/opendoc.html?guid=14d98228-de34-4ad3-92a3-4d7fe8770097
        if (detection.safari) {
            const safariVersionMatching = detection.userAgent.match(/Version\/([0-9\.]*)/);
            if (safariVersionMatching) {
                return parseInt(safariVersionMatching[1], 10) >= 13;
            }
        }
        // Check chrome ang safari on ios 13.
        if (detection.isMobileIOS && detection.IOSVersion >= 13) {
            return true;
        }
        return false;
    }

    static contextTypes(): IStickyHeaderContext {
        return {
            stickyHeader: Context
        };
    }

    static getDefaultOptions(): IStickyHeaderOptions {
        return {
            //TODO: https://online.sbis.ru/opendoc.html?guid=a5acb7b5-dce5-44e6-aa7a-246a48612516
            fixedZIndex: 2,
            shadowVisibility: SHADOW_VISIBILITY.visible,
            backgroundVisible: true,
            mode: MODE.replaceable,
            position: POSITION.top
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            shadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.visible,
                SHADOW_VISIBILITY.hidden
            ]),
            backgroundVisible: descriptor(Boolean),
            mode: descriptor(String).oneOf([
                MODE.replaceable,
                MODE.stackable
            ]),
            position: descriptor(String).oneOf([
                'top',
                'bottom',
                'topbottom'
            ])
        };
    }

}
