define([
   "Core/core-merge",
   'Env/Env',
   "Controls/_input/DateTime/MaskViewModel"
], function(
    cMerge,
    Env,
    MaskViewModel
) {
   "use strict";

   let options = {
      value: "",
      replacer: " ",
      formatMaskChars: {
         "D": "[0-9]",
         "M": "[0-9]",
         "Y": "[0-9]",
         "H": "[0-9]",
         "m": "[0-9]",
         "s": "[0-9]",
         "U": "[0-9]",
      },
   };

   describe("Controls/_input/DateTime/MaskViewModel", function() {
      describe("handleInput", function() {
         beforeEach(() => {
            sinon.stub(Env.constants, 'isServerSide').value(false);
         });

         afterEach(() => {
            sinon.restore();
         });

         [
            // Inserting date from buffer
            { mask: "DD.MM.YYYY", before: "", after: "  .  .    ", insert: "23", delete: "", displayValue: "23.  .    ", value: "23      ", selection: 3},
            { mask: "DD.MM.YYYY", before: "0", after: "1.01.2017", insert: "05.11.21", delete: "", displayValue: "05.11.2021", value: "05112021"},
            { mask: "DD.MM.YYYY", before: "01.01.20", after: "17", insert: "05.11.79", delete: "", displayValue: "05.11.1979", value: "05111979"},
            { mask: "DD.MM.YYYY", before: "", after: "", insert: "05.11.21", delete: "", displayValue: "05.11.2021", value: "05112021"},
            { mask: "DD.MM.YY", before: "01.0", after: "1.17", insert: "01.04.2021", delete: "", displayValue: "01.04.21", value: "010421"},
            { mask: "DD.MM.YY", before: "", after: "  .  .  ", insert: "1.4.2021", delete: "", displayValue: "01.04.21", value: "010421"},
            { mask: "DD.MM.YY", before: "01.0", after: "1.17", insert: "2", delete: "", displayValue: "01.02.17", value: "010217", selection: 6 },
            { mask: "DD.MM", before: "01.0", after: "1", insert: "05.11.21", delete: "", displayValue: "05.11", value: "0511"},
            { mask: "YYYY", before: "20", after: "07", insert: "05.11.21", delete: "", displayValue: "2021", value: "2021"},

            // Inserting time from buffer
            { mask: "HH:mm", before: "12", after: ":17", insert: "13:25", delete: "", displayValue: "13:25", value: "1325"},
            { mask: "HH:mm:ss", before: "12:1", after: "5:30", insert: "15:30", delete: "", displayValue: "15:30:00", value: "153000"},

            // incorrect inserted
            { mask: "DD.MM.YY", before: "01.0", after: "1.17", insert: "01.024.2021", delete: "", displayValue: "01.00.10", value: "010010"}
         ].forEach(function(test) {
            it(`should return ${test.displayValue} if inserted '${test.insert}'
               between before('${test.before}') and after('${test.after}') is passed`, function() {
               let
                  model = new MaskViewModel.default(cMerge({ mask: test.mask }, options, { preferSource: true }), options.value),
                  selection;

               model.handleInput({
                  before: test.before,
                  after: test.after,
                  insert: test.insert,
                  delete: test.delete,
               }, "insert");

               assert.strictEqual(model.displayValue, test.displayValue);
               assert.strictEqual(model.value, test.value);

               selection = test.selection !== undefined ? test.selection : model.displayValue.length;
               assert.strictEqual(model._selection.start, selection);
               assert.strictEqual(model._selection.end, selection);
            });
         });
      });

   });
});
