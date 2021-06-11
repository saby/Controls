/**
 * Библиотека контролов, которые реализуют перемещение элементов при помощи курсора мыши.
 * @library
 * @includes Container Controls/_dragnDrop/Container
 * @includes Controller Controls/_dragnDrop/Controller
 * @includes DraggingTemplate Controls/_dragnDrop/DraggingTemplate
 * @includes Entity Controls/_dragnDrop/Entity
 * @includes ItemsEntity Controls/_dragnDrop/Entity/Items
 * @includes ResizingLine Controls/_dragnDrop/ResizingLine
 * @public
 * @author Авраменко А.С.
 */

/*
 * dragnDrop library
 * @library
 * @includes Container Controls/_dragnDrop/Container
 * @includes Controller Controls/_dragnDrop/Controller
 * @includes DraggingTemplate Controls/_dragnDrop/DraggingTemplate
 * @includes Entity Controls/_dragnDrop/Entity
 * @includes ItemsEntity Controls/_dragnDrop/Entity/Items
 * @includes ResizingLine Controls/_dragnDrop/ResizingLine
 * @includes IDragObject Controls/_dragnDrop/Container/IDragObject.typedef
 * @public
 * @author Авраменко А.С.
 */

export {default as ControllerClass} from 'Controls/_dragnDrop/ControllerClass';
export {default as Container, IDragObject} from 'Controls/_dragnDrop/Container';
export {default as DraggingTemplate} from 'Controls/_dragnDrop/DraggingTemplate';
export {default as Controller} from 'Controls/_dragnDrop/Controller';
export {default as ResizingLine} from 'Controls/_dragnDrop/ResizingLine';
export {default as Compound} from 'Controls/_dragnDrop/Controller/Compound';
export {default as ListItems} from 'Controls/_dragnDrop/Entity/List/Items';
export {default as Entity} from 'Controls/_dragnDrop/Entity';
export {default as ItemsEntity} from 'Controls/_dragnDrop/Entity/Items';
export {default as ItemEntity} from 'Controls/_dragnDrop/Entity/Item';
export {IResizingLine} from 'Controls/_dragnDrop/interface/IResizingLine';

import DraggingTemplateWrapper = require('wml!Controls/_dragnDrop/DraggingTemplateWrapper');
export {
   DraggingTemplateWrapper
};
