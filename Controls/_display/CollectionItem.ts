import {
    DestroyableMixin,
    IInstantiable,
    InstantiableMixin,
    ISerializableState as IDefaultSerializableState,
    IVersionable,
    ObservableMixin,
    OptionsToPropertyMixin,
    SerializableMixin,
    Model
} from 'Types/entity';
import {IList} from 'Types/collection';
import {mixin} from 'Types/util';
import {TemplateFunction} from 'UI/Base';
import {ICollectionItemStyled} from './interface/ICollectionItemStyled';
import {ANIMATION_STATE, ICollection, ISourceCollection} from './interface/ICollection';
import {ICollectionItem} from './interface/ICollectionItem';
import { IItemCompatibilityListViewModel, ItemCompatibilityListViewModel } from './ItemCompatibilityListViewModel';
import {IEditableCollectionItem} from './interface/IEditableCollectionItem';
import {TMarkerClassName} from '../_grid/interface/ColumnTemplate';
import {IItemPadding} from '../_list/interface/IList';

export interface IOptions<T> {
    contents?: T;
    selected?: boolean;
    marked?: boolean;
    editing?: boolean;
    actions?: any;
    swiped?: boolean;
    editingContents?: T;
    owner?: ICollection<T, CollectionItem<T>>;
    isAdd?: boolean;
    addPosition?: 'top' | 'bottom';
    multiSelectVisibility: string;
}

export interface ISerializableState<T> extends IDefaultSerializableState {
    $options: IOptions<T>;
    ci: number;
    iid: string;
}

export interface ICollectionItemCounters {
    [key: string]: number;
}

const ITEMACTIONS_POSITION_CLASSES = {
    bottomRight: 'controls-itemActionsV_position_bottomRight',
    topRight: 'controls-itemActionsV_position_topRight'
};

