import {assert} from 'chai';
import TabsController from 'Controls/_propertyGrid/TabbedView/TabsController';

describe('Controls/_propertyGrid/TabbedView/TabsController', () => {
    describe('.getSwitchableAreaItems()', () => {
        const cases = [{
            caseName: 'Одна вкладка, один редактор',
            config: {
                source: [{
                    tab: 'Персональные данные',
                    name: 'Почта',
                    editor: 'email'
                }],
                tabProperty: 'tab'
            },
            expected: [{
                key: 'Персональные данные',
                templateOptions: {
                    source: [{
                        tab: 'Персональные данные',
                        name: 'Почта',
                        editor: 'email'
                    }]
                }
            }]
        }, {
            caseName: 'Одна вкладка, несколько редакторов',
            config: {
                source: [{
                    tab: 'Персональные данные',
                    name: 'Почта',
                    editor: 'email'
                }, {
                    tab: 'Персональные данные',
                    name: 'Фамилия',
                    editor: 'surname'
                }],
                tabProperty: 'tab'
            },
            expected: [{
                key: 'Персональные данные',
                templateOptions: {
                    source: [{
                        tab: 'Персональные данные',
                        name: 'Почта',
                        editor: 'email'
                    }, {
                        tab: 'Персональные данные',
                        name: 'Фамилия',
                        editor: 'surname'
                    }]
                }
            }]
        }, {
            caseName: 'Несколько вкладок',
            config: {
                source: [{
                    tab: 'Персональные данные',
                    name: 'Почта',
                    editor: 'email'
                }, {
                    tab: 'Контакты',
                    name: 'Телефон',
                    editor: 'phone'
                }],
                tabProperty: 'tab'
            },
            expected: [{
                key: 'Персональные данные',
                templateOptions: {
                    source: [{
                        tab: 'Персональные данные',
                        name: 'Почта',
                        editor: 'email'
                    }]
                }
            }, {
                key: 'Контакты',
                templateOptions: {
                    source: [{
                        tab: 'Контакты',
                        name: 'Телефон',
                        editor: 'phone'
                    }]
                }
            }]
        }];

        cases.forEach((item) => {
            it(item.caseName, () => {
                const controller = new TabsController(item.config);

                assert.deepEqual(controller.getSwitchableAreaItems(), item.expected);
            });
        });
    });
    describe('.getTabsSource()', () => {
        const cases = [{
            caseName: 'Одна вкладка',
            config: {
                source: [{
                    tab: 'Персональные данные',
                    name: 'Почта',
                    editor: 'email'
                }],
                tabProperty: 'tab'
            },
            expected: [{
                key: 'Персональные данные'
            }]
        }, {
            caseName: 'Несколько вкладок',
            config: {
                source: [{
                    tab: 'Персональные данные',
                    name: 'Почта',
                    editor: 'email'
                }, {
                    tab: 'Контакты',
                    name: 'Телефон',
                    editor: 'phone'
                }],
                tabProperty: 'tab'
            },
            expected: [{
                key: 'Персональные данные'
            }, {
                key: 'Контакты'
            }]
        }];

        cases.forEach((item) => {
            it(item.caseName, (done) => {
                const controller = new TabsController(item.config);

                controller.getTabsSource().query().then((data) => {
                    data.getAll().each((tabItem, i) => {
                        assert.equal(tabItem.getKey(), item.expected[i].key);
                    });

                    done();
                });
            });
        });
    });

    describe('.updateOptions()', () => {
        const source = [{
            tab: 'Персональные данные',
            name: 'Почта',
            editor: 'email'
        }];

        const anotherSource = [{
            tab: 'Персональные данные',
            name: 'Почта',
            editor: 'email'
        }, {
            tab: 'Контакты',
            name: 'Телефон',
            editor: 'phone'
        }];

        const cases = [{
            caseName: 'Изменился источник',
            initialConfig: {
                source,
                tabProperty: 'tab'
            },
            updatedConfig: {
                source: anotherSource,
                tabProperty: 'tab'
            },
            expected: true
        }, {
            caseName: 'Изменилось поле распределения по вкладкам',
            initialConfig: {
                source,
                tabProperty: 'tab'
            },
            updatedConfig: {
                source,
                tabProperty: 'editor'
            },
            expected: true
        }, {
            caseName: 'Нет значимых изменений',
            initialConfig: {
                source,
                tabProperty: 'tab'
            },
            updatedConfig: {
                source,
                tabProperty: 'tab'
            },
            expected: false
        }];

        cases.forEach((item) => {
            it(item.caseName, () => {
                const controller = new TabsController(item.initialConfig);

                assert.deepEqual(controller.updateOptions(item.updatedConfig), item.expected);
            });
        });
    });
});
