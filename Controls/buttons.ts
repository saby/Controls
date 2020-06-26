/**
 * Библиотека контролов, отвечающих за отображение разных вариантов кнопок. Также библиотека содержит публичные интерфейсы, необходимые для работы кнопок.
 * @library Controls/buttons
 * @includes Button Controls/_buttons/Button
 * @includes ArrowButton Controls/_buttons/ArrowButton
 * @includes IHref Controls/_buttons/interface/IHref
 * @includes IClick Controls/_buttons/interface/IClick
 * @includes IButton Controls/_buttons/interface/IButton
 * @includes IArrowButton Controls/_buttons/interface/IArrowButton
 * @author Красильников А.С.
 */

import * as ButtonTemplate from 'wml!Controls/_buttons/ButtonBase';

export {default as Button, cssStyleGeneration, IViewMode} from './_buttons/Button';
export {default as ArrowButton} from './_buttons/ArrowButton';
export {default as ActualApi} from './_buttons/ActualApi';
export {IHref as IHref} from './_buttons/interface/IHref';
export {IClick as IClick} from './_buttons/interface/IClick';
export {IButton as IButton} from './_buttons/interface/IButton';
export {IButtonOptions as IButtonOptions} from './_buttons/interface/IButton';
export {ButtonTemplate};
