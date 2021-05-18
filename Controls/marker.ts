/**
 * Библиотека, которая предоставляет функционал для отметки {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
 * @library Controls/marker
 * @public
 * @includes IMarkerList Controls/_marker/interface/IMarkerList
 * @author Панихин К.А.
 */

import { Controller as MarkerController } from 'Controls/_marker/Controller';
import {TVisibility, Visibility, IMarkerListOptions} from 'Controls/_marker/interface';
import { default as MultiColumnStrategy } from 'Controls/_marker/strategy/MultiColumn';
import { default as SingleColumnStrategy } from 'Controls/_marker/strategy/SingleColumn';

export { MarkerController, TVisibility, Visibility, IMarkerListOptions, MultiColumnStrategy, SingleColumnStrategy };
