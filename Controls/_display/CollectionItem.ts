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
import {mixin, object} from 'Types/util';
import {TemplateFunction} from 'UI/Base';
import {ICollectionItemStyled} from './interface/ICollectionItemStyled';
import {ANIMATION_STATE, ICollection, ISourceCollection, IItemPadding} from './interface/ICollection';
import {ICollectionItem} from './interface/ICollectionItem';
import IMarkable, {TMarkerClassName} from './interface/IMarkable';
import { IItemCompatibilityListViewModel, ItemCompatibilityListViewModel } from './ItemCompatibilityListViewModel';
import {IEditableCollectionItem} from './interface/IEditableCollectionItem';
import Collection, {IEditingConfig} from 'Controls/_display/Collection';
import IItemActionsItem from './interface/IItemActionsItem';
import {TRoundBorder} from "Controls/_tile/display/mixins/Tile";
import {isEqual} from "Types/object";
import IEnumerableItem from './interface/IEnumerableItem';
import IEdgeRowSeparatorItem from './interface/IEdgeRowSeparatorItem';

export interface IOptions<T extends Model = Model> {
    itemModule?: string;
    contents?: T;
    selected?: boolean;
    marked?: boolean;
    editing?: boolean;
    actions?: any;
    swiped?: boolean;
    editingContents?: T;
    owner?: ICollection<T, CollectionItem<T>>;
    isAdd?: boolean;
    multiSelectVisibility?: string;
    multiSelectAccessibilityProperty?: string;
    rowSeparatorSize?: string;
    backgroundStyle?: string;
    theme?: string;
    style?: string;
    searchValue?: string;
    leftPadding?: string;
    rightPadding?: string;
    topPadding?: string;
    bottomPadding?: string;
    markerPosition?: string;
    isLastItem?: boolean;
    isFirstItem?: boolean;
    hasMoreDataUp?: boolean;
    isFirstStickedItem?: boolean;
    roundBorder?: object;
    isTopSeparatorEnabled?: boolean;
    isBottomSeparatorEnabled?: boolean;
}

export interface ISerializableState<T extends Model = Model> extends IDefaultSerializableState {
    $options: IOptions<T>;
    ci: number;
    iid: string;
}

export interface ICollectionItemCounters {
    [key: string]: number;
}

