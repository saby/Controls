/**
 * Библиотека контролов, которые предназначены для отображения заголовков и декоративных элементов в заголовках.
 * Сложные заголовки включают весь перечисленный функционал. Они формируются путём композиции контролов, входящих в состав библиотек {@link Controls/heading:Title}, {@link Controls/heading:Separator} и {@link Controls/heading:Counter}.
 * Подробнее о работе с заголовками читайте в <a href='/doc/platform/developmentapl/interface-development/controls/content-managment/heading/'>руководстве разработчика</a>.
 * @library Controls/heading
 * @public
 * @author Крайнов Д.О.
 */

/*
 * heading library
 * @library Controls/heading
 * @public
 * @author Крайнов Д.О.
 */

export {default as Title} from './_heading/Heading';
export {default as Back} from './_heading/Back';
export {default as Separator} from './_heading/Separator';
export {default as Counter} from './_heading/Counter';
export * from './_heading/_ActualAPI';
