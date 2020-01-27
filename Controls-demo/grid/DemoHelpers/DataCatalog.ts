import * as simpleResultTpl from 'wml!Controls-demo/grid/resources/ResultCellTemplates/Simple'
import * as numberResultTpl from 'wml!Controls-demo/grid/resources/ResultCellTemplates/Number'
import * as countryRatingNumber from 'wml!Controls-demo/grid/resources/CellTemplates/CountryRatingNumber'
import {constants} from 'Env/Env'
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto'
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription'
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived'
import * as Images from 'Controls-demo/DragNDrop/Images';
import * as itemTpl from  'wml!Controls-demo/grid/resources/CellTemplates/CellWithBgc';
import * as itemCountr from 'wml!Controls-demo/grid/resources/CellTemplates/CountryTemp';
import * as resTpl from 'wml!Controls-demo/grid/EditInPlace/EditingCell/resultsTpl';



const resultCellTpl = numberResultTpl;

function getCountriesStats() {
    return {
        getData: () => [
            {
                id: 0,
                number: 1,
                country: 'Россия',
                capital: 'Москва',
                population: 143420300,
                square: 17075200,
                populationDensity: 8
            },
            {
                id: 1,
                number: 2,
                country: 'Канада',
                capital: 'Оттава',
                population: 32805000,
                square: 9976140,
                populationDensity: 3
            },
            {
                id: 2,
                number: 3,
                country: 'Соединенные Штаты Америки',
                capital: 'Вашингтон',
                population: 295734100,
                square: 9629091,
                populationDensity: 30.71
            },
            {
                id: 3,
                number: 4,
                country: 'Китай',
                capital: 'Пекин',
                population: 1306313800,
                square: 9596960,
                populationDensity: 136.12
            },
            {
                id: 4,
                number: 5,
                country: 'Бразилия',
                capital: 'Бразилиа',
                population: 186112800,
                square: 8511965,
                populationDensity: 21.86
            },
            {
                id: 5,
                number: 6,
                country: 'Австралия',
                capital: 'Канберра',
                population: 20090400,
                square: 7686850,
                populationDensity: 3
            },
            {
                id: 6,
                number: 7,
                country: 'Индия',
                capital: 'Нью-Дели',
                population: 1080264400,
                square: 3287590,
                populationDensity: 328.59
            },
            {
                id: 7,
                number: 8,
                country: 'Аргентина',
                capital: 'Буэнос-Айрес',
                population: 39537900,
                square: 2766890,
                populationDensity: 4.29
            },
            {
                id: 8,
                number: 9,
                country: 'Казахстан',
                capital: 'Нур-Султан',
                population: 15185000,
                square: 2717300,
                populationDensity: 6.00
            },
            {
                id: 9,
                number: 10,
                country: 'Судан',
                capital: 'Хартум',
                population: 40187500,
                square: 2505810,
                populationDensity: 16.04
            },
            {
                id: 10,
                number: 11,
                country: 'Алжир',
                capital: 'Алжир',
                population: 32531900,
                square: 2381740,
                populationDensity: 13.66
            },
            {
                id: 11,
                number: 12,
                country: 'Конго',
                capital: 'Браззавиль',
                population: 60085800,
                square: 2345410,
                populationDensity: 25.62
            },
            {
                id: 12,
                number: 13,
                country: 'Мексика',
                capital: 'Мехико',
                population: 106202900,
                square: 1972550,
                populationDensity: 53.84
            },
            {
                id: 13,
                number: 14,
                country: 'Саудовская Аравия',
                capital: 'Эр-Рияд',
                population: 26417600,
                square: 1960582,
                populationDensity: 13.47
            },
            {
                id: 14,
                number: 15,
                country: 'Индонезия',
                capital: 'Джакарта',
                population: 241973900,
                square: 1919440,
                populationDensity: 126.06
            },
            {
                id: 15,
                number: 16,
                country: 'Ливия',
                capital: 'Триполи',
                population: 5765600,
                square: 1759540,
                populationDensity: 3.00
            },
            {
                id: 16,
                number: 17,
                country: 'Иран',
                capital: 'Тегеран',
                population: 68017900,
                square: 1648000,
                populationDensity: 41.27
            },
            {
                id: 17,
                number: 18,
                country: 'Монголия',
                capital: 'Улан-Батор',
                population: 2791300,
                square: 1565000,
                populationDensity: 2.00
            },
            {
                id: 18,
                number: 19,
                country: 'Перу',
                capital: 'Лима',
                population: 27925600,
                square: 1285220,
                populationDensity: 21.73
            }
        ],
        getColumnsForVirtual: () => [
            {
                displayProperty: 'number',
                width: '40px'
            },
            {
                displayProperty: 'country',
                width: '200px'
            },
            {
                displayProperty: 'capital',
                width: '200px'
            },
        ],

        getColumnsWithoutWidths: () => [
            {
                displayProperty: 'number',
            },
            {
                displayProperty: 'country',
            },
            {
                displayProperty: 'capital',
            },
            {
                displayProperty: 'population',
            },
            {
                displayProperty: 'square',
            },
            {
                displayProperty: 'populationDensity',
            }
        ],
        getColumnsForLoad: () => [
            {
                displayProperty: 'id',
                width: '50px',
            },
            {
                displayProperty: 'load',
                width: '200px',
            },

        ],
        getColumnsWithFixedWidths: () => [
            {
                displayProperty: 'number',
                width: '30px'
            },
            {
                displayProperty: 'country',
                width: '200px'
            },
            {
                displayProperty: 'capital',
                width: '100px'
            },
            {
                displayProperty: 'population',
                width: '150px'
            },
            {
                displayProperty: 'square',
                width: '100px'
            },
            {
                displayProperty: 'populationDensity',
                width: '120px'
            }
        ],
        getColumnsWithWidthsForSortingDemo: () => [
            {
                displayProperty: 'number',
                width: '40px',
            },
            {
                displayProperty: 'country',
                width: '300px'
            },
            {
                displayProperty: 'capital',
                width: '130px'
            },
            {
                displayProperty: 'population',
                width: '100px'
            },
            {
                displayProperty: 'square',
                width: '100px',
                align: 'right'
            },
            {
                displayProperty: 'populationDensity',
                width: '150px',
                result: 5.8,
                align: 'right'
            }
        ],
        getColumnsWithWidths: () => [
            {
                displayProperty: 'number',
                width: '40px',
            },
            {
                displayProperty: 'country',
                width: '300px',
            },
            {
                displayProperty: 'capital',
                width: 'max-content',
                compatibleWidth: '98px'
            },
            {
                displayProperty: 'population',
                width: 'max-content',
                result: 3956986345,
                resultTemplate: resultCellTpl,
                compatibleWidth: '100px'
            },
            {
                displayProperty: 'square',
                width: 'max-content',
                result: 12423523,
                resultTemplate: resultCellTpl,
                compatibleWidth: '83px'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                result: 5.8,
                resultTemplate: resultCellTpl,
                compatibleWidth: '175px'
            }
        ],
        getColumnsWithAlign: () => [
            {
                displayProperty: 'number',
                width: '40px',
                align: 'right'
            },
            {
                displayProperty: 'country',
                width: '300px',
                align: 'center'
            },
            {
                displayProperty: 'capital',
                width: '1fr',
                align: 'left'
            },
            {
                displayProperty: 'population',
                width: '150px',
                align: 'right'
            },
            {
                displayProperty: 'square',
                width: '150px',
                align: 'left'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                compatibleWidth: '60px'
            }
        ],
        getColumnsWithValign: () => [
            {
                displayProperty: 'number',
                width: '40px',
                valign: 'right'
            },
            {
                displayProperty: 'country',
                width: '300px',
                valign: 'top'
            },
            {
                displayProperty: 'capital',
                width: '1fr',
                valign: 'bottom'
            },
            {
                displayProperty: 'population',
                width: '150px'
            }
        ],
        getDefaultHeader: () => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Столица'
            },
            {
                title: 'Население'
            },
            {
                title: 'Площадь км2'
            },
            {
                title: 'Плотность населения чел/км2'
            }
        ],
        getLongHeader: () => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Столица строны из рейтинга'
            },
            {
                title: 'Население страны по данным на 2018г.'
            },
            {
                title: 'Площадь км2'
            },
            {
                title: 'Плотность населения чел/км2'
            }
        ],
        getMultiHeader: () => [
            {
                title: '#',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Географические данные',
                startRow: 1,
                endRow: 2,
                startColumn: 2,
                endColumn: 4,
                align: 'center'
            },
            {
                title: 'Страна',
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Столица',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 4,
                endColumn: 7,
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 6,
                endColumn: 7
            }
        ],
        getMultiHeaderVar2: () => [
            {
                title: 'Географические характеристики стран',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Столица',
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 3,
                endColumn: 6,
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            }
        ],
        getHeaderWithSorting: () => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Название столицы страны',
                sortingProperty: 'capital',
                align: 'left'
            },
            {
                title: 'Население',
                sortingProperty: 'population',
                align: 'left'
            },
            {
                title: 'Площадь км2',
                sortingProperty: 'square',
                align: 'right'
            },
            {
                title: 'Плотность населения чел/км2',
                sortingProperty: 'populationDensity',
                align: 'right'
            }
        ],
        getColumnsWithTemplate: () => [
            {
                displayProperty: 'number',
                width: 'max-content',
                compatibleWidth: '44px',
                template: countryRatingNumber
            },
            {
                displayProperty: 'country',
                width: '300px'
            },
            {
                displayProperty: 'capital',
                width: '100px'
            },
            {
                displayProperty: 'population',
                width: '150px'
            },
            {
                displayProperty: 'square',
                width: '150px'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                compatibleWidth: '60px'
            }
        ],
    }
}

