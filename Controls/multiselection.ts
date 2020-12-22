/**
 * Библиотека, которая предоставляет функционал для множественного выбора
 * @library Controls/multiselection
 * @public
 * @author Панихин К.А.
 */

import { Controller as SelectionController } from 'Controls/_multiselection/Controller';
import { FlatSelectionStrategy } from 'Controls/_multiselection/SelectionStrategy/Flat';
import { TreeSelectionStrategy } from 'Controls/_multiselection/SelectionStrategy/Tree';
import { default as ISelectionStrategy } from 'Controls/_multiselection/SelectionStrategy/ISelectionStrategy';
import {
   ISelectionItem,
   ISelectionModel,
   ISelectionControllerOptions,
   IFlatSelectionStrategyOptions,
   ITreeSelectionStrategyOptions,
   ISelectionDifference
} from 'Controls/_multiselection/interface';

export {
   ISelectionItem,
   SelectionController,
   ISelectionControllerOptions,
   ISelectionDifference,
   ISelectionModel,
   ISelectionStrategy,
   FlatSelectionStrategy,
   IFlatSelectionStrategyOptions,
   TreeSelectionStrategy,
   ITreeSelectionStrategyOptions
};
