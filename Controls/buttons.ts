/**
 * Библиотека контролов, отвечающих за отображение разных вариантов кнопок. Также библиотека содержит публичные интерфейсы, необходимые для работы кнопок.
 * @library Controls/buttons
 * @author Красильников А.С.
 */

import * as ButtonTemplate from 'wml!Controls/_buttons/ButtonBase';

export {default as Button, cssStyleGeneration, simpleCssStyleGeneration, IViewMode, defaultHeight, defaultFontColorStyle, getDefaultOptions} from './_buttons/Button';
export {default as ArrowButton} from './_buttons/ArrowButton';
export {default as ActualApi} from './_buttons/ActualApi';
export {IClick as IClick} from './_buttons/interface/IClick';
export {IButton as IButton} from './_buttons/interface/IButton';
export {IButtonOptions as IButtonOptions} from './_buttons/interface/IButton';
export {ButtonTemplate};
