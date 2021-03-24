import SearchStrategy from './itemsStrategy/Search';
import { Model } from 'Types/entity';
import TreeItem from './TreeItem';
import Tree from './Tree';
import { Composer } from 'Controls/_display/itemsStrategy';

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

    protected _createComposer(): Composer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy, {
            dedicatedItemProperty: this._$dedicatedItemProperty,
            searchSeparatorModule: 'Controls/display:SearchSeparator',
            breadcrumbsItemModule: 'Controls/display:BreadcrumbsItem',
            treeItemDecoratorModule: 'Controls/display:TreeItemDecorator'
        });

        return composer;
    }
}

Object.assign(Search.prototype, {
    '[Controls/_display/Search]': true,
    _moduleName: 'Controls/display:Search',
    _$dedicatedItemProperty: undefined
});
