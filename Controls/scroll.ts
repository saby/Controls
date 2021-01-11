/**
 * Библиотека контролов, которые позволяют организовать скроллирование областей. Содержит контейнер для скроллирования и механизм фиксации заголовков.
 * @library Controls/scroll
 * @includes Container Controls/_scroll/Container
 * @includes StickyHeader Controls/_scroll/StickyHeader
 * @includes HotKeysContainer Controls/_scroll/HotKeysContainer
 * @includes IntersectionObserverController Controls/_scroll/IntersectionObserver/Controller
 * @includes IntersectionObserverContainer Controls/_scroll/IntersectionObserver/Container
 * @includes Group Controls/_scroll/StickyHeader/Group
 * @includes IScrollbars Controls/_scroll/Container/Interface/IScrollbars
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Search library
 * @library Controls/scroll
 * @includes Container Controls/_scroll/Container
 * @includes StickyHeader Controls/_scroll/StickyHeader
 * @includes HotKeysContainer Controls/_scroll/HotKeysContainer
 * @includes IntersectionObserverController Controls/_scroll/IntersectionObserver/Controller
 * @includes IntersectionObserverContainer Controls/_scroll/IntersectionObserver/Container
 * @includes Group Controls/_scroll/StickyHeader/Group
 * @includes IScrollbars Controls/_scroll/Container/Interface/IScrollbars
 * @public
 * @author Крайнов Д.О.
 */

import Container from 'Controls/_scroll/Container';
export {default as StickyHeader} from 'Controls/_scroll/StickyHeader';
export {scrollToElement} from 'Controls/_scroll/Utils/scrollToElement';
export {hasScrollbar} from './_scroll/Utils/HasScrollbar';
export {hasHorizontalScroll} from './_scroll/Utils/hasHorizontalScroll';
export {IScrollbars} from './_scroll/Container/Interface/IScrollbars';
export {IShadows} from './_scroll/Container/Interface/IShadows';
export {getScrollbarWidth, getScrollbarWidthByMeasuredBlock} from './_scroll/Utils/getScrollbarWidth';
import _Scrollbar = require('Controls/_scroll/Scroll/Scrollbar');
import _scrollContext = require('Controls/_scroll/Scroll/Context');
import _stickyHeaderContext = require('Controls/_scroll/StickyHeader/Context');
import _stickyHeaderController from 'Controls/_scroll/StickyHeader/Controller';
import IntersectionObserverController from 'Controls/_scroll/IntersectionObserver/Controller';
import IntersectionObserverContainer from 'Controls/_scroll/IntersectionObserver/Container';
import EdgeIntersectionObserver from 'Controls/_scroll/IntersectionObserver/EdgeIntersectionObserver';
import EdgeIntersectionObserverContainer from 'Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer';
import IntersectionObserverSyntheticEntry from 'Controls/_scroll/IntersectionObserver/SyntheticEntry';
import _ContainerBase from 'Controls/_scroll/ContainerBase';
import VirtualScrollContainer from 'Controls/_scroll/VirtualScrollContainer';
import {SHADOW_VISIBILITY} from 'Controls/_scroll/Container/Interface/IShadows';

import Group from 'Controls/_scroll/StickyHeader/Group';
import {isStickySupport, getNextId as getNextStickyId, getOffset as getStickyOffset} from 'Controls/_scroll/StickyHeader/Utils';
import {getHeadersHeight as getStickyHeadersHeight} from 'Controls/_scroll/StickyHeader/Utils/getHeadersHeight';
import HotKeysContainer from 'Controls/_scroll/HotKeysContainer';

export {
   Container,
   _Scrollbar,
   _scrollContext,
   _stickyHeaderContext,
   _stickyHeaderController,
   isStickySupport,
   getNextStickyId,
   getStickyOffset,
   getStickyHeadersHeight,
   Group,
   HotKeysContainer,
   IntersectionObserverController,
   IntersectionObserverContainer,
   EdgeIntersectionObserver,
   EdgeIntersectionObserverContainer,
   IntersectionObserverSyntheticEntry,
   VirtualScrollContainer,
   _ContainerBase,
   SHADOW_VISIBILITY
};
