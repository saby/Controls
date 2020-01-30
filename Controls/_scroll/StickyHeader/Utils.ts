import Env = require('Env/Env');
import getDimensions = require('Controls/Utils/getDimensions');

let lastId = 0;

export const enum POSITION {
    top = 'top',
    bottom = 'bottom'
}

export const enum MODE {
    stackable = 'stackable',
    replaceable = 'replaceable'
}

export type TRegisterEventData = {
   id: number;
   inst?: object;
   position?: string;
   mode?: string;
};

export interface IFixedEventData {
   id: number;
   fixedPosition: POSITION;
   prevPosition: POSITION;
   offsetHeight: number;
   mode: MODE;
}

export interface IOffset {
    top: number;
    bottom: number;
}

/**
 * The position property with sticky value is not supported in ie and edge lower version 16.
 * https://developer.mozilla.org/ru/docs/Web/CSS/position
 */
export function isStickySupport() {
   return !Env.detection.isIE || Env.detection.IEVersion > 15;
}

export function getNextId() {
   return lastId++;
}

export function _lastId() {
   return lastId - 1;
}

export function getOffset(parentElement: HTMLElement, element: HTMLElement, position: POSITION) {
   //TODO redo after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
   parentElement = (parentElement && parentElement.get) ? parentElement.get(0) : parentElement;
   element = (element && element.get) ? element.get(0) : element;

   let
       offset = getDimensions(element, true),
       parrentOffset = getDimensions(parentElement);
   if (position === 'top') {
      return offset.top - parrentOffset.top;
   } else {
      return parrentOffset.bottom - offset.bottom;
   }
}
