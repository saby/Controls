'use strict';

function getVisibleChildren(element : HTMLElement) : Array<HTMLElement> {
    return Array.prototype.filter.call(element.children, function(child: HTMLElement) {
        // https://drafts.csswg.org/cssom-view/#dom-htmlelement-offsetparent
        // offsetParent is null if:
        // 1) Either element or any of its parents is hidden via display style property
        // 2) The element’s computed value of the position property is fixed.
        // 3) It's either root or <body> element.
        // We don't care about the third case here, since it's a very rare case, and it's not very useful to get visible children of a root element anyway.
        if (child.offsetParent !== null) {
            return child;
        }
        if (window.getComputedStyle(child).display !== 'none') {
            return child;
        }
    });
}

function getBoundingClientRect(element: HTMLElement, clear?: boolean, canUseGetDimensions?: boolean): ClientRect {
    let position;

    // To calculate the actual position of the 'position: sticky' element in the layout,
    // set the style position to 'static'
    if (clear && getComputedStyle(element).position === 'sticky') {
        position = element.style.position;
        element.style.position = 'static';
    }
    const clientRect: ClientRect = canUseGetDimensions && getComputedStyle(element).display === 'contents' ? getDimensions(element, clear) : element.getBoundingClientRect();
    if (clear && position !== undefined) {
        element.style.position = position;
    }
    return clientRect;
}

/**
 * Returns the size of an element and its position relative to the viewport. Should be used when the element may have display: contents, but you still want to get its real size and position.
 * The function makes certain assumptions about the element if it has display: contents:
 * 1) The element is not a root element.
 * 2) The children of the element have the same height.
 * 3) The element doesn't have absolutely or stickily positioned children.
 * @param {HTMLElement} element
 * @param {Boolean} clear If the clear parameter is passed, then function returns the position of the element
 * as if it were in layout and 'position: sticky' styles do not act on it.
 * @returns {ClientRect}
 */
 const getDimensions = function(element: HTMLElement, clear?: boolean): ClientRect {
    let dimensions : ClientRect = getBoundingClientRect(element, clear);

    if (dimensions.width !== 0 || dimensions.height !== 0) {
        return dimensions;
    }

    const visibleChildren = getVisibleChildren(element);

    if (visibleChildren.length === 0) {
        return dimensions;
    }

    const firstChildDimensions = getBoundingClientRect(visibleChildren[0], clear, true);
    const lastChildDimensions = getBoundingClientRect(visibleChildren[visibleChildren.length - 1], clear, true);

    dimensions = {
        width: lastChildDimensions.right - firstChildDimensions.left,
        height: lastChildDimensions.height,
        top: firstChildDimensions.top,
        right: lastChildDimensions.right,
        bottom: firstChildDimensions.bottom,
        left: firstChildDimensions.left
    };

    return dimensions;
}

export = getDimensions;
