import {detection} from 'Env/Env';
import {getDimensions} from 'Controls/sizeUtils';

let lastId = 0;

export const enum POSITION {
    top = 'top',
    bottom = 'bottom'
}

export const enum SHADOW_VISIBILITY {
    visible = 'visible',
    hidden = 'hidden',
    lastVisible = 'lastVisible'
}

/**
 * @typedef {String} TYPE_FIXED_HEADERS
 * @variant initialFixed учитываются высоты заголовков которые были зафиксированы изначально
 * @variant fixed зафиксированные в данный момент заголовки
 * @variant allFixed высота всех заголовков, если бы они были зафиксированы
 */
export const enum TYPE_FIXED_HEADERS {
    initialFixed  = 'initialFixed',
    fixed = 'fixed',
    allFixed = 'allFixed'
}

export const enum MODE {
    stackable = 'stackable',
    replaceable = 'replaceable'
}

export type TRegisterEventData = {
   id: number;
   inst?: object;
   container: HTMLElement;
   position?: string;
   mode?: string;
   shadowVisibility: SHADOW_VISIBILITY;
};

export type IFixedEventData = {
   // Id заголовка
   id: number;
   // Позиция фиксации: сверху или снизу
   fixedPosition: POSITION;
   // Предыдущая позиция фиксации: сверху или снизу
   prevPosition: POSITION;
   // Высота заголовка
   offsetHeight: number;
   // Режим прилипания заголовка
   mode: MODE;
   // Отображение тени у заголовка
   shadowVisible: boolean;
    // Заголовок при прикреплении и откреплении стреляет событием fixed. При прикреплении (откреплении)
    // предыдущий заголовок по факту не открепляется (прикрепляется), а перекрывается заголовком сверху,
    // но нужно инициировать событие fixed, чтобы пользовательские контролы могли обработать случившееся.
    // Флаг устанавливается дабы исключить обработку этого события в StickyHeader/Group и StickyHeader/Controller.
   isFakeFixed: boolean;
};

export interface IOffset {
    top: number;
    bottom: number;
}

/**
 * The position property with sticky value is not supported in ie and edge lower version 16.
 * https://developer.mozilla.org/ru/docs/Web/CSS/position
 */
export function isStickySupport(): boolean {
   return !detection.isIE || detection.IEVersion > 15;
}

export function getNextId(): number {
   return lastId++;
}

export function _lastId(): number {
   return lastId - 1;
}

export function getOffset(parentElement: HTMLElement, element: HTMLElement, position: POSITION): number {
   //TODO redo after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
   parentElement = (parentElement && parentElement.get) ? parentElement.get(0) : parentElement;
   element = (element && element.get) ? element.get(0) : element;

   const
       offset = getDimensions(element),
       parrentOffset = getDimensions(parentElement);
   if (position === 'top') {
      return offset.top - parrentOffset.top;
   } else {
      return parrentOffset.bottom - offset.bottom;
   }
}

export function validateIntersectionEntries(entries: IntersectionObserverEntry[], rootContainer: HTMLElement): IntersectionObserverEntry[] {
    const newEntries: IntersectionObserverEntry[] = [];
    for (const entry: IntersectionObserverEntry of entries) {
        // После создания элемента иногда приходит событие с неправильными нулевыми размерами.
        // После этого, событий об изменении пересечения не происходит. Считаем размеры самостоятельно.
        if (entry.boundingClientRect.top === 0 && entry.boundingClientRect.bottom === 0 &&
            entry.boundingClientRect.height === 0) {
            const newEntry = {
                time: entry.time,
                rootBounds: rootContainer.getBoundingClientRect(),
                boundingClientRect: entry.target.getBoundingClientRect(),
                intersectionRect: entry.intersectionRect,
                intersectionRatio: entry.intersectionRatio,
                target: entry.target,
                isVisible: entry.isVisible
            };
            newEntry.isIntersecting = Math.max(newEntry.boundingClientRect.top, newEntry.rootBounds.top) <=
                    Math.min(newEntry.boundingClientRect.bottom, newEntry.rootBounds.bottom);
            newEntries.push(newEntry);
        } else {
            newEntries.push(entry);
        }
    }
    return newEntries;
}

const CONTENTS_STYLE: string = 'contents';

export function isHidden(element: HTMLElement): boolean {
    return !!element.closest('.ws-hidden');
}

// For android, use a large patch, because 1 pixel is not enough. For all platforms we use the minimum values since
// there may be layout problems if the headers will have paddings, margins, etc.
const
    ANDROID_GAP_FIX_OFFSET: number = 3,
    MOBILE_GAP_FIX_OFFSET: number = 1;

export function getGapFixSize(): number {
    let offset: number = 0;
    if (detection.isMobileAndroid) {
        offset = ANDROID_GAP_FIX_OFFSET;
    } else if (detection.isMobilePlatform) {
        offset = MOBILE_GAP_FIX_OFFSET;
    }
    return offset;
}
