import {create} from 'Types/di';
import {PrefetchProxy} from 'Types/source';
import {instanceOfMixin, instanceOfModule} from 'Core/core-instance';
import {Logger} from 'UI/Utils';
import * as coreClone from 'Core/core-clone';
import {factory} from 'Types/chain';
import {List, RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

function getModel(Model: string | Function | object, config: any): Function | string {
    return typeof Model === 'string' ? create(Model, config) : new Model(config);
}

function getSourceModel(source: PrefetchProxy | RecordSet): Function | string {
    let model;

    // до выполнения задачи https://online.sbis.ru/opendoc.html?guid=4190d360-e9de-49ed-a1a4-7420686134d0
    if (source instanceof PrefetchProxy) {
        model = source._$target.getModel();
    } else {
        model = source.getModel();
    }

    return model;
}

/**
 * Приводит записи к модели источника данных
 * @param {Types/collection:IList|Array} items массив записей
 * @param {Types/source:ISource} dataSource Источник
 * @param {String} idProperty поле элемента коллекции, которое является идентификатором записи.
 * @returns {Types/collection:IList|undefined|Array}
 */
export function ToSourceModel(items, dataSource, idProperty: string, saveParentRecordChanges?: boolean): RecordSet|List<Model>|List<void> {
    let dataSourceModel: Function | string;
    let dataSourceModelInstance: Function | string;
    let newRec: Function | string;
    let parent;
    let changedFields;

    if (items) {
        if (dataSource && instanceOfMixin(dataSource, 'Types/_source/ICrud')) {
            dataSourceModel = getSourceModel(dataSource);

            /* Создадим инстанс модели, который указан в dataSource,
             чтобы по нему проверять модели которые выбраны в поле связи */
            dataSourceModelInstance = getModel(dataSourceModel, {});

            /* FIXME гразный хак, чтобы изменение рекордсета не влекло за собой изменение родительского рекорда
             Удалить, как Леха Мальцев будет позволять описывать более гибко поля записи
             и указывать в качестве типа прикладную модель.
             Задача:
             https://inside.tensor.ru/opendoc.html?guid=045b9c9e-f31f-455d-80ce-af18dccb54cf&description= */
            if (instanceOfMixin(items, 'Types/_entity/ManyToManyMixin')) {
                items._getMediator().belongsTo(items, (master) => {
                    if (parent) {
                        Logger.error('ToSourceModel: у переданного рекордсета несколько родителей.');
                    }
                    parent = master;
                });

                if (parent && instanceOfModule(parent, 'Types/entity:Model')) {
                    if (saveParentRecordChanges) {
                        changedFields = coreClone(parent._changedFields);
                    } else {
                        Logger.error('ToSourceModel: модель, указанная для источника контрола ' +
                            'отличается от модели переданного рекордсета. Возможны изменения в родительской записи.');
                    }
                }
            }

            factory(items).each((rec, index) => {
                /* Создадим модель указанную в сорсе, и перенесём адаптер и формат из добавляемой записи,
                 чтобы не было конфликтов при мерже полей этих записей */
                if (dataSourceModelInstance._moduleName !== rec._moduleName) {
                    (newRec = getModel(dataSourceModel, {
                        adapter: rec.getAdapter(),
                        format: rec.getFormat()
                    })).merge(rec);
                    if (instanceOfModule(items, 'Types/collection:List')) {
                        items.replace(newRec, index);
                    } else {
                        items[index] = newRec;
                    }
                }
            });

            if (changedFields) {
                parent._changedFields = changedFields;
            }
        }

        /* Элементы, установленные из дилогов выбора / автодополнения могут иметь другой первичный ключ,
           отличный от поля с ключём, установленного в поле связи.
           Это связно с тем, что "связь" устанавливается по опеределённому полю,
           и не обязательному по первичному ключу у записей в списке. */
        factory(items).each((rec) => {
            if (instanceOfModule(rec, 'Types/entity:Model') && rec.getKeyProperty() !== idProperty && rec.get(idProperty) !== undefined) {
                rec.setKeyProperty(idProperty);
            }
        });
    }

    return items;
}