function getTasks() {
    return {
        getData: () => [
            {
                id: 1,
                message: 'Регламент: Ошибка в разработку. Автор: Дубенец Д.А. Описание: (reg-chrome-presto) 3.18.150 controls - Поехала верстка кнопок когда они задизейблены prestocarry',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 2,
                message: 'Регламент: Ошибка в разработку. Автор: Волчихина Л.С. Описание: Отображение колонок. При снятии галки с колонки неверная всплывающая подсказка',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 3,
                message: 'Смотри надошибку. Нужно сделать тесты, чтобы так в будущем не разваливалось',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Выполнение'
            },
            {
                id: 4,
                message: 'Регламент: Ошибка в разработку. Автор: Оборевич К.А. Описание: Розница. Замечания к шрифтам в окнах Что сохранить в PDF/Excel и Что напечатать',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '12 ноя',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 5,
                message: 'Пустая строка при сканировании в упаковку Тест-онлайн adonis1/adonis123 1) Создать документ списания 2) отсканировать в него наименование/открыть РР/+Упаковка 3) Заполнить данные по упаковке/отсканировать еще 2 марки',
                fullName: 'Корбут Антон',
                photo: getImages().korbyt,
                date: '5 мар',
                state: 'Выполнение'
            },
            {
                id: 6,
                message: 'Разобраться с getViewModel - либо наследование, либо создавать модель прямо в TreeControl и передавать в BaseControl, либо ещё какой то вариант придумать.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 7,
                message: 'Научить reload обновлять табличное представление VDOM с сохранением набранных данных (например загруженных по кнопке "еще"). В данный момент есть deepReload, но он не сохраняет набранные данные.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 8,
                message: 'Лесенка на VDOM. Перевести алгоритм на предварительный расчет в модели. Сделать демку.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 9,
                message: 'Прошу сделать возможность отключения: 1) ховера на айтемах  у Controls/List, 2) курсор: поинтер',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 10,
                message: 'через шаблон ячейки должна быть возможность управлять colspan (или rowspan) отдельной ячейки. <ws:partial template="standartCellTemplate" colspan="2"> типа такого если я напишу, то у меня будет ячейка на две колонки',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 11,
                message: 'Не работают хлебные крошки и навигация по ним если идентификатор записи равен 0 Как повторить',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '28 фев',
                state: 'Выполнение'
            },
            {
                id: 12,
                message: 'Не работает collapse в группировке в дереве test-online.sbis.ru сталин/Сталин123',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '26 фев',
                state: 'Выполнение'
            }
        ],
        getColumns: () => [
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto',
                width: '98px'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription',
                width: '1fr'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived',
                width: '200px'
            }
        ],
        getDefaultColumns: () => [
            {
                displayProperty: 'id',
                width: '30px'
            },
            {
                displayProperty: 'state',
                width: '200px'
            },
            {
                displayProperty: 'date',
                width: '100px'
            }
        ],
    }
}

