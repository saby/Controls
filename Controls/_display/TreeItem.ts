import CollectionItem, {
    IOptions as ICollectionItemOptions,
    ISerializableState as ICollectionItemSerializableState
} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import Tree from './Tree';
import {mixin} from 'Types/util';
import TreeChildren from './TreeChildren';
import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import IGroupNode from './interface/IGroupNode';

export interface IOptions<T extends Model> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
    owner?: Tree<T>;
    node?: boolean;
    childrenProperty?: string;
    hasChildren?: boolean;
    loaded?: boolean;
    parent?: TreeItem<T>;
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
export default class TreeItem<T extends Model = Model> extends mixin<
    CollectionItem<any>,
    ExpandableMixin
    >(
    CollectionItem,
    ExpandableMixin
) implements IGroupNode {
    protected _$owner: Tree<T>;

    /**
     * Родительский узел
     */
    protected _$parent: TreeItem<T>;

    /**
     * Является узлом
     * @remark true - узел, false - 'скрытый' узел, null - лист
     */
    protected _$node: boolean|null;

    /**
     * Есть ли дети у узла.
     */
    protected _$hasChildren: boolean;
    protected _$hasChildrenByRecordSet: boolean;

    /**
     * Название свойства, содержащего дочерние элементы узла. Используется для анализа на наличие дочерних элементов.
     */
    protected _$childrenProperty: string;

    /**
     * Признак, означающий что в списке есть узел с детьми
     */
    protected _$hasNodeWithChildren: boolean;

    /**
     * Признак, что узел является целью при перетаскивании
     * @private
     */
    private _isDragTargetNode: boolean = false;

    constructor(options: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);

        // node может быть равен null, поэтому его не задали, только когда undefined
        if (this._$node === undefined) {
            this._$node = null;
        }

        // Если hasChildren не задали, то для узла по дефолту есть дети
        if (options && options.hasChildren === undefined) {
            this._$hasChildren = this._$node || this._$node === false;
        } else if (options) {
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
        if (this._$parent !== parent) {
            this._$parent = parent;
            this._nextVersion();
        }
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
            } else if (parent['[Controls/_display/BreadcrumbsItem]']) {
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
     * TODO нужен параметр или метод, который будет возвращать для узлов и скрытых узлов true, а для листьев false. Сейчас листья это null
     */
    isNode(): boolean|null {
        return this._$node;
    }

    /**
     * Устанавливает признак, является ли элемент узлом
     * @param node Является ли элемент узлом
     */
    setNode(node: boolean|null): void {
        this._$node = node;
    }

    /**
     * Возвращает признак, является ли элемент узлом-группой
     */
    isGroupNode(): boolean {
        return false;
    }

    /**
     * Устанавливаем признак, что узел является целью при перетаскивании
     * @param isTarget Является ли узел целью при перетаскивании
     */
    setDragTargetNode(isTarget: boolean): void {
        if (this._isDragTargetNode !== isTarget) {
            this._isDragTargetNode = isTarget;
            this._nextVersion();
        }
    }

    /**
     * Возвращает признак, что узел является целью при перетаскивании
     */
    isDragTargetNode(): boolean {
        return this._isDragTargetNode;
    }

    /**
     * Возвращает признак наличия детей у узла
     */
    isHasChildren(): boolean {
        return this._$hasChildren;
    }

    isHasChildrenByRecordSet(): boolean {
        return this._$hasChildrenByRecordSet;
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

    hasMoreStorage(): boolean {
        const hasMoreStorage = this._$owner.getHasMoreStorage();
        return !!(hasMoreStorage && hasMoreStorage[this.getContents().getKey()]);
    }

    // TODO есть ExpandableMixin, иконку тоже наверное нужно туда перенести
    //  он используется для группы, но можно от него унаследоваться и расширить вот этим кодом
    // region Expandable

    getExpanderTemplate(expanderTemplate?: TemplateFunction): TemplateFunction {
        return this._$owner.getExpanderTemplate(expanderTemplate);
    }

    getExpanderIcon(expanderIcon?: string): string {
        return expanderIcon || this._$owner.getExpanderIcon();
    }

    getExpanderSize(expanderSize?: string): string {
        return expanderSize || this._$owner.getExpanderSize();
    }

    setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
        if (this._$hasNodeWithChildren !== hasNodeWithChildren) {
            this._$hasNodeWithChildren = hasNodeWithChildren;
            this._nextVersion();
        }
    }

    hasNodeWithChildren(): boolean {
        return this._$hasNodeWithChildren;
    }

    shouldDisplayExpander(expanderIcon?: string, position: 'default'|'right' = 'default'): boolean {
        if (this.getExpanderIcon(expanderIcon) === 'none' || this.isNode() === null) {
            return false;
        }

        const correctPosition = this.getOwner().getExpanderPosition() === position;
        const hasChildren = this.getOwner().getHasChildrenProperty() ? this.isHasChildren() : this._$hasChildrenByRecordSet;
        return (this._$owner.getExpanderVisibility() === 'visible' || hasChildren) && correctPosition;
    }

    shouldDisplayExpanderPadding(tmplExpanderIcon?: string, tmplExpanderSize?: string): boolean {
        const expanderIcon = this.getExpanderIcon(tmplExpanderIcon);
        const expanderPosition = this._$owner.getExpanderPosition();
        const expanderSize = this.getExpanderSize(tmplExpanderSize);

        if (this._$owner.getExpanderVisibility() === 'hasChildren') {
            return !this.isHasChildren() && expanderIcon !== 'none' && expanderPosition === 'default';
        } else {
            return !expanderSize && expanderIcon !== 'none' && expanderPosition === 'default';
        }
    }

    shouldDisplayLevelPadding(withoutLevelPadding?: boolean): boolean {
        return !withoutLevelPadding && this.getLevel() > 1;
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string): string {
        // expanderSize по дефолту undefined, т.к. есть логика, при которой если он задан,
        // то скрытый экспандер для отступа не рисуем, но по факту дефолтное значение 'default'
        const expanderSize = this.getExpanderSize(tmplExpanderSize) || 'default';
        let expanderPaddingClasses = 'controls-TreeGrid__row-expanderPadding';
        expanderPaddingClasses += ` controls-TreeGrid__row-expanderPadding_size_${expanderSize}`;
        expanderPaddingClasses += ' js-controls-ListView__notEditable';
        return expanderPaddingClasses;
    }

    getLevelIndentClasses(expanderSizeTmpl?: string, levelIndentSize?: string): string {
        const sizes = ['null', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
        let resultLevelIndentSize;
        const expanderSize = this.getExpanderSize(expanderSizeTmpl);

        if (expanderSize && levelIndentSize) {
            if (sizes.indexOf(expanderSize) >= sizes.indexOf(levelIndentSize)) {
                resultLevelIndentSize = expanderSize;
            } else {
                resultLevelIndentSize = levelIndentSize;
            }
        } else if (!expanderSize && !levelIndentSize) {
            resultLevelIndentSize = 'default';
        } else {
            resultLevelIndentSize = expanderSize || levelIndentSize;
        }

        return `controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_${resultLevelIndentSize}`;
    }

    getExpanderClasses(tmplExpanderIcon?: string, tmplExpanderSize?: string): string {
        const expanderIcon = this.getExpanderIcon(tmplExpanderIcon);
        const expanderSize = this.getExpanderSize(tmplExpanderSize);
        const expanderPosition = this._$owner.getExpanderPosition();

        let expanderClasses = 'js-controls-Tree__row-expander controls-TreeGrid__row-expander';
        let expanderIconClass = '';

        if (expanderPosition === 'default') {
            expanderClasses += ` controls-TreeGrid__row_${this.getStyle()}-expander_size_${(expanderSize || 'default')} `;
        } else {
            expanderClasses += ' controls-TreeGrid__row_expander_position_right ';
        }
        expanderClasses += 'js-controls-ListView__notEditable';

        expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_${this.getOwner().getTopPadding()}`;
        expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_${this.getOwner().getBottomPadding()}`;

        if (expanderIcon) {
            expanderIconClass = ' controls-TreeGrid__row-expander_' + expanderIcon;
            expanderClasses += expanderIconClass;

            // могут передать node или hiddenNode в этом случае добавляем наши классы для master/default
            if ((expanderIcon === 'node') || (expanderIcon === 'hiddenNode') || (expanderIcon === 'emptyNode')) {
                expanderIconClass += '_' + (this.getStyle() === 'master' || this.getStyle() === 'masterNew' ? 'master' : 'default');
            }
        } else {
            expanderIconClass = ' controls-TreeGrid__row-expander_' + (this.isNode() ? 'node_' : 'hiddenNode_')
                + (this.getStyle() === 'master' || this.getStyle() === 'masterNew' ? 'master' : 'default');        }

        expanderClasses += expanderIconClass;

        // добавляем класс свертнутости развернутости для тестов
        expanderClasses += ' controls-TreeGrid__row-expander' + (this.isExpanded() ? '_expanded' : '_collapsed');
        // добавляем класс свертнутости развернутости стилевой
        expanderClasses += expanderIconClass + (this.isExpanded() ? '_expanded' : '_collapsed');

        return expanderClasses;
    }

    // endregion Expandable

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
    _$node: null,
    _$expanded: false,
    _$hasChildren: false,
    _$hasChildrenByRecordSet: false,
    _$childrenProperty: '',
    _$hasNodeWithChildren: true,
    _instancePrefix: 'tree-item-'
});
