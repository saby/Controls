import { assert } from 'chai';
import { Record } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import { SyntheticEvent } from 'Vdom/Vdom';
import { Collection, CollectionItem } from 'Controls/display';
import { IOptions as ICollectionOptions } from 'Controls/_display/Collection';

import { Controller as ItemActionsController, IItemActionsControllerOptions } from 'Controls/_itemActions/Controller';
import { IItemAction, IItemActionsItem, TItemActionShowType } from 'Controls/_itemActions/interface/IItemActions';

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
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        '@parent': true
    },
    {
        id: 5,
        title: 'Documentation',
        showType: TItemActionShowType.MENU,
        parent: 4
    },
    {
        id: 6,
        title: 'Development',
        showType: TItemActionShowType.MENU,
        parent: 4
    },
    {
        id: 7,
        title: 'Exploitation',
        showType: TItemActionShowType.MENU,
        parent: 4,
        '@parent': true
    },
    {
        id: 8,
        title: 'Approval',
        showType: TItemActionShowType.MENU,
        parent: 7,
        '@parent': true
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

describe('Controls/_itemActions/Controller', () => {
    let itemActionsController: ItemActionsController;
    let collection: Collection<Record>; // IItemActionsCollection;
    let initialVersion: number;

    function makeCollection(): Collection<Record> {
        const rawData = [
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
        return new Collection<Record>(collectionConfig);
    }

    function initializeControllerOptions(options?: IItemActionsControllerOptions): IItemActionsControllerOptions {
        const result = {
            collection,
            itemActions: options ? options.itemActions : null,
            itemActionsProperty: options ? options.itemActionsProperty : null,
            visibilityCallback: options ? options.visibilityCallback : null,
            itemActionsPosition: options ? options.itemActionsPosition : null,
            style: options ? options.style : null,
            theme: options ? options.theme : 'default',
            actionAlignment: options ? options.actionAlignment : null,
            actionCaptionPosition: options ? options.actionCaptionPosition : null,
            editingToolbarVisible: options ? options.editingToolbarVisible : false
        };
        return result;
    }

    beforeEach(() => {
        collection = makeCollection();
        // @ts-ignore
        initialVersion = collection.getVersion();
        itemActionsController = new ItemActionsController();
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
            assert.equal(actionsOf1.showed[0].title, 'message', 'first action of item 1 should be \'message\'');
            assert.equal(actionsOf5.showed[0].title, 'message', 'first action of item 5 should be \'message\'');
        });

        // T1.2.  В коллекции происходит набор конфигурации для шаблона ItemActions.
        it('should build a config for item action template', () => {
            const config = collection.getActionsTemplateConfig();
            assert.isNotNull(config, 'getActionsTemplateConfig hasn\'t been set to collection');
        });

        // T1.3. При установке набора операций вызывается VisibilityCallback.
        it('should call visibilityCallback for every item action', () => {
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
            assert.notExists(actionsOf4.showed.find((action) => action.title === 'message'), 'item 4 should not display \'message\' action');
            assert.exists(actionsOf5.showed.find((action) => action.title === 'message'), 'item 5 should display \'message\' action');
        });

        // T1.4. При установке набора операций учитывается itemActionsProperty
        it('should consider itemActionsProperty', () => {
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
            assert.isTrue(actionsOf1.showed[actionsOf1.showed.length - 1]._isMenu, 'Menu button has not been appended to actions array');
        });

        // T1.7. Если не требуется добавить кнопку меню, то она не добавляется в список showed операций
        it('should not append menu button to item actions when it not necessary', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: flatItemActions,
                theme: 'default'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotTrue(actionsOf1.showed[actionsOf1.showed.length - 1]._isMenu, 'What the hell menu button appeared for item?');
        });

        // T1.8. В список showed операций изначально попадают операции с showType TOOLBAR или MENU_TOOLBAR, и у которых нет родителя
        it('should add to "showed" item actions only actions with showType TOOLBAR or MENU_TOOLBAR, w/o parent', () => {
            const actionsOf4 = collection.getItemBySourceKey(4).getActions();
            assert.isNotNull(actionsOf4, 'actions were not set to item 4');
            assert.notEqual(actionsOf4.showed[0].title, 'phone', 'What the hell \'phone\' action is in \'showed\' array?');
        });

        // T1.9. После установки набора операций, операции с иконками содержат в поле icon CSS класс “controls-itemActionsV__action_icon icon-size” (оч сомнительный тест)
        // TODO Возможно, установка этого класса переедет в шаблон
        it('should set to all item actions icons "controls-itemActionsV__action_icon_theme-default icon-size_theme-default" CSS class', () => {
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.exists(actionsOf5, 'actions were not set to item 5');
            assert.notEqual(actionsOf5.showed[0].icon.indexOf('controls-itemActionsV__action_icon_theme'), -1, 'Css class \'controls-itemActionsV__action_icon_theme-\' should be added to item');
            assert.notEqual(actionsOf5.showed[0].icon.indexOf('icon-size_theme'), -1, 'Css class \'icon-size_theme-\' should be added to item');
        });

        // T1.10. При реальной смене у операций элементов настроек all/showed должна изменяться версия модели (если это возможно проверить)
        // TODO Возможно, это не корректный тест, т.к. по обсуждению от 08.05 была идея убрать смену версии модели из контроллера.
        it('should call collection version update after changing assigned actions', () => {
            // @ts-ignore
            assert.notEqual(collection.getVersion(), initialVersion);
        });

        // T1.11. Если в ItemActions всё пусто, не должно происходить инициализации
        it('should not initialize item actions when itemActions and itemActionsProperty are not set ', () => {
            collection = makeCollection();
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: null,
                theme: 'default'
            }));
            const actionsOf3 = collection.getItemBySourceKey(3).getActions();
            assert.notExists(actionsOf3, 'actions have been set to item 3, but they shouldn\'t');
        });

        // T1.14. Должны адекватно набираться ItemActions для breadcrumbs (когда getContents() возвращает массив записей)
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен знать о breadcrumbs
        //  надо разобраться как в коллекцию добавить breadcrumbs
        // it('should set item actions when some items are breadcrumbs', () => {});

        // T1.15. Должны адекватно набираться ItemActions если в списке элементов коллекции присутствуют группы
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен знать о группах
        //  надо разобраться как в коллекцию добавить group
        // it('should set item actions when some items are groups', () => {});
    });

    // T2. Активация и деактивация Swipe происходит корректно
    describe('activateSwipe(), deactivateSwipe() and getSwipeItem() ', () => {
        // T2.1. В коллекции происходит набор конфигурации для Swipe, если позиция itemActions не outside. itemActions сортируются по showType.
        it('should collect swiped item actions sorted by showType when position !== "outside"', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'inside'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration for inside positioned actions');
            assert.equal(config.itemActions.showed[0].title, 'Profile', 'First item should be \'message\'');
        });

        // T2.2. В коллекции не происходит набор конфигурации для Swipe, если позиция itemActions outside
        it('should not collect swipe config when position === "outside"', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'outside'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.notExists(config);
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        it('should use horizontal measurer when actionAlignment=\'horizontal\'', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'horizontal'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        // T2.5. Конфигурация для Swipe происходит с установкой twoColumnsActions, если measurer вернул в конфиг twoColumns
        it('should use vertical measurer when actionAlignment=\'vertical\'', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 65);
            const config = collection.getSwipeConfig();
            assert.isBoolean(config.twoColumns);
            assert.exists(config.twoColumnsActions);
        });

        // T2.4. Конфигурация для Swipe происходит с actionAlignment=’horizontal’, если только одна опция доступна в тулбаре
        it('should collect swipe configuration with actionAlignment="horizontal" when only one option should be showed in toolbar', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.6. Устанавливается swiped элемент коллекции
        // T2.7. Устанавливается активный элемент коллекции
        // T2.8. Метод getSwipedItem возвращает корректный swiped элемент
        it('should set swiped and active collection item', () => {
            itemActionsController.activateSwipe(2, 50);
            const activeItem = collection.getActiveItem();
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.exists(activeItem, 'Item has not been set active');
            assert.exists(swipedItem, 'Item has not been set swiped');
            assert.equal(activeItem, swipedItem, 'Active item is not the same as swiped item');
        });

        // T2.9. Происходит сброс swiped элемента, активного элемента, конфигурации для Swipe при деактивации свайпа
        it('should reset swiped item, active item and swipe configuration when deactivating swipe', () => {
            itemActionsController.activateSwipe(1, 50);
            itemActionsController.deactivateSwipe();
            const activeItem = collection.getActiveItem();
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            const config = collection.getSwipeConfig();
            assert.notExists(activeItem, 'Item \'active\' flag has not been reset');
            assert.notExists(swipedItem, 'Item \'swiped\' flag has not been reset');
            assert.notExists(config, 'Collection\'s swipe config has not been reset');
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

        // T3.1. Если в метод передан parentAction и это не кнопка открытия меню, то config.templateOptions.showHeader будет true
        it('should set config.templateOptions.showHeader \'true\' when parentAction is set and item isn\'t _isMenu', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, itemActions[3], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.isTrue(config.templateOptions.showHeader);
        });

        // T3.2. Если в метод не передан parentAction, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction isn\'t set', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, null, null, false);
            assert.exists(config.templateOptions, 'Template options were not set when no parent passed');
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when no parent passed');
        });

        // T3.2. Если в метод parentAction - это кнопка открытия меню, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction is _isMenu', () => {
            const actionsOf3 = collection.getItemBySourceKey(3).getActions();
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            assert.exists(config.templateOptions, 'Template options were not set when no isMenu parent passed');
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when isMenu parent passed');
        });

        // T3.6. Result.templateOptions.source содержит меню из ItemActions, соответствующих текущему parentAction
        // it('returns an empty array if actions are not set');
        // it('returns actions with showType of MENU and MENU_TOOLBAR');
        // it('returns child actions');
        it('should set result.templateOptions.source responsible to current parentActions', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, itemActions[3], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t been set in template options');
            // @ts-ignore
            const calculatedChildren = JSON.stringify(config.templateOptions.source.data);
            const children = JSON.stringify(itemActions.filter((action) => action.parent === itemActions[3].id));
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.equal(calculatedChildren, children);
        });

        // T3.7. Result.templateOptions.source содержит меню из всех ItemActions не-первого уровня, если в качестве parentAction была указана кнопка “Показать меню”
        it('should set result.templateOptions.source as set of all non-first-level ItemActions when parentAction is _isMenu', () => {
            const actionsOf3 = collection.getItemBySourceKey(3).getActions();
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t been set in template options');
            // @ts-ignore
            const calculatedChildren = config.templateOptions.source.data.map((item) => item.id).join('');
            const children = itemActions
                .filter((action) => (
                    action.parent !== undefined || action.showType === TItemActionShowType.MENU || action.showType === TItemActionShowType.MENU_TOOLBAR)
                ).map((item) => item.id).join('');
            assert.equal(calculatedChildren, children);
        });

        // T3.3. Если в метод передан contextMenu=true, то в config.direction.horizontal будет right, иначе left
        it('should set config.direction.horizontal as \'right\' when contextMenu=true', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, itemActions[3], null, true);
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'right');
        });

        // T3.3. Если в метод передан contextMenu=true, то в config.direction.horizontal будет right, иначе left
        it('should set result.direction.horizontal as \'left\' when contextMenu=false', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, itemActions[3], null, false);
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'left');
        });

        // T3.4. Если в метод передан contextMenu=false, то в config.target будет объект с копией clickEvent.target.getBoundingClientRect()
        it('should set config.target as copy of clickEvent.target.getBoundingClientRect()', () => {
            const config = itemActionsController.prepareActionsMenuConfig(3, clickEvent, itemActions[3], null, false);
            assert.deepEqual(config.target.getBoundingClientRect(), target.getBoundingClientRect());
        });
    });
});
