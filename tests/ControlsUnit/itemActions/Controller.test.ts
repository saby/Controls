import {assert} from 'chai';
import {stub, SinonStub} from 'sinon';
import {Model, Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ANIMATION_STATE, Collection, CollectionItem, ISwipeConfig} from 'Controls/display';
import {IOptions as ICollectionOptions} from 'Controls/_display/Collection';

import {
    Controller as ItemActionsController,
    IControllerOptions
} from 'Controls/_itemActions/Controller';
import {
    IItemAction,
    TActionDisplayMode,
    TItemActionShowType
} from 'Controls/_itemActions/interface/IItemAction';
import {IItemActionsItem} from 'Controls/_itemActions/interface/IItemActionsItem';
import {IItemActionsCollection} from 'Controls/_itemActions/interface/IItemActionsCollection';
import {DOMUtil} from 'Controls/sizeUtils';

// 3 опции будут показаны в тулбаре, 6 в контекстном меню
const itemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU_TOOLBAR
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'Profile',
        tooltip: 'This is awesome Profile you\'ve never seen',
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        'parent@': true
    },
    {
        id: 5,
        title: 'Documentation',
        showType: TItemActionShowType.TOOLBAR,
        parent: 4
    },
    {
        id: 6,
        title: 'Development',
        showType: TItemActionShowType.MENU_TOOLBAR,
        parent: 4
    },
    {
        id: 7,
        title: 'Exploitation',
        showType: TItemActionShowType.MENU,
        parent: 4,
        'parent@': true
    },
    {
        id: 8,
        title: 'Approval',
        showType: TItemActionShowType.MENU,
        parent: 7,
        'parent@': true
    }
];

// Нет опций для контекстного меню
const flatItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR
    }
];

// Нет опций для контекстного меню
const onlyOneItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    }
];

// Только одна опция в тулбаре, одна - в контекстном меню
const horizontalOnlyItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU
    }
];

// Варианты отображением иконки и текста
const displayModeItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.ICON
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.TITLE
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'Profile',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.BOTH
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.AUTO
    }
];

const data = [
    {id: 1, name: 'Philip J. Fry', gender: 'M', itemActions: []},
    {
        id: 2,
        name: 'Turanga Leela',
        gender: 'F',
        itemActions: [
            {
                id: 1,
                icon: 'icon-Link',
                title: 'valar morghulis',
                showType: TItemActionShowType.TOOLBAR
            },
            {
                id: 2,
                icon: 'icon-Print',
                title: 'print',
                showType: TItemActionShowType.MENU
            }
        ]
    },
    {id: 3, name: 'Professor Farnsworth', gender: 'M', itemActions: []},
    {id: 4, name: 'Amy Wong', gender: 'F', itemActions: []},
    {id: 5, name: 'Bender Bending Rodriguez', gender: 'R', itemActions: []}
];

