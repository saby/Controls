/**
 * Библиотека контролов, которые реализуют перемещение элементов при помощи курсора мыши.
 * @library Controls/dragnDrop
 * @includes DraggingTemplate Controls/_dragnDrop/DraggingTemplate
 * @public
 * @author Авраменко А.С.
 */

/*
 * dragnDrop library
 * @library Controls/dragnDrop
 * @includes DraggingTemplate Controls/_dragnDrop/DraggingTemplate
 * @public
 * @author Авраменко А.С.
 */

import ControllerClass from 'Controls/_dragnDrop/ControllerClass';
import DraggingTemplate = require('Controls/_dragnDrop/DraggingTemplate');
import Entity from 'Controls/_dragnDrop/Entity';
import ItemsEntity from 'Controls/_dragnDrop/Entity/Items';
import ItemEntity from 'Controls/_dragnDrop/Entity/Item';

import Compound = require('Controls/_dragnDrop/Controller/Compound');
import DraggingTemplateWrapper = require('wml!Controls/_dragnDrop/DraggingTemplateWrapper');
import ListItems from 'Controls/_dragnDrop/Entity/List/Items';
export {default as Controller} from 'Controls/_dragnDrop/Controller';
export {default as ResizingLine} from 'Controls/_dragnDrop/ResizingLine';
export {default as Container, IDragObject} from 'Controls/_dragnDrop/Container';

export {
   ControllerClass,
   DraggingTemplate,
   Entity,
   ItemsEntity,
   ItemEntity,

   Compound,
   DraggingTemplateWrapper,
   ListItems
};
