import * as getDimensions from 'Controls/Utils/getDimensions';

export function get(target: HTMLDivElement) {
    if (!target) {
        throw new Error('Target parameter is required');
    }

// todo https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
    if (target.get) {
        target = target.get(0);
    }

    /*
      There are two options how we can work if the target has display: contents:
      1) Don't allow such targets, and create an option like targetCoords in popups.
      Then everyone would calculate coordinates of the target and pass them.
      2) Calculate boundingClientRect of such targets based on content.

      I've chosen option 2 because it's less error-prone and doesn't have real drawbacks.
    */
    const box = getDimensions(target);
    const top: number = box.top;
    const left: number = box.left;
    const bottom: number = box.bottom;
    const right: number = box.right;
    const fullTopOffset: number =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0 -
        document.documentElement.clientTop || document.body.clientTop || 0;
    const fullLeftOffset: number =
        window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0 -
        document.documentElement.clientLeft || document.body.clientLeft || 0;

    return {
        top: top + fullTopOffset,
        bottom: bottom + fullTopOffset,
        left: left + fullLeftOffset,
        right: right + fullLeftOffset,
        width: box.width,
        height: box.height,
        topScroll: fullTopOffset,
        leftScroll: fullLeftOffset,
        boundingClientRect: box
    };
}