/**
 * Элемент коллекции
 * @class Controls/_display/CollectionItem
 * @mixes Types/_entity/DestroyableMixin
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/InstantiableMixin
 * @mixes Types/_entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class CollectionItem<T> extends mixin<
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    SerializableMixin,
    ItemCompatibilityListViewModel
>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    InstantiableMixin,
    SerializableMixin,
    ItemCompatibilityListViewModel
) implements IInstantiable, IVersionable, ICollectionItem, ICollectionItemStyled, IItemCompatibilityListViewModel, IEditableCollectionItem {

    // region IInstantiable

    readonly '[Types/_entity/IInstantiable]': boolean;
    readonly MarkableItem: boolean = true;
    readonly SelectableItem: boolean = true;

    getInstanceId: () => string;

    /**
     * Коллекция, которой принадлежит элемент
     */
    protected _$owner: ICollection<T, CollectionItem<T>>;

    /**
     * Содержимое элемента коллекции
     */
    protected _$contents: T;

    /**
     * Элемент выбран
     */
    protected _$selected: boolean;

    protected _$marked: boolean;

    protected _$editing: boolean;

    protected _$actions: any;

    protected _$swiped: boolean;

    /**
     * Анимация свайпа: открытие или закрытие меню опций
     */
    protected _$swipeAnimation: ANIMATION_STATE;

    protected _$animatedForSelection: boolean;

    protected _$editingContents: T;

    protected _$active: boolean;

    protected _$hovered: boolean;

    protected _$rendered: boolean;

    protected _$multiSelectVisibility: string;

    protected _$dragged: boolean;

    protected _instancePrefix: string;

    /**
     * Индекс содержимого элемента в коллекции (используется для сериализации)
     */
    protected _contentsIndex: number;

    readonly '[Types/_entity/IVersionable]': boolean;

    protected _version: number;

    protected _counters: ICollectionItemCounters;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;

    readonly isAdd: boolean;

    readonly addPosition: 'top' | 'bottom';

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        this._counters = {};
        this.isAdd = (options && options.isAdd) || false;
        this.addPosition = (options && options.addPosition) || 'bottom';
    }

    // endregion

    // region IVersionable

    getVersion(): number {
        let version = this._version;

        const contents = this._$contents as unknown;
        const editingContents = this._$editingContents as unknown;

        version += this._getVersionableVersion(contents);
        version += this._getVersionableVersion(editingContents);

        return version;
    }

    protected _nextVersion(): void {
        this._version++;
    }

    protected _getVersionableVersion(v: unknown): number {
        if (v && typeof (v as IVersionable).getVersion === 'function') {
            return (v as IVersionable).getVersion();
        }
        return 0;
    }

    // endregion

    // region Public

    /**
     * Возвращает коллекцию, которой принадлежит элемент
     */
    getOwner(): ICollection<T, CollectionItem<T>> {
        return this._$owner;
    }

    /**
     * Устанавливает коллекцию, которой принадлежит элемент
     * @param owner Коллекция, которой принадлежит элемент
     */
    setOwner(owner: ICollection<T, CollectionItem<T>>): void {
        this._$owner = owner;
    }

    /**
     * Возвращает содержимое элемента коллекции
     */
    getContents(): T {
        if (this.isEditing() && this._$editingContents) {
            return this._$editingContents;
        }
        if (this._contentsIndex !== undefined) {
            // Ленивое восстановление _$contents по _contentsIndex после десериализации
            const collection = this.getOwner().getCollection();
            if (collection['[Types/_collection/IList]']) {
                this._$contents = (collection as any as IList<T>).at(this._contentsIndex);
                this._contentsIndex = undefined;
            }
        }
        return this._$contents;
    }

    // TODO Временный тестовый костыль для бинда. По итогу прикладник будет передавать
    // список опций, которые нужны для его шаблона (contents, marked и т. д.), и будет
    // в автоматическом режиме генерироваться подпроекция с нужными полями
    get contents(): T {

        // в процессе удаления, блокируются все поля класса, и метод getContents становится недоступен
        if (!this.destroyed) {
            return this.getContents();
        }
    }

    isStickyHeader(): boolean {
        return this.getOwner().isStickyHeader();
    }

    /**
     * Устанавливает содержимое элемента коллекции
     * @param contents Новое содержимое
     * @param [silent=false] Не уведомлять владельца об изменении содержимого
     */
    setContents(contents: T, silent?: boolean): void {
        if (this._$contents === contents) {
            return;
        }
        this._$contents = contents;
        if (!silent) {
            this._notifyItemChangeToOwner('contents');
        }
    }

    /**
     * Возвращает псевдоуникальный идентификатор элемента коллекции, основанный на значении опции {@link contents}.
     */
    getUid(): string {
        if (!this._$owner) {
            return;
        }
        return this._$owner.getItemUid(this);
    }

    /**
     * Возвращает признак, что элемент выбран
     */
    isSelected(): boolean|null {
        return this._$selected;
    }

    /**
     * Устанавливает признак, что элемент выбран
     * @param selected Элемент выбран
     * @param [silent=false] Не уведомлять владельца об изменении признака выбранности
     */
    setSelected(selected: boolean|null, silent?: boolean): void {
        if (this._$selected === selected) {
            return;
        }
        this._$selected = selected;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('selected');
        }
    }

    // endregion

    getDisplayProperty(): string {
        return this.getOwner().getDisplayProperty();
    }

    isMarked(): boolean {
        return this._$marked;
    }

    setMarked(marked: boolean, silent?: boolean): void {
        if (this._$marked === marked) {
            return;
        }
        this._$marked = marked;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('marked');
        }
    }

    shouldDisplayMarker(templateMarker: boolean = true): boolean {
        return (
            templateMarker &&
            this._$owner.getMarkerVisibility() !== 'hidden' &&
            this.isMarked() &&
            !this.isEditing()
        );
    }

    getMarkerClasses(theme: string, style: string = 'default',
                     markerClassName: TMarkerClassName = 'default', itemPadding: IItemPadding = {},
                     markerPosition: 'left' | 'right' = 'left'): string {
        let markerClass = 'controls-ListView__itemV_marker controls-ListView__itemV_marker_';
        if (markerClassName === 'default') {
            markerClass += 'default';
        } else {
            markerClass += `padding-${(itemPadding.top || 'l')}_${markerClassName})`;
        }
        markerClass += ` controls-ListView__itemV_marker_${style}_theme-${theme}`;
        markerClass += ` controls-ListView__itemV_marker_theme-${theme}`;
        markerClass += ` controls-ListView__itemV_marker-${markerPosition}`;
        return markerClass;
    }

    increaseCounter(name: string): number {
        if (typeof this._counters[name] === 'undefined') {
            this._counters[name] = 0;
        }
        return ++this._counters[name];
    }

    getCounters(): ICollectionItemCounters {
        return this._counters;
    }

    getMultiSelectClasses(theme: string): string {
        let classes = `js-controls-ListView__notEditable controls-ListView__checkbox_theme-${theme} `;
        classes += `controls-ListView__checkbox_position-${this.getOwner().getMultiSelectPosition()}_theme-${theme}`;

        if (this.getMultiSelectVisibility() === 'onhover' && !this.isSelected()) {
            classes += ' controls-ListView__checkbox-onhover';
        }
        return classes;
    }

    isEditing(): boolean {
        return this._$editing;
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean): void {
        if (this._$editing === editing && this._$editingContents === editingContents) {
            return;
        }
        this._$editing = editing;
        this._setEditingContents(editingContents);
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('editing');
        }
    }

    acceptChanges(): void {
        (this._$contents as unknown as Model).acceptChanges();

        if (!this._$editing) {
            return;
        }
        // Применяем изменения на обоих моделях, т.к. редактирование записи может продолжитсься.
        (this._$contents as unknown as Model).merge(this._$editingContents as unknown as Model);
        (this._$editingContents as unknown as Model).acceptChanges();
    }

    setActions(actions: any, silent?: boolean): void {
        if (this._$actions === actions) {
            return;
        }
        this._$actions = actions;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('actions');
        }
    }

    getActions(): any {
        return this._$actions;
    }

    isHovered(): boolean {
        return this._$hovered;
    }

    setHovered(hovered: boolean, silent?: boolean): void {
        if (this._$hovered === hovered) {
            return;
        }
        this._$hovered = hovered;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('hovered');
        }
    }

    hasVisibleActions(): boolean {
        return this._$actions && this._$actions.showed && this._$actions.showed.length > 0;
    }

    shouldDisplayActions(): boolean {
        return this.hasVisibleActions() || this.isEditing();
    }

    hasActionWithIcon(): boolean {
        return this.hasVisibleActions() && this._$actions.showed.some((action: any) => !!action.icon);
    }

    /**
     * Флаг, определяющий состояние анимации записи при отметке её чекбоксом.
     * Используется для анимации при свайпе вправо для multiSelect
     */
    isAnimatedForSelection(): boolean {
        return this._$animatedForSelection;
    }

    /**
     * Устанавливает состояние  анимации записи при отметке её чекбоксом.
     * Используется при свайпе вправо для multiSelect
     */
    setAnimatedForSelection(animated: boolean): void {
        if (this._$animatedForSelection === animated) {
            return;
        }
        this._$animatedForSelection = animated;
        this._nextVersion();
        this._notifyItemChangeToOwner('animated');
    }

    /**
     * Флаг, определяющий состояние свайпа влево по записи.
     * Используется при свайпе по записи для
     * отображения или скрытия панели опций записи
     */
    isSwiped(): boolean {
        return this._$swiped;
    }

    /**
     * Флаг, определяющий состояние свайпа влево по записи.
     * Используется при свайпе по записи для
     * отображения или скрытия панели опций записи
     */
    setSwiped(swiped: boolean, silent?: boolean): void {
        if (this._$swiped === swiped) {
            return;
        }
        this._$swiped = swiped;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('swiped');
        }
    }

    /**
     * Устанавливает текущую анимацию для свайпа.
     * Может быть, стоит объединить с _swipeConfig
     */
    setSwipeAnimation(animation: ANIMATION_STATE): void {
        this._$swipeAnimation = animation;
        this._nextVersion();
        this._notifyItemChangeToOwner('swipeAnimation');
    }

    /**
     * Получает еткущую анимацию для свайпа.
     * Может быть, стоит объединить с _swipeConfig
     */
    getSwipeAnimation(): ANIMATION_STATE {
        return this._$swipeAnimation;
    }

    isActive(): boolean {
        return this._$active;
    }

    setActive(active: boolean, silent?: boolean): void {
        if (this._$active === active) {
            return;
        }
        this._$active = active;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('active');
        }
    }

    isRendered(): boolean {
        return this._$rendered;
    }

    setRendered(state: boolean): void {
        this._$rendered = state;
    }

    isDragged(): boolean {
        return this._$dragged;
    }

    isSticked(): boolean {
        return this.isMarked() && this._isSupportSticky(this.getOwner().getStyle());
    }

    protected _isSupportSticky(style: string = 'default'): boolean {
        return this.getOwner().isStickyMarkedItem() !== false &&
            (style === 'master' || style === 'masterClassic');
    }

    setDragged(dragged: boolean, silent?: boolean): void {
        if (this._$dragged === dragged) {
            return;
        }
        this._$dragged = dragged;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('dragged');
        }
    }

    /**
     * Возвращает строку с классами, устанавливаемыми в шаблоне элемента для корневого div'а.
     * @param templateHighlightOnHover - подсвечивать или нет запись по ховеру
     * @param theme - используемая тема
     * @param cursor - курсор мыши
     * @param backgroundColorStyle - стиль background
     * @param style - режим отображения списка (master/masterClassic/default)
     * @remark
     * Метод должен уйти в render-модель при её разработке.
     */
    getWrapperClasses(templateHighlightOnHover: boolean = true,
                      theme?: string,
                      cursor: string = 'pointer',
                      backgroundColorStyle?: string,
                      style: string = 'default'): string {
        const hoverBackgroundStyle = this.getOwner().getHoverBackgroundStyle() || style;
        const editingBackgroundStyle = this.getOwner().getEditingBackgroundStyle();
        return `controls-ListView__itemV ${this._getCursorClasses(cursor)}
            controls-ListView__item_${style}
            controls-ListView__item_${style}_theme-${theme}
            controls-ListView__item_showActions
            js-controls-ItemActions__swipeMeasurementContainer
            controls-ListView__item__${this.isMarked() ? '' : 'un'}marked_${style}_theme-${theme}
            ${templateHighlightOnHover && !this.isEditing() ? `controls-ListView__item_highlightOnHover_${hoverBackgroundStyle}_theme_${theme}` : ''}
            ${this.isEditing() ? (` controls-ListView__item_editing_theme-${theme} controls-ListView__item_background-editing_${editingBackgroundStyle}_theme-${theme}`) : ''}
            ${this.isDragged() ? ` controls-ListView__item_dragging_theme-${theme}` : ''}
            ${backgroundColorStyle ? ` controls-ListView__item_background_${backgroundColorStyle}_theme-${theme}` : ''}
            ${templateHighlightOnHover && this.isActive() ? ` controls-ListView__item_active_theme-${theme}` : ''}`;
    }

    getItemActionClasses(itemActionsPosition: string, theme?: string, isLastRow?: boolean, rowSeparatorSize?: string): string {
        let itemActionClasses = `controls-itemActionsV_${itemActionsPosition}_theme-${theme}`;
        if (itemActionsPosition === 'outside') {
            const defaultSize = ` controls-itemActionsV__outside_bottom_size-default_theme-${theme}`;
            if (isLastRow) {
                if (rowSeparatorSize) {
                    itemActionClasses += ` controls-itemActionsV__outside_bottom_size-${rowSeparatorSize}_theme-${theme}`;
                } else {
                    itemActionClasses += defaultSize;
                }
            } else {
                itemActionClasses += defaultSize;
            }
        }
        return itemActionClasses;
    }

    getRowSeparatorSize(): string {
        return this.getOwner().getRowSeparatorSize();
    }

    /**
     * Возвращает строку с классами, устанавливаемыми в шаблоне элемента div'а, расположенного внутри корневого div'a -
     * так называемого контентного div'a.
     * @param theme - используемая тема
     * @param style - режим отображения списка (master/masterClassic/default)
     * @remark
     * Метод должен уйти в render-модель при её разработке.
     */
    getContentClasses(theme: string, style: string = 'default'): string {
        const isAnimatedForSelection = this.isAnimatedForSelection();
        const rowSeparatorSize = this.getRowSeparatorSize();
        return `controls-ListView__itemContent ${this._getSpacingClasses(theme, style)}
        ${rowSeparatorSize ? ` controls-ListView__rowSeparator_size-${rowSeparatorSize}_theme-${theme}` : ''}
        ${isAnimatedForSelection ? ' controls-ListView__item_rightSwipeAnimation' : ''}
        controls-ListView__itemContent_${style}_theme-${theme}`;
    }

    /**
     * Возвращает Класс для позиционирования опций записи.
     * Если itemPadding.top === null и itemPadding.bottom === null, то возвращает пустую строку
     * Если новая модель, то в любом случае не считается класс, добавляющий padding
     * Если опции вне строки, то возвращает класс, добавляющий padding согласно itemActionsClass и itemPadding
     * Если опции вне строки и itemActionsClass не задан, возвращает пробел
     * Если опции внутри строки и itemActionsClass не задан, возвращает класс, добавляющий выравнивание bottomRight, без padding
     * Если itemActionsClass задан, то всегда происходит попытка рассчитать класс, добавляющий Padding, независимо от itemActionsPosition
     * Иначе возвращает классы, соответствующие заданным параметрам classes и itemPadding
     * @param itemActionsPosition
     * @param itemActionsClass
     * @param itemPadding @deprecated
     * @param theme
     * @param useNewModel
     */
    getItemActionPositionClasses(itemActionsPosition: string, itemActionsClass: string, itemPadding: {top?: string, bottom?: string}, theme: string, useNewModel?: boolean): string {
        const classes = itemActionsClass || ITEMACTIONS_POSITION_CLASSES.bottomRight;
        const result: string[] = [];
        if (itemPadding === undefined) {
            itemPadding = {
                top: this.getOwner().getTopPadding().toLowerCase(),
                bottom: this.getOwner().getBottomPadding().toLowerCase()
            }
        }
        if (itemActionsPosition !== 'outside') {
            result.push(classes);
        }
        if (itemPadding.top !== 'null' || itemPadding.bottom !== 'null') {
            const themedPositionClassCompile = (position) => (
                `controls-itemActionsV_padding-${position}_${(itemPadding && itemPadding[position] === 'null' ? 'null' : 'default')}_theme-${theme}`
            );
            if (classes.indexOf(ITEMACTIONS_POSITION_CLASSES.topRight) !== -1) {
                result.push(themedPositionClassCompile('top'));
            } else if (classes.indexOf(ITEMACTIONS_POSITION_CLASSES.bottomRight) !== -1) {
                result.push(themedPositionClassCompile('bottom'));
            }
        }
        return result.length ? ` ${result.join(' ')} ` : ' ';
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction|string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : '';
        return templateFromProperty || userTemplate;
    }

    getMultiSelectVisibility(): string {
        return this._$multiSelectVisibility;
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const multiSelectVisibilityUpdated = this._$multiSelectVisibility !== multiSelectVisibility;
        if (multiSelectVisibilityUpdated) {
            this._$multiSelectVisibility = multiSelectVisibility;
            this._nextVersion();
            return true;
        }
        return false;
    }

    getMultiSelectPosition(): string {
        return this.getOwner().getMultiSelectPosition();
    }

    protected _getSpacingClasses(theme: string, style: string = 'default'): string {
        let classes = '';

        const preparedStyle = style === 'masterClassic' ? 'default' : style;
        const topSpacing = this.getOwner().getTopPadding().toLowerCase();
        const bottomSpacing = this.getOwner().getBottomPadding().toLowerCase();
        const rightSpacing = this.getOwner().getRightPadding().toLowerCase();

        classes += ` controls-ListView__item_${preparedStyle}-topPadding_${topSpacing}_theme-${theme}`;
        classes += ` controls-ListView__item_${preparedStyle}-bottomPadding_${bottomSpacing}_theme-${theme}`;

        classes += ` controls-ListView__item-rightPadding_${rightSpacing}_theme-${theme}`;

        if (this.getMultiSelectVisibility() !== 'hidden' && this.getMultiSelectPosition() !== 'custom') {
           classes += ` controls-ListView__itemContent_withCheckboxes_theme-${theme}`;
        } else {
           classes += ` controls-ListView__item-leftPadding_${this.getOwner().getLeftPadding().toLowerCase()}_theme-${theme}`;
        }

        return classes;
    }

    protected _getCursorClasses(cursor: string = 'pointer', clickable: boolean = true): string {
        const cursorStyle = clickable === false ? 'default' : cursor;
        return `controls-ListView__itemV_cursor-${cursorStyle}`;
    }

    protected _setEditingContents(editingContents: T): void {
        if (this._$editingContents === editingContents) {
            return;
        }
        if (this._$editingContents && this._$editingContents['[Types/_entity/ObservableMixin]']) {
            (this._$editingContents as unknown as ObservableMixin)
                .unsubscribe('onPropertyChange', this._onEditingItemPropertyChange, this);
        }
        if (editingContents && editingContents['[Types/_entity/ObservableMixin]']) {
            (editingContents as unknown as ObservableMixin)
                .subscribe('onPropertyChange', this._onEditingItemPropertyChange, this);
        }
        this._$editingContents = editingContents;
    }

    protected _onEditingItemPropertyChange(): void {
        this._notifyItemChangeToOwner('editingContents');
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState<T> {
        const resultState = SerializableMixin.prototype._getSerializableState.call(
            this, state
        ) as ISerializableState<T>;

        if (resultState.$options.owner) {
            // save element index if collections implements Types/_collection/IList
            const collection = resultState.$options.owner.getCollection();
            const index = collection['[Types/_collection/IList]']
                ? (collection as any as IList<T>).getIndex(resultState.$options.contents)
                : -1;
            if (index > -1) {
                resultState.ci = index;
                delete resultState.$options.contents;
            }
        }

        // By performance reason. It will be restored at Collection::_setSerializableState
        // delete resultState.$options.owner;

        resultState.iid = this.getInstanceId();

        return resultState;
    }

    _setSerializableState(state: ISerializableState<T>): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);
            if (state.hasOwnProperty('ci')) {
                this._contentsIndex = state.ci;
            }
            this._instanceId = state.iid;
        };
    }

    // endregion

    // region Protected

    /**
     * Возвращает коллекцию проекции
     * @protected
     */
    protected _getSourceCollection(): ISourceCollection<T> {
        return this.getOwner().getCollection();
    }

    /**
     * Генерирует событие у владельца об изменении свойства элемента
     * @param property Измененное свойство
     * @protected
     */
    protected _notifyItemChangeToOwner(property: string): void {
        if (this._$owner) {
            this._$owner.notifyItemChange(
                this,
                property as any
            );
        }
    }

    // endregion
}

Object.assign(CollectionItem.prototype, {
    '[Controls/_display/CollectionItem]': true,
    _moduleName: 'Controls/display:CollectionItem',
    _$owner: null,
    _$contents: null,
    _$selected: false,
    _$marked: false,
    _$editing: false,
    _$actions: null,
    _$swiped: false,
    _$editingContents: null,
    _$active: false,
    _$hovered: false,
    _$dragged: false,
    _instancePrefix: 'collection-item-',
    _contentsIndex: undefined,
    _version: 0,
    _counters: null,
    _$multiSelectVisibility: null
});
