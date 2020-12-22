/**
 * Библиотека, которая предоставляет функционал для работы драг'н'дроп в списках
 * @library Controls/listDragNDrop
 * @includes Controller Controls/_listDragNDrop/Controller
 * @public
 * @author Панихин К.А.
 */
import Controller from 'Controls/_listDragNDrop/Controller';
import Flat from 'Controls/_listDragNDrop/strategies/Flat';
import Tree from 'Controls/_listDragNDrop/strategies/Tree';

export * from 'Controls/_listDragNDrop/interface';

export {
   Controller as DndController,
   Flat as FlatStrategy,
   Tree as TreeStrategy
};