function getImages() {
    return {
        dogadkin: constants.resourceRoot + 'Controls-demo/grid/resources/images/dogadkin.png',
        kesareva: constants.resourceRoot + 'Controls-demo/grid/resources/images/kesareva.png',
        korbyt: constants.resourceRoot + 'Controls-demo/grid/resources/images/korbyt.png',
        krainov: constants.resourceRoot + 'Controls-demo/grid/resources/images/krainov.png',
        baturina: constants.resourceRoot + 'Controls-demo/grid/resources/images/baturina.png'
    }
}

function getPorts() {
    return {
        getData: () => [
            {
                id: 1,
                name: 'Новороссийский морской торговый порт',
                invoice: 3500,
                documentSign: 1,
                documentNum: 10,
                taxBase: 17215.00,
                document: 'б/н',
                documentDate: null,
                serviceContract: null,
                description: 'морской/речной',
                shipper: null
            },
            {
                id: 2,
                name: 'Морской порт Санкт-Петербург',
                invoice: 3501,
                documentSign: 1,
                documentNum: 10,
                taxBase: 21015.00,
                document: '48000560-ABCC',
                documentDate: null,
                serviceContract: null,
                description: 'морской/речной',
                shipper: null
            },
            {
                id: 3,
                name: 'Морской торговый порт Усть-Луга',
                invoice: 3502,
                documentSign: 2,
                documentNum: 10,
                taxBase: 890145.04,
                document: '456990005',
                documentDate: null,
                serviceContract: null,
                description: 'ж/д, морской/речной',
                shipper: null
            }
        ],
        getColumns: () => [
            {
                width: '100px',
                displayProperty: 'invoice'
            },
            {
                width: '200px',
                displayProperty: 'documentSign'
            },
            {
                width: '200px',
                displayProperty: 'document'
            },
            {
                width: '1fr',
                displayProperty: 'description'
            },
            {
                width: '200px',
                displayProperty: 'taxBase'
            }
        ],
        getDocumentSigns: () => [
            {
                id: 1,
                title: 'ТД предусмотрено'
            },
            {
                id: 2,
                title: 'ТД не предусмотрено'
            }
        ]
    }
}

