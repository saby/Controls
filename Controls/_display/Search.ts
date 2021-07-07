import Tree from './Tree';
import TreeItem from './TreeItem';
import SearchStrategy from './itemsStrategy/Search';
import ItemsStrategyComposer from './itemsStrategy/Composer';

/**
 * Проекция для режима поиска. Объединяет развернутые узлы в один элемент с "хлебной крошкой" внутри.
 * @class Controls/_display/Search
 * @extends Controls/_display/Tree
 * @public
 * @author Мальцев А.А.
 */
export default class Search<S, T extends TreeItem<S> = TreeItem<S>> extends Tree<S, T> {
    protected _createComposer(): ItemsStrategyComposer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy);

        return composer;
    }
}

Object.assign(Search.prototype, {
    _moduleName: 'Controls/display:Search',
    '[Controls/_display/Search]': true
});