const DEFAULT_MULTI_SELECT_TEMPLATE = 'Controls/baseList:MultiSelectTemplate';

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
export default class CollectionItem<T extends Model = Model> extends mixin<
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
) implements IInstantiable, IVersionable, ICollectionItem, ICollectionItemStyled, IItemCompatibilityListViewModel, IEditableCollectionItem, IMarkable, IItemActionsItem, IEnumerableItem, IEdgeRowSeparatorItem {

    // region IInstantiable

    readonly '[Types/_entity/IInstantiable]': boolean;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DraggableItem: boolean = true;
    readonly ItemActionsItem: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly StickableItem: boolean = true;

    private _$editingColumnIndex: number;

    getInstanceId: () => string;

    /**
     * Коллекция, которой принадлежит элемент
     */
    protected _$owner: Collection;

    /**
     * Содержимое элемента коллекции
     */
    protected _$contents: T;

    protected _$searchValue: string;

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

    protected _$multiSelectVisibility: string = 'hidden';

    // Фон застиканных записей и лесенки
    protected _$backgroundStyle?: string;

    protected _$rowSeparatorSize: string;

    protected _$dragged: boolean;

    protected _$theme: string;

    protected _$style: string;

    protected _$leftPadding: string;

    protected _$rightPadding: string;

    protected _$topPadding: string;

    protected _$bottomPadding: string;

    protected _$markerPosition: 'left' | 'right';

    protected _dragOutsideList: boolean;

    protected _$multiSelectAccessibilityProperty: string;

    protected _shadowVisibility: string = 'lastVisible';

    protected _$hasMoreDataUp: boolean;

    protected _$isFirstStickedItem: boolean;

    protected _instancePrefix: string;

    /**
     * Индекс содержимого элемента в коллекции (используется для сериализации)
     */
    protected _contentsIndex: number;

    readonly '[Types/_entity/IVersionable]': boolean;

    protected _version: number;

    protected _counters: ICollectionItemCounters;

    protected _$isBottomSeparatorEnabled: boolean;

    protected _$isTopSeparatorEnabled: boolean;

    protected _$isFirstItem: boolean;

    protected _$isLastItem: boolean;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;

    readonly isAdd: boolean;

    constructor(options?: IOptions<T>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        this._counters = {};
        this.isAdd = (options && options.isAdd) || false;

        // Для элементов, которые создаются сразу застканными, задается shadowVisibility='initial'.
        // Это сделано для оптимизации, чтобы не было лишних прыжков теней при изначальной отрисовке,
        // когда есть данные вверх
        if (this.hasMoreDataUp() && this._$isFirstStickedItem) {
            this._shadowVisibility = 'initial';
        }
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
    getOwner(): Collection {
        return this._$owner;
    }

    /**
     * Устанавливает коллекцию, которой принадлежит элемент
     * @param owner Коллекция, которой принадлежит элемент
     */
    setOwner(owner: Collection): void {
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
        return this.getOwner()?.isStickyHeader();
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

    setSearchValue(searchValue: string): void {
        if (this._$searchValue !== searchValue) {
            this._$searchValue = searchValue;
            this._nextVersion();
        }
    }

    getSearchValue(): string {
        return this._$searchValue;
    }

    // endregion

    // region MultiSelectAccessibility

    isReadonlyCheckbox(): boolean {
        return this._getMultiSelectAccessibility() !== true;
    }

    isVisibleCheckbox(): boolean {
        return this._getMultiSelectAccessibility() !== null && !this.isAdd;
    }

    setMultiSelectAccessibilityProperty(property: string): void {
        if (this._$multiSelectAccessibilityProperty !== property) {
            this._$multiSelectAccessibilityProperty = property;
            this._nextVersion();
        }
    }

    protected _getMultiSelectAccessibility(): boolean|null {
        const value = object.getPropertyValue<boolean|null>(this.getContents(), this._$multiSelectAccessibilityProperty);
        return value === undefined ? true : value;
    }

    // endregion MultiSelectAccessibility

    getDisplayProperty(): string {
        return this.getOwner().getDisplayProperty();
    }

    getDisplayValue(): string {
        return this.getContents().get(this.getDisplayProperty());
    }

    getKeyProperty(): string {
        return this.getOwner().getKeyProperty();
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
            this.isMarked() &&
            !this.getOwner().isEditing()
        );
    }

    getMarkerClasses(theme: string, style: string = 'default',
                     markerClassName: TMarkerClassName = 'default', itemPadding: IItemPadding = {}): string {
        let markerClass = 'controls-ListView__itemV_marker controls-ListView__itemV_marker_';
        if (markerClassName === 'default') {
            markerClass += 'height';
        } else {
            markerClass += `padding-${(itemPadding.top || this.getTopPadding() || 'l')}_${markerClassName}`;
        }
        markerClass += ` controls-ListView__itemV_marker_${style}`;
        markerClass += ` controls-ListView__itemV_marker-${this.getMarkerPosition()}`;
        return markerClass;
    }

    getMarkerPosition(): 'left' | 'right' {
        return this._$markerPosition;
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

    getMultiSelectOffsetClass(): string {
        return `controls-ListView__checkbox_position-${this.getOwner().getMultiSelectPosition()} `;
    }

    getMultiSelectClasses(): string {
        let classes = 'js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable ';
        classes += 'js-controls-ListView__checkbox js-controls-DragScroll__notDraggable ';
        classes += 'controls-CheckboxMarker_inList controls-ListView__checkbox ';
        classes += this.getMultiSelectOffsetClass();

        if (this.getMultiSelectVisibility() === 'onhover' && !this.isSelected()) {
            classes += 'controls-ListView__checkbox-onhover';
        }

        if (this.isDragged()) {
            classes += ' controls-ListView__itemContent_dragging';
        }

        return classes;
    }

    isEditing(): boolean {
        return this._$editing;
    }

    getEditingConfig(): IEditingConfig {
        return this._$owner.getEditingConfig();
    }

    // TODO: Убрать columnIndex.
    //  Расположение индекса редактируемой колонки на элементе плоского списка - временное решение, до отказа от
    //  старых списков. Контроллер редактирования работает только с новой коллекцией и новыми item'ами, а
    //  функционал редактирования отдельных ячеек требуется поддержать в том числе и в старых таблицах.
    //  Такое решение оптимальнее, чем давать контроллеру редактирования старую модель, т.к. при переходе
    //  достаточно будет почистить пару мест в CollectionItem, а не вычищать целый контроллер.
    //  https://online.sbis.ru/opendoc.html?guid=b13d5312-a8f5-4cea-b88f-8c4c043e4a77
    setEditing(editing: boolean, editingContents?: T, silent?: boolean, columnIndex?: number): void {
        if (this._$editing === editing && this._$editingContents === editingContents) {
            return;
        }
        /*
        * Версия CollectionItem при редактировании = локальная версия CollectionItem + версия редактируемой модели.
        * Во время изменения редактируемой записи версия поднимается на редактируемой модели - клоне оригинала.
        * При отмене редактирования нужно применять накопленные изменения версий, иначе может быть ошибочное поведение.
        * Например,
        * 1. У записи версия 10.
        * 2. Вошли в режим редактирования, +локальная версия = 11, версия клона = 0, итого 11.
        * 3. Ввели 1 знак, локальная версия = 11, +версия клона, итого 12.
        * 4. Отменили редактирование, +локальная версия = 11 + 1 = 12.
        * Итог - строка не перерисовалась, т.к. в режиме редактирования и после выхода из него версии одинаковые.
        * */
        if (!editing) {
            this._version += this._getVersionableVersion(this._$editingContents);
        }
        this._$editing = editing;
        if (typeof columnIndex === 'number' && this._$editingColumnIndex !== columnIndex) {
            this._$editingColumnIndex = columnIndex;
        }
        this._setEditingContents(editingContents);
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('editing');
        }
    }

    getEditingColumnIndex(): number {
        return this._$editingColumnIndex;
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

    setBackgroundStyle(backgroundStyle: string): void {
        this._$backgroundStyle = backgroundStyle;
        this._nextVersion();
    }

    // region Drag-n-drop

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

    isDragged(): boolean {
        return this._$dragged;
    }

    setDragOutsideList(outside: boolean): void {
        if (this._dragOutsideList !== outside) {
            this._dragOutsideList = outside;
            this._nextVersion();
        }
    }

    isDragOutsideList(): boolean {
        return this._dragOutsideList;
    }

    shouldDisplayDraggingCounter(): boolean {
        return this.isDragged() && !this.isDragOutsideList() && this.getDraggedItemsCount() > 1;
    }

    getDraggedItemsCount(): number {
        return this.getOwner().getDraggedItemsCount();
    }

    // endregion Drag-n-drop

    isSticked(style: string, stickyCallback: Function, item: CollectionItem): boolean {
        return stickyCallback ?
            stickyCallback(item.getContents()) :
            this.isMarked() && this._isSupportSticky(this.getOwner().getStyle());
    }

    getStickyHeaderPosition(stickyCallback: Function): {} {
        const stickyVerticalPosition = stickyCallback ? 'top' : 'topBottom';
        return {
            vertical: stickyVerticalPosition
        }
    }

    protected _isSupportSticky(style: string = 'default'): boolean {
        return this.getOwner().isStickyMarkedItem() !== false &&
            (style === 'master');
    }

    getShadowVisibility(): string {
        return this._shadowVisibility;
    }

    getQAData(marker: boolean): string {
        let classes = '';
        if (this.shouldDisplayMarker(marker)) {
            classes += 'key-controls-list-marked-item';
        }
        return classes;
    }

    /**
     * Возвращает строку с классами, устанавливаемыми в шаблоне элемента для корневого div'а.
     * @param templateHighlightOnHover - подсвечивать или нет запись по ховеру
     * @param theme - используемая тема
     * @param cursor - курсор мыши
     * @param backgroundColorStyle - стиль background
     * @param style - режим отображения списка (master/default)
     * @param showItemActionsOnHover - показывать или нет операции над записью по ховеру
     * @remark
     * Метод должен уйти в render-модель при её разработке.
     */
    getWrapperClasses(templateHighlightOnHover: boolean = true,
                      theme?: string,
                      cursor: string = 'pointer',
                      backgroundColorStyle?: string,
                      style: string = 'default',
                      showItemActionsOnHover: boolean = true): string {
        const hoverBackgroundStyle = this.getOwner().getHoverBackgroundStyle() || style;
        const editingBackgroundStyle = this.getOwner().getEditingBackgroundStyle();

        // TODO: Убрать js-controls-ListView__editingTarget' по задаче
        //  https://online.sbis.ru/opendoc.html?guid=deef0d24-dd6a-4e24-8782-5092e949a3d9
        let wrapperClasses = `controls-ListView__itemV js-controls-ListView__editingTarget ${this._getCursorClasses(cursor)}`;
        wrapperClasses += ` controls-ListView__item_${style}`;
        if (showItemActionsOnHover !== false) {
            wrapperClasses += ' controls-ListView__item_showActions';
        }
        wrapperClasses += ' js-controls-ListView__measurableContainer';
        wrapperClasses += ` controls-ListView__item__${this.isMarked() ? '' : 'un'}marked_${style}`;
        if (templateHighlightOnHover && !this.isEditing()) {
            wrapperClasses += ` controls-ListView__item_highlightOnHover_${hoverBackgroundStyle}`;
        }
        if (this.isEditing()) {
            wrapperClasses += ` controls-ListView__item_editing controls-ListView__item_background-editing_${editingBackgroundStyle}`;
        }
        if (this.isDragged()) {
            wrapperClasses += ' controls-ListView__item_dragging';
        }
        if (backgroundColorStyle) {
            wrapperClasses += ` controls-ListView__item_background_${backgroundColorStyle}`;
        }
        if (templateHighlightOnHover && this.isActive()) {
            wrapperClasses += ' controls-ListView__item_active';
        }
        return wrapperClasses;
    }

    // Вроде как isLastRow лишняя проверка и она только для старой модели grid.
    // аргумент rowSeparatorSize тоже только для старой модели.
    // когда нигде точно не останется мест использования, надо будет избавиться от этих аргументов.
    // + здесь же, возможно, стоит вызывать описанный ниже метод getItemActionPositionClasses.
    getItemActionClasses(itemActionsPosition: string): string {
        let itemActionClasses = `controls-itemActionsV_${itemActionsPosition}`;
        const rowSeparatorSize = this.isBottomSeparatorEnabled() && this.getRowSeparatorSize();
        if (itemActionsPosition === 'outside') {
            itemActionClasses += ' controls-itemActionsV__outside_bottom_size-' +
                (rowSeparatorSize ? rowSeparatorSize : 'default');
        }
        return itemActionClasses;
    }

    // region RoundBorder

    setRoundBorder(roundBorder: TRoundBorder): void {
        if (!isEqual(this._$roundBorder, roundBorder)) {
            this._$roundBorder = roundBorder;
            this._nextVersion();
        }
    }

    getTopLeftRoundBorder(): string {
        return this._$roundBorder?.tl || 'default';
    }

    getTopRightRoundBorder(): string {
        return this._$roundBorder?.tr || 'default';
    }

    getBottomLeftRoundBorder(): string {
        return this._$roundBorder?.bl || 'default';
    }

    getBottomRightRoundBorder(): string {
        return this._$roundBorder?.br || 'default';
    }

    getRoundBorderClasses(): string {
        let classes = `controls-ListView__item_roundBorder_topLeft_${this.getTopLeftRoundBorder()}`;
        classes += ` controls-ListView__item_roundBorder_topRight_${this.getTopRightRoundBorder()}`;
        classes += ` controls-ListView__item_roundBorder_bottomLeft_${this.getBottomLeftRoundBorder()}`;
        classes += ` controls-ListView__item_roundBorder_bottomRight_${this.getBottomRightRoundBorder()}`;
        return classes;
    }
    // endregion RoundBorder

    getRowSeparatorSize(): string {
        return this.getOwner().getRowSeparatorSize();
    }

    setBottomSeparatorEnabled(state: boolean, silent?: boolean): void {
        if (this._$isBottomSeparatorEnabled !== state) {
            this._$isBottomSeparatorEnabled = state;
            if (!silent) {
                this._nextVersion();
            }
        }
    }

    isBottomSeparatorEnabled(): boolean {
        return this._$isBottomSeparatorEnabled;
    }

    setTopSeparatorEnabled(state: boolean, silent?: boolean): void {
        if (this._$isTopSeparatorEnabled !== state) {
            this._$isTopSeparatorEnabled = state;
            if (!silent) {
                this._nextVersion();
            }
        }
    }

    isTopSeparatorEnabled(): boolean {
        return this._$isTopSeparatorEnabled;
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=ef1556f8-fce4-401f-9818-f4d1f8d8789a
    setFirstItem(state: boolean, silent?: boolean): void {
        if (this._$isFirstItem !== state) {
            this._$isFirstItem = state;
            if (!silent) {
                this._nextVersion();
            }
        }
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=ef1556f8-fce4-401f-9818-f4d1f8d8789a
    isFirstItem(): boolean {
        return this._$isFirstItem;
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=ef1556f8-fce4-401f-9818-f4d1f8d8789a
    setLastItem(state: boolean, silent?: boolean): void {
        if (this._$isLastItem !== state) {
            this._$isLastItem = state;
            if (!silent) {
                this._nextVersion();
            }
        }
    }

    // @TODO https://online.sbis.ru/opendoc.html?guid=ef1556f8-fce4-401f-9818-f4d1f8d8789a
    isLastItem(): boolean {
        return this._$isLastItem;
    }

    getTheme(): string {
        return this._$theme;
    }

    getStyle(): string {
        return this._$style;
    }

    hasMoreDataUp(): boolean {
        return this._$hasMoreDataUp;
    }

    /**
     * Возвращает строку с классами, устанавливаемыми в шаблоне элемента div'а, расположенного внутри корневого div'a -
     * так называемого контентного div'a.
     * @param theme - используемая тема
     * @param style - режим отображения списка (master/default)
     * @remark
     * Метод должен уйти в render-модель при её разработке.
     */
    getContentClasses(theme: string, style: string = 'default'): string {
        const isAnimatedForSelection = this.isAnimatedForSelection();
        const rowSeparatorSize = this.getRowSeparatorSize();
        let contentClasses = `controls-ListView__itemContent ${this._getSpacingClasses(theme, style)}`;
        contentClasses += ` controls-ListView__itemContent_${style}`;

        if (rowSeparatorSize && this._$isTopSeparatorEnabled) {
            contentClasses += ` controls-ListView__rowSeparator_size-${rowSeparatorSize}`;
        }

        if (rowSeparatorSize && this._$isBottomSeparatorEnabled) {
            contentClasses += ` controls-ListView__rowSeparator_bottom_size-${rowSeparatorSize}`;
        }

        if (isAnimatedForSelection) {
            contentClasses += ' controls-ListView__item_rightSwipeAnimation';
        }
        if (this.isDragged()) {
            contentClasses += ' controls-ListView__itemContent_dragging';
        }
        return contentClasses;
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
     */
    getItemActionPositionClasses(itemActionsPosition: string, itemActionsClass: string, itemPadding: {top?: string, bottom?: string}, theme: string): string {
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
                `controls-itemActionsV_padding-${position}_${(itemPadding && itemPadding[position] === 'null' ? 'null' : 'default')}`
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

    getMultiSelectTemplate(): TemplateFunction|string {
        return this._$owner.getMultiSelectTemplate() || DEFAULT_MULTI_SELECT_TEMPLATE;
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

    shouldDisplayMultiSelectTemplate(): boolean {
        return this.getMultiSelectVisibility() !== 'hidden' && this.getMultiSelectPosition() !== 'custom';
    }

    setRowSeparatorSize(rowSeparatorSize: string): boolean {
        const changed = this._$rowSeparatorSize !== rowSeparatorSize;
        if (changed) {
            this._$rowSeparatorSize = rowSeparatorSize;
            this._nextVersion();
            return true;
        }
        return false;
    }

    // region ItemPadding

    getTopPadding(): string {
        return this._$topPadding;
    }

    getBottomPadding(): string {
        return this._$bottomPadding;
    }

    getLeftPadding(): string {
        return this._$leftPadding;
    }

    getRightPadding(): string {
        return this._$rightPadding;
    }

    setItemPadding(itemPadding: IItemPadding, silent?: boolean): void {
        this._setItemPadding(itemPadding);
        if (!silent) {
            this._nextVersion();
        }
    }

    protected _setItemPadding(itemPadding: IItemPadding): void {
        this._$topPadding = itemPadding.top || 'default';
        this._$bottomPadding = itemPadding.bottom || 'default';
        this._$leftPadding = itemPadding.left || 'default';
        this._$rightPadding = itemPadding.right || 'default';
    }

    // endregion ItemPadding

    protected _getSpacingClasses(theme: string, style: string = 'default'): string {
        let classes = '';

        const preparedStyle = style;
        const topSpacing = this.getOwner().getTopPadding().toLowerCase();
        const bottomSpacing = this.getOwner().getBottomPadding().toLowerCase();
        const rightSpacing = this.getOwner().getRightPadding().toLowerCase();

        classes += ` controls-ListView__item_${preparedStyle}-topPadding_${topSpacing}`;
        classes += ` controls-ListView__item_${preparedStyle}-bottomPadding_${bottomSpacing}`;

        classes += ` controls-ListView__item-rightPadding_${rightSpacing}`;

        classes += this._getLeftSpacingContentClasses();

        return classes;
    }

    // region MultiSelect
    protected _isDefaultRenderMultiSelect(): boolean {
        return this.getMultiSelectVisibility() !== 'hidden' && this.getMultiSelectPosition() !== 'custom';
    }
    // endregion MultiSelect

    protected _getLeftSpacingContentClasses(): string {
        if (this._isDefaultRenderMultiSelect()) {
            return ` controls-ListView__itemContent_withCheckboxes`;
        } else {
            return ` controls-ListView__item-leftPadding_${this.getOwner().getLeftPadding().toLowerCase()}`;
        }
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
        if (this._$owner && !this._$owner.destroyed) {
            this._$owner.notifyItemChange(this, property as any);
        }
    }

    // endregion
}

Object.assign(CollectionItem.prototype, {
    '[Controls/_display/CollectionItem]': true,
    _moduleName: 'Controls/display:CollectionItem',
    _instancePrefix: 'collection-item-',
    _$owner: null,
    _$searchValue: '',
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
    _$multiSelectAccessibilityProperty: '',
    _$multiSelectVisibility: null,
    _$rowSeparatorSize: null,
    _$backgroundStyle: null,
    _$theme: 'default',
    _$style: 'default',
    _$leftPadding: 'default',
    _$rightPadding: 'default',
    _$topPadding: 'default',
    _$bottomPadding: 'default',
    _$markerPosition: undefined,
    _$hasMoreDataUp: false,
    _$isFirstStickedItem: false,
    _contentsIndex: undefined,
    _version: 0,
    _counters: null,
    _$editingColumnIndex: null,
    _$roundBorder: null,
    _$isBottomSeparatorEnabled: false,
    _$isTopSeparatorEnabled: false,
    _$isFirstItem: false,
    _$isLastItem: false
});
