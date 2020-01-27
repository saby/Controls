define(["Controls/_propertyGrid/PropertyGrid"], function(PropertyGrid) {

    "use strict";

    describe("Controls.PropertyGrid", function() {

        const configWithEditingObject = {
            options: {
                editingObject: {
                    stringField: "stringValue",
                    booleanField: false
                },
                source: [
                    {name: "stringField"},
                    {name: "booleanField"}
                ]
            },
            result: [
                {name: "stringField", propertyValue: "stringValue", group: "CONTROLS_HIDDEN_GROUP"},
                {name: "booleanField", propertyValue: false, group: "CONTROLS_HIDDEN_GROUP"}
            ],
        };

        const configWithEditingObjectAndSource = {
            options: {
                editingObject: {
                    booleanField: false,
                    stringField: "stringValue",
                    stringField1: "stringValue1"
                },
                source: [
                        {name: "stringField", editorTemplateName: "Controls/_input/Text"},
                        {name: "booleanField", editorOptions: {icon: "testIcon"}},
                        {name: "stringField1"}
                    ],
            },
            result: [
                {name: "stringField", editorTemplateName: "Controls/_input/Text", propertyValue: "stringValue", group: "CONTROLS_HIDDEN_GROUP"},
                {name: "booleanField", editorOptions: {icon: "testIcon"}, propertyValue: false, group: "CONTROLS_HIDDEN_GROUP"},
                {name: "stringField1", propertyValue: "stringValue1", group: "CONTROLS_HIDDEN_GROUP"}
            ],
        };

        const configWithGroup = {
            options: {
                editingObject: {
                    booleanField: false,
                    stringField: "stringValue",
                },
                source: [
                    {name: "stringField", editorTemplateName: "Controls/_input/Text", group: "string"},
                    {name: "booleanField", editorOptions: {icon: "testIcon"}, group: "boolean"}
                ],
            }
        };

        describe("_beforeMount with different configs", function() {

            it("config with editingObject", () => {
                let pg = new PropertyGrid();
                pg._beforeMount(configWithEditingObject.options);

                /* testing items of propertyGrid, that generated on editingObject */
                assert.deepStrictEqual(pg.items.getRawData(), configWithEditingObject.result);

                /* testing default templates */
                assert.strictEqual(pg.items.at(0).get("editorTemplateName"), "Controls/_propertyGrid/defaultEditors/String");
                assert.strictEqual(pg.items.at(1).get("editorTemplateName"), "Controls/_propertyGrid/defaultEditors/Boolean");
                assert.strictEqual(Object.getPrototypeOf(pg.items.at(0))._moduleName, 'Controls/_propertyGrid/PropertyGridItem');
            });

            it("config with editingObject and source", () => {
                let pg = new PropertyGrid();
                pg._beforeMount(configWithEditingObjectAndSource.options);

                /* testing items of propertyGrid, that generated on editingObject and source */
                assert.deepEqual(pg.items.getRawData(), configWithEditingObjectAndSource.result);

                /* testing default and custom templates */
                assert.strictEqual(pg.items.at(0).get("editorTemplateName"), "Controls/_input/Text");
                assert.strictEqual(pg.items.at(1).get("editorTemplateName"), "Controls/_propertyGrid/defaultEditors/Boolean");
                assert.strictEqual(pg.items.at(2).get("editorTemplateName"), "Controls/_propertyGrid/defaultEditors/String");
            });
        });

        describe('_propertyValueChanged handler', () => {
            it ('property changed (simple config)', function() {
                var pg = new PropertyGrid();
                pg._beforeMount(configWithEditingObject.options);

                pg._propertyValueChanged({stopPropagation: () => {}}, pg.items.at(0), 'testValue');

                assert.equal(pg.items.at(0).get('propertyValue'), 'testValue');
            });
        });

    });
});
