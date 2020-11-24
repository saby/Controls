import CollectionItem, {
    IOptions as ICollectionItemOptions,
    ISerializableState as ICollectionItemSerializableState
} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import BreadcrumbsItem from './BreadcrumbsItem';
import Tree from './Tree';
import {mixin} from 'Types/util';
import TreeChildren from './TreeChildren';
import { TemplateFunction } from 'wasaby-cli/store/_repos/saby-ui/UI/Base';

export interface IOptions<T> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
    owner?: Tree<T>;
    node?: boolean;
    childrenProperty?: string;
    hasChildren?: boolean;
    loaded?: boolean;
    parent?: TreeItem<T> | BreadcrumbsItem<T>;
}

interface ISerializableState<T> extends ICollectionItemSerializableState<T> {
    $options: IOptions<T>;
}

/**
 * Элемент древовидной коллеции
 * @class Controls/_display/TreeItem
 * @extends Controls/_display/CollectionItem
 * @mixes Controls/_display/ExpandableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class TreeItem<T> extends mixin<
    CollectionItem<any>,
    ExpandableMixin
    >(
    CollectionItem,
    ExpandableMixin
) {
    protected _$owner: Tree<T>;

    /**
     * Родительский узел
     */
    protected _$parent: TreeItem<T> | BreadcrumbsItem<T>;

    /**
     * Является узлом
     */
    protected _$node: boolean;

    /**
     * Есть ли дети у узла.
     */
    protected _$hasChildren: boolean;

    /**
     * Название свойства, содержащего дочерние элементы узла. Используется для анализа на наличие дочерних элементов.
     */
    protected _$childrenProperty: string;

    /**
     * Шаблон экспандера
     */
    protected _$expanderTemplate: TemplateFunction;

    /**
     * Иконка экспандера
     */
    protected _$expanderIcon: string;

    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    /**
     * Позиция экспандера
     */
    protected _$expanderPosition: string;

    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);

        this._$node = !!this._$node;
        if (this._$node) {
            this._$hasChildren = true;
        }
        if (options && options.hasChildren !== undefined) {
            this._$hasChildren = !!options.hasChildren;
        }
    }

    // region Public methods

    getOwner(): Tree<T> {
        return super.getOwner() as Tree<T>;
    }

    setOwner(owner: Tree<T>): void {
        super.setOwner(owner);
    }

    /**
     * Возвращает родительский узел
     */
    getParent(): TreeItem<T> {
        return this._$parent as TreeItem<T>;
    }

    /**
     * Устанавливает родительский узел
     * @param parent Новый родительский узел
     */
    setParent(parent: TreeItem<T>): void {
        this._$parent = parent;
    }

    /**
     * Возвращает корневой элемент дерева
     */
    getRoot(): TreeItem<T> {
        const parent = this.getParent();
        if (parent === this) {
            return;
        }
        return parent ? parent.getRoot() : this;
    }

    /**
     * Является ли корнем дерева
     */
    isRoot(): boolean {
        return !this.getParent();
    }

    /**
     * Возвращает уровень вложенности относительно корня
     */
    getLevel(): number {
        // If this is not a root then increase parent's level
        const parent = this._$parent;
        if (parent) {
            let parentLevel = 0;
            if (parent instanceof TreeItem) {
                parentLevel = parent.getLevel();
            } else if (parent instanceof BreadcrumbsItem) {
                parentLevel = parent.getLevel();
            }
            return parentLevel + 1;
        }

        // If this is a root then get its level from owner
        const owner = this.getOwner();
        return owner ? owner.getRootLevel() : 0;
    }

    /**
     * Возвращает признак, является ли элемент узлом
     */
    isNode(): boolean {
        return this._$node;
    }

    /**
     * Устанавливает признак, является ли элемент узлом
     * @param node Является ли элемент узлом
     */
    setNode(node: boolean): void {
        this._$node = node;
    }

    /**
     * Возвращает признак наличия детей у узла
     */
    isHasChildren(): boolean {
        return this._$hasChildren;
    }

    /**
     * Устанавливает признак наличия детей у узла
     */
    setHasChildren(value: boolean): void {
        this._$hasChildren = value;
    }

    /**
     * Возвращает название свойства, содержащего дочерние элементы узла
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    /**
     * Возвращает коллекцию потомков элемента коллекции
     * @param [withFilter=true] Учитывать {@link Controls/display:Collection#setFilter фильтр}
     */
    getChildren(withFilter: boolean = true): TreeChildren<T> {
        return this.getOwner().getChildren(this, withFilter);
    }

    // TODO удалить
    isDrawExpander() {
        return true;
    }

    // TODO удалить
    shouldDrawExpanderPadding() {
        return false;
    }

    getExpanderTemplate(expanderTemplate: TemplateFunction): TemplateFunction {
        return expanderTemplate || this._$expanderTemplate;
    }

    getExpanderIcon(expanderIcon: string): string {
        return expanderIcon || this._$expanderIcon;
    }

    getExpanderSize(expanderSize: string): string {
        return expanderSize || this._$expanderSize;
    }

    getExpanderPosition(): string {
        return this._$expanderPosition;
    }

    getExpanderClasses(itemData: TreeItem<T>, tmplExpanderIcon: string, tmplExpanderSize: string, theme: string, style: string = 'default'): string {
        const expanderIcon = itemData.getExpanderIcon(tmplExpanderIcon);
        const expanderSize = itemData.getExpanderSize(tmplExpanderSize);
        const expanderPosition = itemData.getExpanderPosition();

        let expanderClasses = `controls-TreeGrid__row-expander_theme-${theme}`;
        let expanderIconClass = '';

        if (expanderPosition !== 'right') {
            expanderClasses += ` controls-TreeGrid__row_${style}-expander_size_${(expanderSize || 'default')}_theme-${theme} `;
        } else {
            expanderClasses += ` controls-TreeGrid__row_expander_position_right_theme-${theme} `;
        }
        expanderClasses += 'js-controls-ListView__notEditable';

        // TODO взять откуда-то отступы
/*        expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_${itemData.itemPadding.top}_theme-${theme}`;
        expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_${itemData.itemPadding.bottom}_theme-${theme}`;*/

        expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_default_theme-${theme}`;
        expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_default_theme-${theme}`;

        if (expanderIcon) {
            expanderIconClass = ' controls-TreeGrid__row-expander_' + expanderIcon;
            expanderClasses += expanderIconClass;

            // могут передать node или hiddenNode в этом случае добавляем наши классы для master/default
            if ((expanderIcon === 'node') || (expanderIcon === 'hiddenNode') || (expanderIcon === 'emptyNode')) {
                expanderIconClass += '_' + (style === 'master' || style === 'masterClassic' ? 'master' : 'default');
            }
        } else {
            expanderIconClass = ' controls-TreeGrid__row-expander_' + (itemData.isNode() ? 'node_' : 'hiddenNode_')
                + (style === 'master' || style === 'masterClassic' ? 'master' : 'default');
        }

        expanderClasses += expanderIconClass + `_theme-${theme}`;

        // добавляем класс свертнутости развернутости для тестов
        expanderClasses += ' controls-TreeGrid__row-expander' + (itemData.isExpanded ? '_expanded' : '_collapsed');
        // добавляем класс свертнутости развернутости стилевой
        expanderClasses += expanderIconClass + (itemData.isExpanded ? '_expanded' : '_collapsed') + `_theme-${theme}`;

        return expanderClasses;
    }

    // region SerializableMixin

    _getSerializableState(state: ICollectionItemSerializableState<T>): ISerializableState<T> {
        const resultState = super._getSerializableState(state) as ISerializableState<T>;

        // It's too hard to serialize context related method. It should be restored at class that injects this function.
        if (typeof resultState.$options.parent === 'function') {
            delete resultState.$options.parent;
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState<T>): Function {
        const fromSuper = super._setSerializableState(state);
        return function(): void {
            fromSuper.call(this);
        };
    }

    // endregion

    // region Protected methods

    /**
     * Генерирует событие у владельца об изменении свойства элемента.
     * Помимо родительской коллекции уведомляет также и корневой узел дерева.
     * @param property Измененное свойство
     * @protected
     */
    protected _notifyItemChangeToOwner(property: string): void {
        super._notifyItemChangeToOwner(property);

        const root = this.getRoot();
        const rootOwner = root ? root.getOwner() : undefined;
        if (rootOwner && rootOwner !== this._$owner) {
            rootOwner.notifyItemChange(this, {property});
        }
    }

    // endregion
}

Object.assign(TreeItem.prototype, {
    '[Controls/_display/TreeItem]': true,
    _moduleName: 'Controls/display:TreeItem',
    _$parent: undefined,
    _$node: false,
    _$expanded: false,
    _$hasChildren: false,
    _$childrenProperty: '',
    _$expanderTemplate: null,
    _$expanderIcon: '',
    _$expanderSize: 's',
    _$expanderPosition: 'default',
    _instancePrefix: 'tree-item-'
});
