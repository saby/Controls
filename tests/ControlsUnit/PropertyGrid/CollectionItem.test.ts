import {PropertyGridCollection} from 'Controls/propertyGrid';
import {PROPERTY_NAME_FIELD, DEFAULT_VALIDATORS, DEFAULT_EDITORS} from 'Controls/_propertyGrid/Constants';
import {assert} from 'chai';
import {Model} from 'Types/entity';
import {default as IPropertyGridItem} from 'Controls/_propertyGrid/IProperty';
import {Enum, RecordSet} from 'Types/collection';

const editingObject = new Model<IPropertyGridItem>({
    rawData: {
        description: 'This is http://mysite.com',
        tileView: true,
        showBackgroundImage: true,
        siteUrl: 'http://mysite.com',
        videoSource: 'http://youtube.com/video',
        backgroundType: new Enum({
            dictionary: ['Фоновое изображение', 'Заливка цветом'],
            index: 0
        }),
        function: '',
        validate: ''
    }
});
const source = new RecordSet<IPropertyGridItem>({
    rawData: [
        {
            name: 'description',
            caption: 'Описание',
            editorOptions: {
                minLines: 3
            },
            editorClass: 'controls-demo-pg-text-editor',
            group: 'text',
            type: 'text'
        },
        {
            name: 'tileView',
            caption: 'Список плиткой',
            group: 'boolean'
        },
        {
            name: 'showBackgroundImage',
            caption: 'Показывать изображение',
            group: 'boolean'
        },
        {
            caption: 'URL',
            name: 'siteUrl',
            group: 'string'
        },
        {
            caption: 'Источник видео',
            name: 'videoSource',
            group: 'string'
        },
        {
            caption: 'Тип фона',
            name: 'backgroundType',
            group: 'enum',
            editorClass: 'controls-demo-pg-enum-editor'
        },
        {
            name: 'function',
            caption: '',
            toggleEditorButtonIcon: 'icon-ArrangePreview',
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorOptions: {
                placeholder: 'Условие видимости поля',
                minLines: 3
            }
        },
        {
            name: 'validate',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorTemplateName: 'editorTemplate',
            editorOptions: {
                placeholder: 'Условие валидации',
                validators: [() => true],
                minLines: 3
            }
        },
        {
            name: 'customValidateTemplate',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorTemplateName: 'editorTemplate',
            editorOptions: {
                placeholder: 'Условие валидации',
                validateTemplateName: 'validateTemplate',
                validators: [() => true],
                minLines: 3
            }
        },
        {
            name: 'customEditor',
            caption: '',
            toggleEditorButtonIcon: 'icon-CreateFolder',
            type: 'text',
            editorClass: 'controls-demo-pg-text-editor',
            editorTemplateName: 'editorTemplate',
            editorOptions: {
                placeholder: 'Условие валидации',
                minLines: 3
            }
        }
    ],
    keyProperty: 'name'
});
const collection = new PropertyGridCollection<Model>({
    collection: source,
    editingObject: editingObject,
    parentProperty: 'Раздел',
    nodeProperty: 'Раздел@',
    keyProperty: PROPERTY_NAME_FIELD,
    root: null
});

describe('Controls/propertyGrid:CollectionItem', () => {
    describe('getEditorTemplateName', () => {
        it('returns template by type', () => {
            const template = collection.getItemBySourceIndex(0).getEditorTemplateName();
            assert.equal(template, DEFAULT_EDITORS.text);
        });

        it('returns template from editorTemplateName property', () => {
            const template = collection.getItemBySourceKey('customEditor').getEditorTemplateName();
            assert.equal(template, 'editorTemplate');
        });
    });

    describe('getValidateTemplateName', () => {
        it('returns default validator by property type', () => {
            const template = collection.getItemBySourceKey('validate').getValidateTemplateName();
            assert.equal(template, DEFAULT_VALIDATORS.text);
        });

        it('returns validator from validateTemplateName property', () => {
            const template = collection.getItemBySourceKey('customValidateTemplate').getValidateTemplateName();
            assert.equal(template, 'validateTemplate');
        });
    });

    describe('getEditorOptions', () => {
        it('item contains propertyValue in options', () => {
            const editorOptions = collection.getItemBySourceKey('description').getEditorOptions();
            assert.equal(editorOptions.minLines, 3);
            assert.equal(editorOptions.propertyValue, 'This is http://mysite.com');
        });
    });
});