describe('Controls/_itemActions/Controller', () => {
    let itemActionsController: ItemActionsController;
    let collection: IItemActionsCollection;
    let initialVersion: number;

    function makeCollection(rawData: Array<{
        id: number,
        name: string,
        gender: string,
        itemActions: IItemAction[]
    }>): IItemActionsCollection {

        const list = new RecordSet({
            keyProperty: 'id',
            rawData
        });
        const collectionConfig: ICollectionOptions<Record, IItemActionsItem> = {
            collection: list,
            keyProperty: 'id',
            leftSpacing: null,
            rightSpacing: null,
            rowSpacing: null,
            searchValue: null,
            editingConfig: null
        };
        // @ts-ignore
        return new Collection<Record>(collectionConfig);
    }

    function initializeControllerOptions(options?: IControllerOptions): IControllerOptions {
        return {
            collection: options ? options.collection : null,
            itemActions: options ? options.itemActions : null,
            itemActionsProperty: options ? options.itemActionsProperty : null,
            visibilityCallback: options ? options.visibilityCallback : null,
            itemActionsPosition: options ? options.itemActionsPosition : null,
            style: options ? options.style : null,
            theme: options ? options.theme : 'default',
            actionAlignment: options ? options.actionAlignment : null,
            actionCaptionPosition: options ? options.actionCaptionPosition : null,
            editingToolbarVisible: options ? options.editingToolbarVisible : false,
            editArrowAction: options ? options.editArrowAction : null,
            editArrowVisibilityCallback: options ? options.editArrowVisibilityCallback: null,
            contextMenuConfig: options ? options.contextMenuConfig: null,
            iconSize: options ? options.iconSize: 'm',
            editingItem: options ? options.editingItem : null,
            itemActionsVisibility: options ? options.itemActionsVisibility : 'onhover',
            actionMode: "strict"
        };
    }

    beforeEach(() => {
        collection = makeCollection(data);
        // @ts-ignore
        initialVersion = collection.getVersion();
        itemActionsController = new ItemActionsController();
        // @ts-ignore
        itemActionsController.update(initializeControllerOptions({
            collection,
            itemActions,
            theme: 'default'
        }));
    });

    describe('Controller initialization is correct', () => {
        // T1.1.  Для каждого элемента коллекции задаётся набор операций.
        it('should assign item actions for every item', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotNull(actionsOf5, 'actions were not set to item 5');
            assert.equal(actionsOf1.showed[0].title, 'message',
                'first action of item 1 should be \'message\'');
            assert.equal(actionsOf5.showed[0].title, 'message',
                'first action of item 5 should be \'message\'');
        });

        // T1.1.1.  Ннабор операций задаётся, в том числе для активного Item.
        // то, что активный элемент был добавлен в исключения - по -видимому, рудимент,
        // Возможно, предполагалось, что активному item опции задаются отдельно, поэтому если в рамках
        // https://online.sbis.ru/opendoc.html?guid=716cc8d4-cea2-4335-b9b1-a8674bdaf5f9 будет реализована какая-то
        // такая логика,
        // возможно, следует вернуть проверку на active
        it('should assign item actions for every item', () => {
            collection.getItemBySourceKey(1).setActive(true);
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.equal(actionsOf1.showed[0].title, 'message', 'first action of item 1 should be \'message\'');
        });

        // T1.2.  В коллекции происходит набор конфигурации для шаблона ItemActions.
        it('should build a config for item action template', () => {
            const config = collection.getActionsTemplateConfig();
            assert.isNotNull(config, 'getActionsTemplateConfig hasn\'t been set to collection');
        });

        // T1.3. При установке набора операций вызывается VisibilityCallback.
        it('should call visibilityCallback for every item action', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                visibilityCallback: (action: IItemAction, item: Record) => {
                    if (item.getKey() === 4 && action.id === 2) {
                        return false;
                    }
                    return true;
                }
            }));
            const actionsOf4 = collection.getItemBySourceKey(4).getActions();
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.isNotNull(actionsOf4, 'actions were not set to item 4');
            assert.isNotNull(actionsOf5, 'actions were not set to item 5');
            assert.notExists(actionsOf4.showed.find((action) => action.title === 'message'),
                'item 4 should not display \'message\' action');
            assert.exists(actionsOf5.showed.find((action) => action.title === 'message'),
                'item 5 should display \'message\' action');
        });

        // T1.4. При установке набора операций учитывается itemActionsProperty
        it('should consider itemActionsProperty', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsProperty: 'itemActions'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            const actionsOf2 = collection.getItemBySourceKey(2).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotNull(actionsOf2, 'actions were not set to item 2');
            assert.isEmpty(actionsOf1.showed, 'What the hell any actions appeared for item 1?');
            assert.equal(actionsOf2.showed[0].title, 'valar morghulis');
        });

        // T1.6. После установки набора операций у коллекции устанавливается параметр actionsAssigned
        it('should set actionsAssigned value as true', () => {
            assert.isTrue(collection.isActionsAssigned());
        });

        // T1.7. Если требуется добавить кнопку меню, то она добавляется в список showed операций
        it('should append menu button to item actions when it necessary', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isTrue(actionsOf1.showed[actionsOf1.showed.length - 1].isMenu,
                'Menu button has not been appended to actions array');
        });

        // T1.7. Если не требуется добавить кнопку меню, то она не добавляется в список showed операций
        it('should not append menu button to item actions when it not necessary', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: flatItemActions,
                theme: 'default'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotTrue(actionsOf1.showed[actionsOf1.showed.length - 1].isMenu,
                'What the hell menu button appeared for item?');
        });

        // T1.8. В список showed операций изначально попадают операции с showType TOOLBAR или MENU_TOOLBAR,
        // и у которых нет родителя
        it('should add to "showed" item actions only actions with showType TOOLBAR or MENU_TOOLBAR, w/o parent', () => {
            const actionsOf4 = collection.getItemBySourceKey(4).getActions();
            assert.isNotNull(actionsOf4, 'actions were not set to item 4');
            assert.notEqual(actionsOf4.showed[0].title, 'phone',
                'What the hell \'phone\' action is in \'showed\' array?');
        });

        // T1.8.1 При установке только одной опции нужно игнорировать showType и всё показывать как TOOLBAR
        it('should ignore showType and show action as its showType was TOOLBAR when it is ' +
            ' the only action in list', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: onlyOneItemActions,
                theme: 'default'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotTrue(actionsOf1.showed[actionsOf1.showed.length - 1].isMenu,
                'It seems, that sly menu button came here!');
            assert.equal(actionsOf1.showed[actionsOf1.showed.length - 1].showType, TItemActionShowType.MENU,
                'something strange happened to lonely item action...');
        });

        // T1.9. После установки набора операций, операции с иконками содержат в поле icon CSS класс
        // “controls-itemActionsV__action_icon icon-size” (оч сомнительный тест)
        // TODO Возможно, установка этого класса переедет в шаблон
        it('should set "controls-itemActionsV__action_icon_theme-default" CSS class for' +
            'shown item actions icons', () => {
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.exists(actionsOf5, 'actions were not set to item 5');
            assert.notEqual(actionsOf5.showed[0].icon.indexOf('controls-itemActionsV__action_icon_theme'), -1,
                'Css class \'controls-itemActionsV__action_icon_theme-\' should be added to item');
        });

        // T1.10. При реальной смене у операций элементов настроек all/showed должна изменяться версия модели
        // (если это возможно проверить)
        // TODO Возможно, это не корректный тест, т.к. по обсуждению от 08.05 была идея убрать смену версии модели
        //  из контроллера.
        it('should call collection version update after changing assigned actions', () => {
            // @ts-ignore
            assert.notEqual(collection.getVersion(), initialVersion);
        });

        // T1.11. Если в ItemActions всё пусто, не должно происходить инициализации
        it('should not initialize item actions when itemActions and itemActionsProperty are not set', () => {
            collection = makeCollection(data);
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: null,
                theme: 'default'
            }));
            const actionsOf3 = collection.getItemBySourceKey(3).getActions();
            assert.notExists(actionsOf3, 'actions have been set to item 3, but they shouldn\'t');
        });

        // T1.12. При смене модели нужно менять модель также и в контроллере
        it('should change model inside controller when model is not the same', () => {
            const newData = [
                {id: 6, name: 'Doctor John Zoidberg', gender: 'M', itemActions: []},
                {id: 7, name: 'Zapp Brannigan', gender: 'M', itemActions: []}
            ];
            const newCollection = makeCollection(newData);
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection: newCollection,
                itemActions,
                theme: 'default'
            }));
            assert.exists(newCollection.getItemBySourceKey(6).getActions());
        });

        // T1.14 Необходимо корректно расчитывать showTitle, showIcon на основе displayMode
        describe('displayMode calculations', () => {
            beforeEach(() => {
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: displayModeItemActions,
                    theme: 'default'
                }));
            });
            // T1.14.1. Должны учитываться расчёты отображения icon при displayMode=icon
            it('should consider showIcon calculations when displayMode=icon', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[0].showIcon, 'we expected to see icon here');
                assert.isNotTrue(actionsOf1.showed[0].showTitle, 'we didn\'t expect to see title here');
            });

            // T1.14.2. Должны учитываться расчёты отображения title при displayMode=title
            it('should consider showTitle calculations when displayMode=title', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[1].showTitle, 'we expected to see title here');
                assert.isNotTrue(actionsOf1.showed[1].showIcon, 'we didn\'t expect to see icon here');
            });

            // T1.14.3. Должны учитываться расчёты отображения title и icon при displayMode=both
            it('should consider showTitle calculations when displayMode=both', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[2].showTitle, 'we expected to see title here');
                assert.isTrue(actionsOf1.showed[2].showIcon, 'we expected to see icon here');
            });

            // T1.14.4. Должны учитываться расчёты отображения title и icon при displayMode=auto
            it('should consider showTitle calculations when displayMode=auto', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[3].showIcon, 'we expected to see icon here');
                assert.isNotTrue(actionsOf1.showed[3].showTitle, 'we didn\'t expect to see title here');
            });
        });

        // T1.15. Если не указано свойство опции tooltip, надо подставлять title
        it('should change tooltip to title when no tooltip is set', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.equal(actionsOf1.showed[0].tooltip, 'message',
                'tooltip should be the same as title here');
            assert.equal(actionsOf1.showed[1].tooltip, 'This is awesome Profile you\'ve never seen',
                'tooltip should be not the same as title here');
        });

        // T1.16 Если редактируется или создаётся запись, actions будут добавлены в showed только для редактируемой записи
        it('should not add any item actions when records are editing', () => {
            const item3 = collection.getItemBySourceKey(3);
            // @ts-ignore
            item3.setEditing(true, item3.getContents());
            // @ts-ignore
            collection.setEditing(true);
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default'
            }));
            const actionsOf2 = collection.getItemBySourceKey(2).getActions();
            assert.equal(item3.getActions().showed.length, 4, 'item 4 is editing and should contain 4 itemActions');
            assert.equal(actionsOf2.showed.length, 0,
                'item 4 is editing and item 2 should not contain any itemActions');
        });
        // T1.17 Если редактируемой(добавляемой) записи нет в рекордсете операции над записью инициализируются для нее
        it('should assign itemActions for editig item that is not in collection', () => {
            const list = new RecordSet({
                keyProperty: 'id',
                rawData: [{id: 100, name: 'Philip J. Fry', gender: 'M', itemActions: []},]
            });
            const editingItem = new CollectionItem<Record>({contents: list.at(0)});
            editingItem.setEditing(true, editingItem.getContents());
            // @ts-ignore
            collection.setEditing(true);
            itemActionsController.update(initializeControllerOptions({
                // @ts-ignore
                editingItem,
                collection,
                itemActions,
                theme: 'default'
            }));
            const actionsOf2 = collection.getItemBySourceKey(2).getActions();
            assert.equal(editingItem.getActions().showed.length, 4,
                'item 4 is editing and should contain 4 itemActions');
            assert.equal(actionsOf2.showed.length, 0,
                'item 4 is editing and item 2 should not contain any itemActions');
        });

        // T1.17. Должны адекватно набираться ItemActions для breadcrumbs (когда getContents() возвращает массив
        // записей)
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен
        //  знать о breadcrumbs
        //  надо разобраться как в коллекцию добавить breadcrumbs
        // it('should set item actions when some items are breadcrumbs', () => {});

        // T1.18. Должны адекватно набираться ItemActions если в списке элементов коллекции присутствуют группы
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен
        //  знать о группах
        //  надо разобраться как в коллекцию добавить group
        // it('should set item actions when some items are groups', () => {});
    });

    // T2. Активация и деактивация Swipe происходит корректно
    describe('activateSwipe(), deactivateSwipe() and getSwipeItem() ', () => {
        let stubGetElementsWidth: SinonStub;
        let stubGetWidthForCssClass: SinonStub;

        beforeEach(() => {
            stubGetElementsWidth = stub(DOMUtil, 'getElementsWidth');
            stubGetElementsWidth.callsFake((itemsHtml: string[], itemClass: string, considerMargins?: boolean) => (
                itemsHtml.map((item) => 25)
            ));
            stubGetWidthForCssClass = stub(DOMUtil, 'getWidthForCssClass');
            stubGetWidthForCssClass.callsFake((content: string, blockClass: string, considerMargins?: boolean) => 0);
        });

        afterEach(() => {
            stubGetElementsWidth.restore();
            stubGetWidthForCssClass.restore();
        });

        // T2.1. В коллекции происходит набор конфигурации для Swipe, если позиция itemActions не outside.
        // itemActions сортируются по showType.
        it('should collect swiped item actions sorted by showType when position !== "outside"', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'inside'
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration for inside positioned actions');
            assert.equal(config.itemActions.showed[0].title, 'Profile', 'First item should be \'message\'');
        });

        // T2.2. В коллекции не происходит набор конфигурации для Swipe, если позиция itemActions outside
        it('should not collect swipe config when position === "outside"', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'outside'
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.notExists(config);
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        it('should use horizontal measurer when actionAlignment=\'horizontal\'', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'horizontal'
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.3.1. Если при инициализации в конфиге контекстного меню передан footerTemplate нужно принудительно
        // показывать кнопку "ещё"
        it('should add menu button for horizontal swipe when contextMenu.footerTemplate is passed', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'horizontal',
                contextMenuConfig: {
                    footerTemplate: 'template'
                }
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration');
            assert.isTrue(config.itemActions.showed[config.itemActions.showed.length -1].isMenu, 'menu button was not added');
        });

        // T2.3.2. Если при инициализации в конфиге контекстного меню передан headerTemplate нужно принудительно
        // показывать кнопку "ещё"
        it('should add menu button for horizontal swipe when contextMenu.headerTemplate is passed', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'horizontal',
                contextMenuConfig: {
                    headerTemplate: 'template'
                }
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration');
            assert.isTrue(config.itemActions.showed[config.itemActions.showed.length - 1].isMenu, 'menu button was not added');
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        // T2.5. Конфигурация для Swipe происходит с установкой twoColumnsActions,
        // если measurer вернул в конфиг twoColumns
        it('should use vertical measurer when actionAlignment=\'vertical\'', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 100, 65);
            const config = collection.getSwipeConfig();
            assert.isBoolean(config.twoColumns);
            assert.exists(config.twoColumnsActions);
        });

        // T2.4. Конфигурация для Swipe происходит с actionAlignment=’horizontal’, если только одна опция
        // доступна в тулбаре
        it('should collect swipe configuration with actionAlignment="horizontal" when only one option should be showed in toolbar', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.4.1 Необходимо обновлять конфиг ItemActions после расчёта конфигурации swipe
        it('should Update actionsTemplateConfig after calculating itemSwipe configuration', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getActionsTemplateConfig();
            assert.equal(config.actionAlignment, 'horizontal');
        });

        // T2.4.2 Если свайпнули элемент, то при обновлении контроллера надо в шаблон прокидывать правильно
        // рассчитанный actionsTemplateConfig.
        // Такой кейс возникает, например, нажали на какую-либо опцию в свайпе. Например, "Показать/скрыть".
        // При этом фокус не потерялся, ItemActions не изменились - свайп не закрылся, но его надо перерисовать,
        // т.к. поменялось значение, которое возвращает visibilityCallback() для actions.
        it('should update actionsTemplateConfig with correct options when item is swiped', () => {
            const updateWithSameParams = () => {
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: horizontalOnlyItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
            };
            updateWithSameParams();
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getActionsTemplateConfig();
            assert.equal(config.actionAlignment, 'horizontal');
            // Не деактивировали свайп и вызвали обновление ItemActions
            updateWithSameParams();
            assert.equal(config.actionAlignment, 'horizontal');
        });

        // T2.4.3 Если свайпнули другой элемент, то при обновлении контроллера надо в шаблон прокидывать
        // правильно рассчитанный конфиг
        it('should update actionsTemplateConfig with correct options when another item is swiped', () => {
            const updateWithSameParams = () => {
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: horizontalOnlyItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
            };
            updateWithSameParams();
            itemActionsController.activateSwipe(3, 100, 50);
            const config = collection.getActionsTemplateConfig();
            assert.equal(config.actionAlignment, 'horizontal');
            // Активировали новый свайп и обновили конфиг
            itemActionsController.activateSwipe(2, 100, 100);
            updateWithSameParams();
            assert.equal(config.actionAlignment, 'vertical');
        });

        // T2.6. Устанавливается swiped элемент коллекции
        // T2.7. Устанавливается активный элемент коллекции
        // T2.8. Метод getSwipedItem возвращает корректный swiped элемент
        it('should set swiped and active collection item', () => {
            itemActionsController.activateSwipe(2, 100, 50);
            const activeItem = collection.getActiveItem();
            // @ts-ignore
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.exists(activeItem, 'Item has not been set active');
            assert.exists(swipedItem, 'Item has not been set swiped');
            // @ts-ignore
            assert.equal(activeItem, swipedItem, 'Active item is not the same as swiped item');
        });

        // T2.9. Происходит сброс swiped элемента, активного элемента, конфигурации для Swipe при деактивации свайпа
        it('should reset swiped item, active item and swipe configuration when deactivating swipe', () => {
            itemActionsController.activateSwipe(1, 100, 50);
            itemActionsController.deactivateSwipe();
            const activeItem = collection.getActiveItem();
            // @ts-ignore
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            const config = collection.getSwipeConfig();
            assert.notExists(activeItem, 'Item \'active\' flag has not been reset');
            assert.notExists(swipedItem, 'Item \'swiped\' flag has not been reset');
            assert.notExists(config, 'Collection\'s swipe config has not been reset');
        });

        // T2.10. При свайпе добавляется editArrow в набор операций, вызывается editArrowVisibilityCallback.
        it('should add editArrow for every item action when necessary', () => {
            const editArrowAction: IItemAction = {
                id: 'view',
                icon: '',
                showType: TItemActionShowType.TOOLBAR,
            };
            let recordWithCorrectType = false;
            const editArrowVisibilityCallback = (record: Model) => {
                // Тут не должна попасть проекция
                recordWithCorrectType = !!record.get && !record.getContents;
                return true;
            };
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                editArrowAction,
                editArrowVisibilityCallback
            }));

            itemActionsController.activateSwipe(1, 100, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration');
            assert.isTrue(recordWithCorrectType, 'The argument of editArrowVisibilityCallback isn\'t Model');
            assert.equal(config.itemActions.showed[0].id, 'view', 'First action should be \'editArrow\'');
        });

        //T2.10.1 При свайпе editArrow добавляется в набор операций также и при itemActionsPosition: 'outside'
        it('should add editArrow when itemActionsPosition: \'outside\'', () => {
            const editArrowAction: IItemAction = {
                id: 'view',
                icon: '',
                showType: TItemActionShowType.TOOLBAR,
            };
            const editArrowVisibilityCallback = () => true;
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                editArrowAction,
                itemActionsPosition: 'outside',
                editArrowVisibilityCallback
            }));
            itemActionsController.activateSwipe(1, 50);
            const item = itemActionsController.getSwipeItem();
            assert.exists(item, 'Swipe activation should set swiped item');
            assert.equal(item.getActions().showed[0].id, 'view', 'First action should be \'editArrow\'');
        })

        // T2.12 При вызове getSwipeItem() контроллер должен возвращать true
        // вне зависимости оттипа анимации и направления свайпа.
        it('method getSwipeItem() should return swoped item despite of current animation type and direction', () => {
            // @ts-ignore
            const item: CollectionItem<Record> = collection.getItemBySourceKey(1);
            let swipedItem: CollectionItem<Record>;

            itemActionsController.activateSwipe(1, 100, 50);
            // @ts-ignore
            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, item, 'swiped() item has not been found by getSwipeItem() method');
            itemActionsController.deactivateSwipe();

            // @ts-ignore
            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, null, 'Current swiped item has not been un-swiped');

            const collectionVersion = collection.getVersion();
            itemActionsController.deactivateSwipe();
            // @ts-ignore
            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, null, 'Current swiped item has not been un-swiped');
            assert.equal(collection.getVersion(), collectionVersion, 'Version changed.');
        });

        // T2.13 При обновлении опций записи надо также обновлять конфиг свайпа
        it('should update swipe config on item actions update', () => {
            const itemActionsClone = [...itemActions];
            let visibilityCallbackResult = false;
            let config: ISwipeConfig;
            const controllerConfig = {
                collection,
                itemActions: itemActionsClone,
                theme: 'default',
                visibilityCallback: (action: IItemAction, item: Record) => {
                    if (action.id === 9) {
                        return visibilityCallbackResult;
                    }
                    return true;
                }
            };
            itemActionsClone.splice(3, 0,{
                id: 9,
                icon: 'icon-SuperIcon',
                title: 'Super puper',
                showType: TItemActionShowType.TOOLBAR
            });
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions(controllerConfig));
            itemActionsController.activateSwipe(1, 100, 50);
            config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration after swipe activation');
            assert.equal(config.itemActions.showed[1].title, 'Time management', 'First action should be \'message\'');

            visibilityCallbackResult = true;
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions(controllerConfig));
            config = collection.getSwipeConfig();
            assert.equal(config.itemActions.showed[1].title, 'Super puper', 'First action should be \'Super puper\'');
        });

        // Необходимо запоминать предыдущие itemActions, если режим отображения itemActionsVisibility='visible'
        it('should remember itemActions before swipe when itemActionsVisibility=\'visible\'', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsVisibility: 'visible'
            }));
            const savedItemActions = collection.at(0).getActions();

            // при активации сохраняется предыдущее состояние
            itemActionsController.activateSwipe(1, 75, 50);
            assert.notEqual(collection.at(0).getActions().showed.length, savedItemActions.showed.length);

            // при деактивации всё возвращается обратно
            itemActionsController.deactivateSwipe();
            assert.equal(collection.at(0).getActions().showed.length, savedItemActions.showed.length);
        });
    });

    describe('prepareActionsMenuConfig()', () => {
        let clickEvent: SyntheticEvent<MouseEvent>;
        let target: HTMLElement;

        beforeEach(() => {
            target = {
                getBoundingClientRect(): ClientRect {
                    return {
                        bottom: 1,
                        height: 1,
                        left: 1,
                        right: 1,
                        top: 1,
                        width: 1
                    };
                }
            } as HTMLElement;
            const native = {
                target
            };
            clickEvent = new SyntheticEvent<MouseEvent>(native);
        });

        // T3.1. Если в метод передан parentAction и это не кнопка открытия меню, то config.templateOptions.showHeader
        // будет true
        it('should set config.templateOptions.showHeader \'true\' when parentAction' +
            'is set and item isn\'t isMenu', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set');
            // @ts-ignore
            assert.isTrue(config.templateOptions.showHeader);
        });

        // T3.2. Если в метод не передан parentAction, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction isn\'t set', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, false);
            assert.exists(config.templateOptions, 'Template options were not set when no parent passed');
            // @ts-ignore
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when no parent passed');
        });

        // T3.2. Если parentAction - это кнопка открытия меню, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction is isMenu', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set when no isMenu parent passed');
            // @ts-ignore
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when isMenu parent passed');
        });

        // T3.6. Result.templateOptions.source содержит меню из ItemActions, соответствующих текущему parentAction
        it('should set result.templateOptions.source responsible to current parentActions', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set');
            // @ts-ignore
            assert.exists(config.templateOptions.source, 'Menu actions source haven\'t set in template options');
            // @ts-ignore
            const calculatedChildren = JSON.stringify(config.templateOptions.source.data.map((item) => item.id));
            const children = JSON.stringify(itemActions
                .filter((action) => action.parent === itemActions[3].id)
                .map((item) => item.id));
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.equal(calculatedChildren, children);
        });

        // T3.7. Если parentAction - кнопка открытия доп. меню, то result.templateOptions.source содержит меню
        // ItemActions с showType != TItemActionShowType.TOOLBAR
        it('should collect only non-TOOLBAR item actions when parentAction.isMenu="true"', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set');
            // @ts-ignore
            assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
            // @ts-ignore
            const calculatedChildren = config.templateOptions.source.data.map((item) => item.id).join('');
            const children = itemActions
                .filter((action) => action.showType !== TItemActionShowType.TOOLBAR)
                .map((item) => item.id).join('');
            assert.exists(calculatedChildren, 'child item actions were not calculated');
            assert.equal(calculatedChildren, children, 'child item actions are not equal to expected');
        });

        // T3.7.1 Если parentAction - не задан, то result.templateOptions.source содержит меню ItemActions
        // с showType != TItemActionShowType.TOOLBAR
        it('should collect only non-TOOLBAR item actions when parentAction is not set', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                null,
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set');
            // @ts-ignore
            assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
            // @ts-ignore
            const calculatedChildren = config.templateOptions.source.data.map((item) => item.id).join('');
            const children = itemActions
                .filter((action) => action.showType !== TItemActionShowType.TOOLBAR).map((item) => item.id).join('');
            assert.exists(calculatedChildren, 'child item actions were not calculated');
            assert.equal(calculatedChildren, children, 'child item actions are not equal to expected');
        });

        // T3.7.2. Мега тест на _getMenuActions
        describe('_getMenuActions cases', () => {
            // T3.7.2.1. parentAction не задан
            // T3.7.2.1.1. Среди экшнов присутствуют дети какого-то парента
            // T3.7.2.1.3. Среди экшнов отстутсвуют любые айтемы, у которых showtype===TOOLBAR
            it('should collect any non-toolbar options when no parentAction passed', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    }
                ];
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, false);
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                const expectedCount = config.templateOptions.source.data
                    .filter((action) => action.showType !== TItemActionShowType.TOOLBAR).length;
                assert.equal(expectedCount, 2);
            });

            // T3.7.2.1.2. Среди экшнов присутствуют айтемы, у которых showtype===TOOLBAR
            it('should collect only non-toolbar options when no parentAction passed', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 5,
                        title: 'Documentation',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    }
                ];
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, false);
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                const expectedActions = config.templateOptions.source.data
                    .filter((action) => action.showType !== TItemActionShowType.TOOLBAR);
                assert.isNotEmpty(expectedActions);
                // @ts-ignore
                const unexpectedActions = config.templateOptions.source.data
                    .filter((action) => action.showType === TItemActionShowType.TOOLBAR);
                assert.isEmpty(unexpectedActions);
            });

            // T3.7.2.2. parentAction задан
            // T3.7.2.2.1. Среди экшнов присутствуют дети указанного парента
            // T3.7.2.2.2. Среди экшнов присутствуют айтемы, у которых showtype===TOOLBAR
            // T3.7.2.2.3. Среди экшнов присутствуют айтемы, у которых showtype===MENU
            // T3.7.2.2.3. Среди экшнов присутствуют айтемы, у которых showtype===MENU_TOOLBAR
            it ('should collect item actions for passed parent', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 2,
                        icon: 'icon-EmptyMessage',
                        title: 'message',
                        showType: TItemActionShowType.MENU_TOOLBAR
                    },
                    {
                        id: 5,
                        title: 'Documentation',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 7,
                        title: 'Exploitation',
                        showType: TItemActionShowType.MENU,
                        parent: 4,
                        'parent@': true
                    }
                ];
                const parentAction = {
                    id: 4,
                    icon: 'icon-Time',
                    title: 'Time management',
                    showType: TItemActionShowType.TOOLBAR,
                    'parent@': true
                };
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                const config = itemActionsController.prepareActionsMenuConfig(
                    item3,
                    clickEvent,
                    parentAction,
                    null,
                    false
                );
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                const expectedCount = config.templateOptions.source.data.filter((action) => action.parent === 4).length;
                assert.equal(expectedCount, 3);
            });

            // T3.7.2.2.1. Среди экшнов присутствуют дети какого-то другого парента, но отсутствуют дети указанного парента
            it ('should collect item actions only for passed parent', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 2,
                        icon: 'icon-EmptyMessage',
                        title: 'message',
                        showType: TItemActionShowType.MENU_TOOLBAR
                    },
                    {
                        id: 5,
                        title: 'Documentation',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 3
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 3
                    },
                    {
                        id: 7,
                        title: 'Exploitation',
                        showType: TItemActionShowType.MENU,
                        parent: 3,
                        'parent@': true
                    }
                ];
                const parentAction = {
                    id: 4,
                    icon: 'icon-Time',
                    title: 'Time management',
                    showType: TItemActionShowType.TOOLBAR,
                    'parent@': true
                };
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                const config = itemActionsController.prepareActionsMenuConfig(
                    item3,
                    clickEvent,
                    parentAction,
                    null,
                    false
                );
                assert.notExists(config);
            });

            // T3.7.2.2. parentAction задан и его isMenu===true
            // T3.7.2.1.3. Среди экшнов отстутсвуют любые айтемы, у которых showtype===TOOLBAR
            it('should collect any non-toolbar item actions when parentAction.isMenu===true', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    },
                ];
                const parentAction = {
                    id: null,
                    icon: 'icon-ExpandDown',
                    style: 'secondary',
                    iconStyle: 'secondary',
                    isMenu: true
                };
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                // @ts-ignore
                const config = itemActionsController.prepareActionsMenuConfig(
                    item3,
                    clickEvent,
                    parentAction,
                    null,
                    false
                );
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                const expectedCount = config.templateOptions.source.data
                    .filter((action) => action.showType !== TItemActionShowType.TOOLBAR).length;
                assert.equal(expectedCount, 2);
            });

            // T3.7.2.1.2. Среди экшнов присутствуют айтемы, у которых showtype===TOOLBAR
            it('should collect only non-toolbar item actions when parentAction.isMenu===true', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.MENU
                    },
                    {
                        id: 2,
                        icon: 'icon-PhoneNull',
                        title: 'This action should not appear in menu',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: null
                    },
                    {
                        id: 5,
                        title: 'Documentation',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    },
                ];
                const parentAction = {
                    id: null,
                    icon: 'icon-ExpandDown',
                    style: 'secondary',
                    iconStyle: 'secondary',
                    isMenu: true
                };
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                const config = itemActionsController.prepareActionsMenuConfig(
                    item3,
                    clickEvent,
                    // @ts-ignore
                    parentAction,
                    null,
                    false
                );
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                const expectedActions = config.templateOptions.source.data
                    .filter((action) => action.showType !== TItemActionShowType.TOOLBAR);
                assert.isNotEmpty(expectedActions);
                // @ts-ignore
                const unexpectedActions = config.templateOptions.source.data
                    .filter((action) => action.showType === TItemActionShowType.TOOLBAR);
                assert.isEmpty(unexpectedActions);
            });

            it('should collect non-"showed" or non-toolbar item actions when item is swiped', () => {
                const localItemActions: IItemAction[] = [
                    {
                        id: 1,
                        icon: 'icon-PhoneNull',
                        title: 'phone',
                        showType: TItemActionShowType.TOOLBAR
                    },
                    {
                        id: 5,
                        title: 'Documentation',
                        showType: TItemActionShowType.MENU_TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 6,
                        title: 'Development',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 4
                    },
                    {
                        id: 7,
                        title: 'Sources',
                        showType: TItemActionShowType.TOOLBAR,
                        parent: 4
                    }
                ];
                const parentAction = {
                    id: null,
                    icon: 'icon-ExpandDown',
                    style: 'secondary',
                    iconStyle: 'secondary',
                    isMenu: true
                };
                // @ts-ignore
                itemActionsController.update(initializeControllerOptions({
                    collection,
                    itemActions: localItemActions,
                    theme: 'default',
                    actionAlignment: 'vertical'
                }));
                const item3 = collection.getItemBySourceKey(3);
                item3.setSwiped(true, true);
                item3.getActions().showed = item3.getActions().all.filter((item, i) => i !== 3);
                const config = itemActionsController.prepareActionsMenuConfig(
                    item3,
                    clickEvent,
                    // @ts-ignore
                    parentAction,
                    null,
                    false
                );
                assert.exists(config.templateOptions, 'Template options were not set');
                // @ts-ignore
                assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t set in template options');
                // @ts-ignore
                assert.deepEqual(config.templateOptions.source.data[0], localItemActions[1],
                    'Non-toolbar options should be shown in menu');
                // @ts-ignore
                assert.deepEqual(config.templateOptions.source.data[1], localItemActions[3],
                    'Non-showed options should be shown in menu');
            });
        });

        // Надо добавлять кнопку закрытия для случая контекстного меню (когда parentAction не задан)
        it('should add close button for template config when parentAction isn\'t set', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, false);
            // @ts-ignore
            assert.isTrue(config.templateOptions.closeButtonVisibility);
        });

        // Надо добавлять кнопку закрытия для случая дополнительного меню parentAction.isMenu===true
        it('should add close button for template config when parentAction.isMenu===true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            // @ts-ignore
            assert.isTrue(config.templateOptions.closeButtonVisibility);
        });

        // Не надо добавлять кнопку закрытия меню, если передан обычный parentAction
        it('should add close button for template config when parentAction.isMenu!==true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            // @ts-ignore
            assert.isFalse(config.templateOptions.closeButtonVisibility);
        });

        // T3.3. Если в метод передан contextMenu=true, то в config.direction.horizontal будет right
        it('should set config.direction.horizontal as \'right\' when contextMenu=true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, true);
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'right');
        });

        // T3.3.1 Если в метод передан parentAction.isMenu===true, то в config.direction.horizontal будет left
        it('should set result.direction.horizontal as \'left\' when parentAction.isMenu===true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'left');
        });

        // T3.3.2 Не надо добавлять direction в menuConfig, если передан обычный parentAction
        it('should not set direction when parentAction.isMenu!==true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.notExists(config.direction);
        });

        // T3.4. Если в метод передан contextMenu=false, то в config.target будет объект с копией
        // clickEvent.target.getBoundingClientRect()
        it('should set config.target as copy of clickEvent.target.getBoundingClientRect()', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            // @ts-ignore
            assert.deepEqual(config.target.getBoundingClientRect(), target.getBoundingClientRect());
        });

        // T3.5. Если был установлен iconSize он должен примениться к templateOptions
        it('should apply iconSize to templateOptions', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.exists(config.templateOptions, 'Template options were not set');
            // @ts-ignore
            assert.equal(config.templateOptions.iconSize, 'm', 'iconSize from templateOptions has not been applied');
        });

        // T3.6. Если в контрол был передан contextMenuConfig, его нужно объединять
        // с templateOptions для Sticky.openPopup(menuConfig)
        it('should merge contextMenuConfig with templateOptions for popup config', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                contextMenuConfig: {
                    iconSize: 's',
                    groupProperty: 'title'
                }
            }));
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            // @ts-ignore
            assert.equal(config.templateOptions.groupProperty, 'title', 'groupProperty from contextMenuConfig has not been applied');
            // @ts-ignore
            assert.equal(config.templateOptions.headConfig.iconSize, 's', 'iconSize from contextMenuConfig has not been applied');
        });

        // T3.6.1. Если в контрол был передан contextMenuConfig без IconSize, нужно применять размер иконки по умолчанию
        it('should use default IconSize when contextMenuConfig does not contain iconSize property', () => {
            // @ts-ignore
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                iconSize: 's',
                contextMenuConfig: {
                    groupProperty: 'title'
                }
            }));
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            // @ts-ignore
            assert.equal(config.templateOptions.iconSize, 'm', 'default iconSize has not been applied');
        });

        // T3.7. Для меню не нужно считать controls-itemActionsV__action_icon_theme-default
        it('should not set "controls-itemActionsV__action_icon_theme-default" CSS class for menu item actions icons', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            // @ts-ignore
            const calculatedChildren = config.templateOptions.source;
            assert.exists(calculatedChildren, 'Menu actions source haven\'t been set in template options');
            assert.notMatch(calculatedChildren.data[0].icon, /controls-itemActionsV__action_icon_theme/,
                'Css class \'controls-itemActionsV__action_icon_theme-\' should not be added to menu item');
        });

        // T3.8. В любом случае нужно посчитать fittingMode
        it('should set config.fittingMode.vertical as \'overflow\'', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.exists(config.fittingMode, 'fittingMode options were not set');
            // @ts-ignore
            assert.equal(config.fittingMode.vertical, 'overflow');
            // @ts-ignore
            assert.equal(config.fittingMode.horizontal, 'adaptive');
        });

        // T3.9. Для Контекстного меню нужно обязательно добавлять CSS класс controls-ItemActions__popup__list_theme-default
        it('should set config.className with value controls-ItemActions__popup__list_theme-default when parentAction isn\'t set', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, true);
            assert.equal(config.className, 'controls-ItemActions__popup__list_theme-default');
        });

        // T3.10. Для Дополнительного меню нужно обязательно добавлять CSS класс controls-ItemActions__popup__list_theme-default
        it('should set config.className with value controls-ItemActions__popup__list_theme-default when parentAction.isMenu===true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.equal(config.className, 'controls-ItemActions__popup__list_theme-default');
        });

        // T3.11. Для Обычного Меню нужно обязательно добавлять CSS класс controls-MenuButton_link_iconSize-medium_popup theme_default
        it('should set config.className with value controls-MenuButton_link_iconSize-medium_popup theme_default when parentAction.isMenu!==true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.equal(config.className, 'controls-MenuButton_link_iconSize-medium_popup theme_default');
        });

        // T3.12. Если в метод передан contextMenu=true, то будет расчитан config.targetPoint
        it('should set config.targetPoint when contextMenu=true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, true);
            assert.exists(config.targetPoint, 'targetPoint options were not set');
            assert.equal(config.targetPoint.vertical, 'top');
            assert.equal(config.targetPoint.horizontal, 'right');
        });

        // T3.13 Если в метод передан parentAction.isMenu===true, то будет расчитан config.targetPoint
        it('should set config.targetPoint when parentAction.isMenu===true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            assert.exists(config.targetPoint, 'targetPoint options were not set');
            assert.equal(config.targetPoint.vertical, 'top');
            assert.equal(config.targetPoint.horizontal, 'right');
        });

        // T3.14 Не надо добавлять config.targetPoint, если передан обычный parentAction
        it('should not set config.targetPoint when parentAction.isMenu!==true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            assert.notExists(config.targetPoint);
        });

        // T3.15. Если в метод передан contextMenu=true, то будет расчитан config.nativeEvent
        it('should set config.targetPoint when contextMenu=true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                null,
                null,
                true
            );
            // @ts-ignore
            assert.exists(config.nativeEvent);
        });

        // T3.16 Если в метод передан parentAction.isMenu===true, то будет расчитан config.nativeEvent
        it('should not set config.nativeEvent when parentAction.isMenu===true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                actionsOf3.showed[actionsOf3.showed.length - 1],
                null,
                false
            );
            // @ts-ignore
            assert.notExists(config.nativeEvent);
        });

        // T3.17 Не надо добавлять config.nativeEvent, если передан обычный parentAction
        it('should not set config.nativeEvent when parentAction.isMenu!==true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(
                item3,
                clickEvent,
                itemActions[3],
                null,
                false
            );
            // @ts-ignore
            assert.notExists(config.nativeEvent);
        });
    });

    // см. этот же тест в Collection.test.ts
    describe('setActiveItem(), getActiveItem()', () => {
        it('deactivates old active item', () => {
            const testingItem = collection.getItemBySourceKey(1);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(1));
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.isFalse(testingItem.isActive());
        });
        it('activates new active item', () => {
            const testingItem = collection.getItemBySourceKey(2);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(1));
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.isTrue(testingItem.isActive());
        });
        it('correctly returns active item', () => {
            const testingItem = collection.getItemBySourceKey(2);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.equal(itemActionsController.getActiveItem(), testingItem);
        });
        it('correctly returns the active item when updating the source', () => {
            const testingItem = collection.getItemBySourceKey(2);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            // Эмулируем обновление source, при котором activeElement сбрасывается.
            itemActionsController._collection.setActiveItem(undefined);
            assert.equal(itemActionsController.getActiveItem(), testingItem);
        });
    });

    describe('startSwipeCloseAnimation()', () => {
        it('should correctly set animation state', () => {
            const testingItem = collection.getItemBySourceKey(1);
            testingItem.setSwipeAnimation(ANIMATION_STATE.OPEN);
            testingItem.setSwiped(true, true);
            itemActionsController.startSwipeCloseAnimation();
            assert.equal(testingItem.getSwipeAnimation(), ANIMATION_STATE.CLOSE, 'Incorrect animation state !== close');
        });
    });
});
