import SearchStrategy from './itemsStrategy/Search';
import { Model } from 'Types/entity';
import TreeItem from './TreeItem';
import Tree from './Tree';
import { Composer } from 'Controls/_display/itemsStrategy';
import BreadcrumbsItem, {IOptions as IBreadcrumbsItemOptions} from './BreadcrumbsItem';
import SearchSeparator, {IOptions as ISearchSeparatorOptions} from './SearchSeparator';

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
export default class Search<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>> extends Tree<S, T> {
    /**
     * @cfg Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
     * выделены в обособленную цепочку
     * @name Controls/_display/Search#dedicatedItemProperty
     */
    protected _$dedicatedItemProperty: string;

    createBreadcrumbsItem(options: IBreadcrumbsItemOptions): BreadcrumbsItem {
        options.itemModule = 'Controls/display:BreadcrumbsItem';
        const item = this.createItem({ ...options});
        return item as any as BreadcrumbsItem;
    }

    createSearchSeparator(options: ISearchSeparatorOptions<S>): SearchSeparator<S> {
        options.itemModule = 'Controls/display:SearchSeparator';
        const item = this.createItem({ ...options });
        return item as any as SearchSeparator<S>;
    }

    protected _createComposer(): Composer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy, {
            display: this,
            dedicatedItemProperty: this._$dedicatedItemProperty,
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
