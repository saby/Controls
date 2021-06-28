import GridView from './GridView';
import { TemplateFunction } from 'UI/Base';
import * as TableTemplate from 'wml!Controls/_grid/Render/table/GridView';
import * as TableItem from 'wml!Controls/_grid/Render/table/Item';

const GridViewTable = GridView.extend({
    _template: TableTemplate,

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return TableItem;
    },

    _getGridViewWrapperClasses(options): string {
        const classes = GridViewTable.superclass._getGridViewWrapperClasses.apply(this, arguments);
        return `${classes} controls-Grid__Wrapper_table-layout`;
    },

    _getGridViewClasses(options): string {
        const classes = GridViewTable.superclass._getGridViewClasses.apply(this, arguments);

        // При горизонтальном скролле ЕДИНСТВЕННО ВЕРНОЕ значение свойства table-layout - это auto.
        // Такая настройка позволяет колонкам тянуться, тогда как fixed жестко ограничивает их ширины.
        const isFixedLayout = options.columnScroll !== true;
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_${isFixedLayout ? 'fixed' : 'auto'}`;
    },

    _getGridViewStyles(): string {
        return '';
    },

    onViewResized(): void {
        GridViewTable.superclass.onViewResized.apply(this, arguments);

        // Обновление авто-высоты контента, в IE иначе не работает.
        this._fixIETableCellAutoHeightBug();
    },

    _fixIETableCellAutoHeightBug(): void {
        if (typeof window === 'undefined') {
            return;
        }

        // Данная конструкция "пересчелкивает" высоту блока, довольно безопасно, без скачков.
        // В IE td поддерживает position: relative лишь частично, который так нужен для
        // позиционирования абсолютных частей элементов(actions, marker).
        // Не поддерживается автовысота, она считается только когда действительно поменялась высота стилями.
        window.requestAnimationFrame(() => {
            this._children.redrawWrapperStyles.innerHTML = '.controls-Grid_table-layout .controls-Grid__row-cell__content { flex-basis: 100% }';
            window.requestAnimationFrame(() => {
                this._children.redrawWrapperStyles.innerHTML = '';
            });
        });
    }
});

export default GridViewTable;
