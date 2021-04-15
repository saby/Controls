define("ControlsUnit/Validators/IsValidDate.test", ["require", "exports", "Controls/validate", "Types/entity", "chai"], function (require, exports, validate_1, entity_1, chai_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Controls.Validators.IsValidDate', function () {
        [{
                value: null,
                resp: true
            }, {
                value: new entity_1.Date(2019, 0, 1),
                resp: true
            }, {
                value: new entity_1.Date('Invalid'),
                resp: 'Дата заполнена некорректно'
            }, {
                value: new entity_1.Time('Invalid'),
                resp: 'Время заполнено некорректно'
            }, {
                value: new entity_1.DateTime('Invalid'),
                resp: 'Дата или время заполнены некорректно'
            }, {
                value: new entity_1.Date(1300, 0, 1),
                resp: 'Дата заполнена некорректно'
            }
        ].forEach(function (test) {
            it("should return " + test.resp + " for " + test.value, function () {
                chai_1.assert.equal(validate_1.isValidDate({
                    value: test.value
                }), test.resp);
            });
        });
    });
});