function getEditing() {
    return {
        getEditingData: () => [
            {
                id: '1',
                title: 'Время',
                description: 'Погода',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                id: '2',
                title: 'Масса',
                description: 'Скорость',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                id: '3',
                title: 'Давление',
                description: 'Плотность',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
        ],
        getEditingColumns: () => [
            {
                displayProperty: 'title',
                width: '200px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
            },
            {
                displayProperty: 'price',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 3
            },
            {
                displayProperty: 'balance',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 3
            },
            {
                displayProperty: 'description',
                width: '200px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
            },
            {
                displayProperty: 'costPrice',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 9
            },
            {
                displayProperty: 'balanceCostSumm',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 6
            }
        ]
    };
}

function forShowWidths() {
    return {
        getData() {
            return [
                {
                    id: 1,
                    px: 'Строго 150px',
                    fr1of3: '1/3 свободного пространства. fr - гибкая ширина. fr расчитывается как доля от оставшегося свободного пространства внутри грида. Грубо говоря, сначала браузер просчитает ширины всех остальных колонок, потом fr',
                    fr2of3: '2/3 свободного пространства. После этого доступная ширина будет разделена на сумму всех коэффициентов указаных у колонок с fr(в данном гриде - 3) и распределена между колонками, в соответствии с коэффициентами.',
                    minMax: 'От 50px до 200px в зависимости от контента ячеек колонки',
                    auto: 'Пример работы auto',
                    maxContent: 'По ширине'
                },
                {
                    id: 2,
                    px: 'Ячейка 2/1',
                    maxContent: 'самой широкой ячеки',
                    fr1of3: 'Ячейка 2/3',
                    fr2of3: 'Ячейка 2/4',
                    auto: 'Ячейка 3/4',
                    minMax: 'Ячейка 2/6'
                }
            ]
        },
        getHeader() {
            return [
                {
                    title: '150px'
                },
                {
                    title: 'max-content'
                },
                {
                    title: '1fr'
                },
                {
                    title: '2fr'
                },
                {
                    title: 'auto'
                },
                {
                    title: 'minmax(50px, 200px)'
                }
            ]
        },
        getColumns1() {
            return [
                {
                    displayProperty: 'px',
                    width: '150px'
                },
                {
                    displayProperty: 'maxContent',
                    width: 'max-content',
                    compatibleWidth: '147px'
                },
                {
                    displayProperty: 'fr1of3',
                    width: '1fr',
                    compatibleWidth: '30%'
                },
                {
                    displayProperty: 'fr2of3',
                    width: '2fr',
                    compatibleWidth: '60%'
                },
                {
                    displayProperty: 'auto',
                    width: 'auto',
                    compatibleWidth: '139px'
                },
                {
                    displayProperty: 'minMax',
                    width: 'minmax(50px, 200px)',
                    compatibleWidth: '200px'
                }
            ]
        },
    }
}

const cellPadding = () => ({
    getCollumns: () => ([
        {
            displayProperty: 'number',
            width: '100px',
            template: itemCountr,
            cellPadding: {
                right: 's'
            }
        },
        {
            displayProperty: 'country',
            width: '100px',
            template: itemTpl,
            cellPadding: {
                left: 's',
                right: 'null'
            }
        },
        {
            displayProperty: 'capital',
            width: '100px'
        },
    ]),
    getData: () => ([
        {
            id: 0,
            number: 'Russian Federation',
            country: 'Российская Федерация',
            capital: 'Москва',
            population: 143420300,
            square: 17075200,
            populationDensity: 8
        },
        {
            id: 1,
            number: 'Canada',
            country: 'Канада',
            capital: 'Оттава',
            population: 32805000,
            square: 9976140,
            populationDensity: 3
        },
        {
            id: 2,
            number: 'Unated States of America',
            country: 'Соединенные Штаты Америки',
            capital: 'Вашингтон',
            population: 295734100,
            square: 9629091,
            populationDensity: 30.71
        },
        {
            id: 3,
            number: 'Peoples Republic of China',
            country: 'Китайская народная республика',
            capital: 'Пекин',
            population: 1306313800,
            square: 9596960,
            populationDensity: 136.12
        },
        {
            id: 4,
            number: 'trinidad and tabago',
            country: 'Тринидад и Табаго',
            capital: 'Город',
            population: 186112800,
            square: 8511965,
            populationDensity: 21.86
        }
    ]),
    getCellPaddingHeader: () => {
        return [
            {
                title: 'right: S',
            },
            {
                title: 'left: S and right: null',
            },
            {
                title: 'left: default',
            }
        ];
    }
})

const DragNDrop = () => ({
    data: [{
        id: 0,
        title: 'America',
        additional: 'USA',
        image: Images[0],
        'Раздел@': true,
        'Раздел': null
    }, {
        id: 1,
        title: 'France',
        additional: 'Europe',
        image: Images[1],
        'Раздел@': true,
        'Раздел': null
    }, {
        id: 2,
        title: 'Solar',
        additional: 'Star',
        image: Images[2],
        'Раздел@': true,
        'Раздел': null
    }, {
        id: 3,
        title: 'Luna',
        additional: 'Sattelite',
        image: Images[3],
        'Раздел@': null,
        'Раздел': null
    }, {
        id: 4,
        title: 'Pizza',
        additional: 'Food',
        image: Images[4],
        'Раздел@': null,
        'Раздел': null
    }, {
        id: 5,
        title: 'Monkey',
        additional: 'Animals',
        image: Images[5],
        'Раздел@': null,
        'Раздел': null
    }],
    columns: [{
        displayProperty: 'id',
        width: '30px'
    }, {
        displayProperty: 'title',
        width: '200px',
    }, {
        displayProperty: 'additional',
        width: '200px',
    }],
})

const changeSourceData = () => ({
    data: [
        {
            id: 1,
            load: 'One',
            title: 'hello'
        }, {
            id: 2,
            load: 'Two',
            title: 'hello'

        }, {
            id: 3,
            load: 'three',
            title: 'hello'

        }, {
            id: 4,
            load: 'Four',
            title: 'hello'

        }, {
            id: 5,
            load: 'Five',
            title: 'hello'

        }, {
            id: 6,
            load: 'Six',
            title: 'hello'

        }, {
            id: 7,
            load: 'Seven',
            title: 'hello'

        }],
    data2: [
        {
            id: 1,
            load: 1,
            title: 'hello'
        }, {
            id: 2,
            load: 2,
            title: 'hello'

        }, {
            id: 3,
            load: 2,
            title: 'hello'

        }, {
            id: 4,
            load: 2,
            title: 'hello'

        }, {
            id: 5,
            load: 2,
            title: 'hello'

        }, {
            id: 6,
            load: 2,
            title: 'hello'

        }, {
            id: 7,
            load: 2,
            title: 'hello'

        }]
});


const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
    ,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
    ,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
    ,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
    ,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
    ,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
    ,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
    ,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
    ,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
    ,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
    ,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
    ,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
    ,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
    ,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
    ,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

export {
    getCountriesStats,
    getTasks,
    getPorts,
    forShowWidths,
    getEditing,
    countries,
    DragNDrop,
    cellPadding,
    changeSourceData
}
