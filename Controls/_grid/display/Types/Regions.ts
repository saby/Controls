const A_STYLE = 'Аспект "Стилевое оформление. Классы и стили"';
const A_LADDER = 'Аспект "Лесенка"';
const A_ABSTRACT = 'Абстрактные методы';

export const ROW_MIXIN_REQUIRED = [
    A_STYLE,
    A_LADDER,
    'Аспект "Ячейки. Создание, обновление, перерисовка, colspan и т.д."',
    'Аспект "Разделители строк и колонок"',
    'Аспект "Шаблон всей строки. Состояние, когда в строке одна ячейка, растянутая на все колонки"',
    A_ABSTRACT
];

export const CELL_REQUIRED = [
    A_STYLE,
    A_LADDER,
    A_ABSTRACT
];
