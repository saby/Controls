import {descriptor} from 'Types/entity';

/**
 * Интерфейс контролов, позволяющих выделять интервалы от одного значения до другого.
 * @interface Controls/_dateRange/interfaces/IRangeSelectable
 * @public
 * @author Красильников А.С.
 */
var selectionTypes = {
    range: 'range',
    single: 'single',
    quantum: 'quantum',
    disable: 'disable'
};

export default {
    getDefaultOptions: function () {
        return {

            // TODO: имеет ли смысл оставлять опуию selectionType? selectionType: 'single', это частный случай quantum: {days: [1]}
            // Возможно стоит оставить, но ввести selectionType: 'quantum' и сделать что бы опция quantum работала только в этом случае.
            /**
             * @typedef {String} SelectionType
             * @description Режим выделения диапазона.
             * @variant range Выделение произвольного диапазона.
             * @variant single Выделение одного элемента.
             * @variant disable Выбора диапазона отключен.
             */
            /**
             * @name Controls/_dateRange/interfaces/IRangeSelectable#selectionType
             * @cfg {SelectionType} Определяет режим выделения диапазона.
             * @default range
             */
            selectionType: 'range'
        };
    },

    SELECTION_TYPES: selectionTypes,

    getOptionTypes: function () {
        return {
            selectionType: descriptor(String).oneOf(Object.keys(selectionTypes))
        };
    }
};
