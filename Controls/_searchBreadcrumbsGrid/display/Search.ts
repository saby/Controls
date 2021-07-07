import SearchStrategy from './strategies/Search';
import { itemsStrategy, Tree, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

export interface IOptions<S, T> {
    dedicatedItemProperty?: string;
}

/**
 * Проекция для режима поиска. Объединяет развернутые узлы в один элемент с "хлебной крошкой" внутри.
 * @class Controls/_display/Search
 * @extends Controls/_display/Tree
 * @public
 * @author Мальцев А.А.
 */
export default class Search<S extends Model, T extends TreeItem<S> = TreeItem<S>> extends Tree<S, T> {
    /**
     * @cfg Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
     * выделены в обособленную цепочку
     * @name Controls/_display/Search#dedicatedItemProperty
     */
    protected _$dedicatedItemProperty: string;

    protected _createComposer(): itemsStrategy.Composer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy, {
            dedicatedItemProperty: this._$dedicatedItemProperty
        });

        return composer;
    }
}

Object.assign(Search.prototype, {
    _moduleName: 'Controls/searchBreadcrumbsGrid:Search',
    '[Controls/_display/Search]': true,
    _$dedicatedItemProperty: undefined
});
