import Tree, {IOptions as ITreeOptions} from './Tree';
import TreeItem from './TreeItem';
import SearchStrategy from './itemsStrategy/Search';
import ItemsStrategyComposer from './itemsStrategy/Composer';

export interface IOptions<S, T> extends ITreeOptions<S, T> {
    dedicatedItemProperty?: string;
}

/**
 * Проекция для режима поиска. Объединяет развернутые узлы в один элемент с "хлебной крошкой" внутри.
 * @class Controls/_display/Search
 * @extends Controls/_display/Tree
 * @public
 * @author Мальцев А.А.
 */
export default class Search<S, T extends TreeItem<S> = TreeItem<S>> extends Tree<S, T> {
    /**
     * @cfg Имя свойства элемента хлебных крошек, хранящее признак того, что этот элемент и путь до него должны быть
     * выделены в обособленную цепочку
     * @name Controls/_display/Search#dedicatedItemProperty
     */
    protected _$dedicatedItemProperty: string;

    constructor(options?: IOptions<S, T>) {
        super(options);
    }

    protected _createComposer(): ItemsStrategyComposer<S, T> {
        const composer = super._createComposer();
        composer.append(SearchStrategy, {
            dedicatedItemProperty: this._$dedicatedItemProperty
        });

        return composer;
    }
}

Object.assign(Search.prototype, {
    _moduleName: 'Controls/display:Search',
    '[Controls/_display/Search]': true,
    _$dedicatedItemProperty: undefined
});
