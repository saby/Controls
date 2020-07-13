import {Control} from 'UI/Base';
import {POSITION, TYPE_FIXED_HEADERS} from "../Utils";

interface ControlNode {
   control: Control
}

interface ControlHTMLElement extends HTMLElement {
   controlNodes: ControlNode[]
}

const STICKY_CONTROLLER_SELECTOR: string = '.controls-Scroll';
const STICKY_CONTROLLER_MODULE_NAME: string = 'Controls/scroll:Container';

export function getHeadersHeight(element: HTMLElement, position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
   var controlsElement: ControlHTMLElement = element.closest(STICKY_CONTROLLER_SELECTOR);
   if (!controlsElement) {
      return 0;
   }
   return controlsElement.controlNodes.find((control: ControlNode) => {
      return control.control._moduleName === STICKY_CONTROLLER_MODULE_NAME;
   }).control.getHeadersHeight(position, type);
}