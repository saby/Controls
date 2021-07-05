import {Control} from 'UI/Base';
import {POSITION, TYPE_FIXED_HEADERS} from "../Utils";
import { goUpByControlTree } from 'UI/NodeCollector';
import {IControl} from 'UICommon/interfaces';

const STICKY_CONTROLLER_SELECTOR: string = '.controls-Scroll';
const STICKY_CONTROLLER_MODULE_NAME: string = 'Controls/scroll:Container';

export function getHeadersHeight(element: HTMLElement, position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
   var controlsElement: HTMLElement = element.closest(STICKY_CONTROLLER_SELECTOR);
   if (!controlsElement) {
      return 0;
   }
   const controls = goUpByControlTree(controlsElement);
   return controls.find((control: IControl) => {
      return control._moduleName === STICKY_CONTROLLER_MODULE_NAME;
   }).getHeadersHeight(position, type);
}
