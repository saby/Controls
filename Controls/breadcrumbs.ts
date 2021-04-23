/**
 * Библиотека контролов, которые служат для поддержки навигации, позволяющей  пользователю перейти c текущей страницы/документа на любой уровень вложенности.
 * @library Controls/breadcrumbs
 * @includes IBreadCrumbs Controls/_breadcrumbs/interface/IBreadCrumbs
 * @author Авраменко А. С.
 */

/*
 * Breadcrumbs library
 * @library Controls/breadcrumbs
 * @author Авраменко А. С.
 */
import ItemTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemTemplate');
import Container = require('wml!Controls/_breadcrumbs/WrappedContainer');

export {default as Path} from './_breadcrumbs/Path';
export {default as View} from './_breadcrumbs/View';
export {default as HeadingPath} from './_breadcrumbs/HeadingPath';
export {default as MultilinePath} from './_breadcrumbs/MultilinePath';
export {default as HeadingPathBack} from './_breadcrumbs/HeadingPath/Back';
export {default as HeadingPathCommon} from './_breadcrumbs/HeadingPath/Common';
export {
    ItemTemplate,
    Container
};
