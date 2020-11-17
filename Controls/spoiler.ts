/**
 * Библиотека контролов, отвечающих за отображение контента с возможностью переключения состояния развернутости.
 * @library Controls/spoiler
 * @includes Cut Controls/_spoiler/Cut
 * @includes ICutOptions Controls/_spoiler/Cut/ICutOptions
 * @includes View Controls/_spoiler/View
 * @includes IViewOptions Controls/_spoiler/IViewOptions
 * @includes Heading Controls/_spoiler/Heading
 * @includes IHeadingOptions Controls/_spoiler/IHeadingOptions
 * @includes ListCut Controls/_spoiler/ListCut
 * @includes IListCutOptions Controls/_spoiler/ListCut/IListCutOptions
 * @author Красильников А.С.
 */

export {default as Cut, ICutOptions} from 'Controls/_spoiler/Cut';
export {default as View, IView, IViewOptions} from 'Controls/_spoiler/View';
export {default as Heading, IHeading, IHeadingOptions} from 'Controls/_spoiler/Heading';
export {default as ListCut, IListCutOptions} from 'Controls/_spoiler/ListCut';
