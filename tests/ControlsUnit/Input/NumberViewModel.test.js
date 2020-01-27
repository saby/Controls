define(
   [
      'Core/Control',
      'Controls/_input/Number/ViewModel'
   ],
   function(Control, NumberViewModel) {

      'use strict';

      describe('Controls/_input/Number/ViewModel', function() {
         var
            testCases = [
               {
                  testName: 'Invalid 12.0 => 12a.0',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '12',
                     insert: 'a',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '12.0',
                     position: 2
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Invalid 12 => 12a',
                  controlConfig: {
                     precision: 0,
                     useGrouping: true
                  },
                  splitValue: {
                     before: '12',
                     insert: 'a',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12',
                     position: 2
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Invalid 12.3 => 12.3a',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '12.3',
                     insert: 'a',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12.3',
                     position: 4
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Invalid 123.0 => -123.0',
                  controlConfig: {
                     useGrouping: true,
                     onlyPositive: true
                  },
                  splitValue: {
                     before: '',
                     insert: '-',
                     after: '123.0',
                     delete: ''
                  },
                  result: {
                     value: '123.0',
                     position: 0
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Invalid 123 => -123',
                  controlConfig: {
                     useGrouping: true,
                     onlyPositive: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '-',
                     after: '123',
                     delete: ''
                  },
                  result: {
                     value: '123',
                     position: 0
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Max length integers part 12 345.0 => 12 345.6',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5,
                     precision: 1
                  },
                  splitValue: {
                     before: '12 345',
                     insert: '6',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '12 345.6',
                     position: 7
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Max length decimal part 0.12345 => 0.12345',
                  controlConfig: {
                     useGrouping: true,
                     precision: 5
                  },
                  splitValue: {
                     before: '0.12345',
                     insert: '6',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '0.12345',
                     position: 6
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Max length decimal part 0.12345 => 0.18345',
                  controlConfig: {
                     useGrouping: true,
                     precision: 5
                  },
                  splitValue: {
                     before: '0.1',
                     insert: '8',
                     after: '2345',
                     delete: ''
                  },
                  result: {
                     value: '0.18345',
                     position: 4
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Forbid inserting dot if precision is 0',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '12',
                     insert: '.',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12',
                     position: 3
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'No dot when input starts if precision is 0 (empty field)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '1',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '1',
                     position: 1
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'No dot when input starts if precision is 0 (field with value)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '12',
                     insert: '3',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '123',
                     position: 3
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Inserting a dot at the beginning of a line results in \'0.0\'',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '.',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '0.0',
                     position: 2
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Inserting 5 at the beginning of a line results in \'5.0\'',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '5',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '5',
                     position: 1
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Delete space operation removes symbol before space and moves cursor left',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '123',
                     insert: '',
                     after: '456',
                     delete: ' '
                  },
                  result: {
                     value: '12 456',
                     position: 2
                  },
                  inputType: 'deleteBackward'
               },
               {
                  testName: 'Symbols ",", "б", "ю", "Б", "Ю" are replaced by dot',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '123',
                     insert: 'б',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '123',
                     position: 3
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Transfer of a position on a dot.',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '0',
                     insert: '.',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '0.0',
                     position: 2
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Second dot is not allowed',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '123.456',
                     insert: '.',
                     after: '789',
                     delete: ''
                  },
                  result: {
                     value: '123.456789',
                     position: 4
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Remove space using \'delete\' button',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '123',
                     insert: '',
                     after: '456',
                     delete: ' '
                  },
                  result: {
                     value: '12 356',
                     position: 4
                  },
                  inputType: 'deleteForward'
               },
               {
                  testName: 'Insert minus after 0',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '0',
                     insert: '-',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '-',
                     position: 21
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Insert minus after first zero in 0.0',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '0',
                     insert: '-',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '-0.0',
                     position: 2
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Insert number after first "0" in line',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '0',
                     insert: '1',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '1',
                     position: 1
                  },
                  inputType: 'insert'
               },
               {
                  testName: 'Insert number after first "0" in line (with .0)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '0',
                     insert: '1',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '1.0',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number after first "-0" in line',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '-0',
                     insert: '1',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '-1',
                     position: 2
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number after first "-0" in line (with .0)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '-0',
                     insert: '1',
                     after: '.0',
                     delete: ''
                  },
                  result: {
                     value: '-1.0',
                     position: 2
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number in field with maxed integers (first in line)',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5
                  },
                  splitValue: {
                     before: '',
                     insert: '6',
                     after: '12 345',
                     delete: ''
                  },
                  result: {
                     value: '62 345',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number in field with maxed integers (before space)',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 4
                  },
                  splitValue: {
                     before: '',
                     insert: '5',
                     after: '1 234',
                     delete: ''
                  },
                  result: {
                     value: '5 234',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number in field with maxed integers (first in line, with .0)',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5
                  },
                  splitValue: {
                     before: '',
                     insert: '6',
                     after: '12 345.0',
                     delete: ''
                  },
                  result: {
                     value: '62 345.0',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number in field from buffer',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '1 2',
                     insert: '567',
                     after: '34.0',
                     delete: ''
                  },
                  result: {
                     value: '1 256 734.0',
                     position: 4
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number in field with maxed integers (before space, with .0)',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 4
                  },
                  splitValue: {
                     before: '',
                     insert: '5',
                     after: '1 234.0',
                     delete: ''
                  },
                  result: {
                     value: '5 234.0',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Delete dot forward followed by single zero',
                  controlConfig: {
                     useGrouping: true,
                     useAdditionToMaxPrecision: true
                  },
                  splitValue: {
                     before: '123',
                     insert: '',
                     after: '0',
                     delete: '.'
                  },
                  result: {
                     value: '123.0',
                     position: 4
                  },
                  inputType: 'deleteForward'
               },

               {
                  testName: 'Delete dot forward followed by some number',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '123',
                     insert: '',
                     after: '456',
                     delete: '.'
                  },
                  result: {
                     value: '123.56',
                     position: 4
                  },
                  inputType: 'deleteForward'
               },

               {
                  testName: 'Delete whole decimal part',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '123',
                     insert: '',
                     after: '4',
                     delete: '.'
                  },
                  result: {
                     value: '12.4',
                     position: 3
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: 'Delete last symbol',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '',
                     delete: '1'
                  },
                  result: {
                     value: '',
                     position: 0
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: 'Delete last symbol (with .0)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '.0',
                     delete: '1'
                  },
                  result: {
                     value: '0.0',
                     position: 1
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: 'Delete last symbol (negative number, precision != 0)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '-',
                     insert: '',
                     after: '.0',
                     delete: '1'
                  },
                  result: {
                     value: '-0.0',
                     position: 1
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: 'Delete last symbol (negative number, precision == 0)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '-',
                     insert: '',
                     after: '',
                     delete: '1'
                  },
                  result: {
                     value: '-',
                     position: 1
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: 'Delete decimal when showEmptyDecimals is enabled',
                  controlConfig: {
                     useGrouping: true,
                     showEmptyDecimals: true
                  },
                  splitValue: {
                     before: '123.45',
                     insert: '',
                     after: '',
                     delete: '6'
                  },
                  result: {
                     value: '123.45',
                     position: 5
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: '123.0 delete 0',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '123.',
                     insert: '',
                     after: '',
                     delete: '0'
                  },
                  result: {
                     value: '123.',
                     position: 3
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: '1.0 delete 1',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '.0',
                     delete: '1'
                  },
                  result: {
                     value: '0.0',
                     position: 1
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: '0.0 delete first 0 (backspace)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '.0',
                     delete: '0'
                  },
                  result: {
                     value: '0.0',
                     position: 1
                  },
                  inputType: 'deleteBackward'
               },

               {
                  testName: '0.0 delete first 0 (delete)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '.0',
                     delete: '0'
                  },
                  result: {
                     value: '0.0',
                     position: 0
                  },
                  inputType: 'deleteForward'
               },

               {
                  testName: '0',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '',
                     delete: '0'
                  },
                  result: {
                     value: '',
                     position: 0
                  },
                  inputType: 'deleteForward'
               },

               {
                  testName: '-0.0 delete first 0 (delete)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '-',
                     insert: '',
                     after: '.0',
                     delete: '0'
                  },
                  result: {
                     value: '-0.0',
                     position: 2
                  },
                  inputType: 'deleteForward'
               },

               {
                  testName: '0.0 delete first 0 (delete with selection)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '.0',
                     delete: '0'
                  },
                  result: {
                     value: '0.0',
                     position: 0
                  },
                  inputType: 'delete'
               },

               {
                  testName: '-0.0 delete first 0 (delete with selection)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '-',
                     insert: '',
                     after: '.0',
                     delete: '0'
                  },
                  result: {
                     value: '-0.0',
                     position: 2
                  },
                  inputType: 'delete'
               },

               {
                  testName: 'Delete whole value',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '',
                     after: '',
                     delete: '123.456'
                  },
                  result: {
                     value: '',
                     position: 0
                  },
                  inputType: 'delete'
               },

               {
                  testName: 'Forbid inserting second zero at line start',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '0',
                     after: '0.5',
                     delete: ''
                  },
                  result: {
                     value: '0.5',
                     position: 0
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Inserting minus in empty field (precision != 0)',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '-',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '-',
                     position: 2
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert minus in empty field (precision == 0)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '-',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '-',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert first symbol in decimal part: 123.0 => 123.4',
                  controlConfig: {
                     useGrouping: true,
                     precision: 1
                  },
                  splitValue: {
                     before: '123.',
                     insert: '4',
                     after: '0',
                     delete: ''
                  },
                  result: {
                     value: '123.4',
                     position: 5
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Max integers length while precision = 0',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5,
                     precision: 0
                  },
                  splitValue: {
                     before: '12 345',
                     insert: '6',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12 345',
                     position: 6
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert minus at string start when it contains some value',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '',
                     insert: '-',
                     after: '1',
                     delete: ''
                  },
                  result: {
                     value: '-1',
                     position: 1
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert minus in decimals start, when max decimals length is reached',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '129.',
                     insert: '-',
                     after: '45',
                     delete: ''
                  },
                  result: {
                     value: '-129.45',
                     position: 5
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert float to integers',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '1 2',
                     insert: '7.8',
                     after: '34.56',
                     delete: ''
                  },
                  result: {
                     value: '12 734.856',
                     position: 3
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert float to decimals',
                  controlConfig: {
                     useGrouping: true
                  },
                  splitValue: {
                     before: '1 234.',
                     insert: '7.8',
                     after: '56',
                     delete: ''
                  },
                  result: {
                     value: '1 234.78',
                     position: 8
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert float to decimals with precision (start)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '1 234.',
                     insert: '7.8',
                     after: '56',
                     delete: ''
                  },
                  result: {
                     value: '1 234.78',
                     position: 8
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert float to decimals with precision (end)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '1 234.56',
                     insert: '7.8',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '1 234.56',
                     position: 8
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert long integer number in field with integersLength option',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5,
                     precision: 0
                  },
                  splitValue: {
                     before: '',
                     insert: '123456',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12 345',
                     position: 6
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert long integer number (with useGrouping) in field with integersLength option',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5
                  },
                  splitValue: {
                     before: '',
                     insert: '123 456 789',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12 345',
                     position: 11
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert long float number in field with integersLength option',
                  controlConfig: {
                     useGrouping: true,
                     integersLength: 5
                  },
                  splitValue: {
                     before: '',
                     insert: '123456.789',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '12 345.6789',
                     position: 10
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert number with long decimals part in field with precision option',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '',
                     insert: '1.58897987987',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '1.58',
                     position: 4
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert value in decimals part with precision (decimals part is full)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '123.4',
                     insert: '678',
                     after: '5',
                     delete: ''
                  },
                  result: {
                     value: '123.46',
                     position: 6
                  },
                  inputType: 'insert'
               },

               {
                  testName: 'Insert value in decimals part with precision (decimals part is not full)',
                  controlConfig: {
                     useGrouping: true,
                     precision: 2
                  },
                  splitValue: {
                     before: '123.4',
                     insert: '678',
                     after: '',
                     delete: ''
                  },
                  result: {
                     value: '123.46',
                     position: 6
                  },
                  inputType: 'insert'
               }
            ];

         testCases.forEach(function(item) {
            it(item.testName, function() {
               var numberViewModel = new NumberViewModel(item.controlConfig, 0);

               numberViewModel._displayValue = item.splitValue.before + item.splitValue.delete + item.splitValue.after;
               numberViewModel.handleInput(item.splitValue, item.inputType);
               assert.equal(numberViewModel.displayValue, item.result.value);
            });
         });

         it('getDisplayValue: only integers', function() {
            var numberViewModel = new NumberViewModel({
               useGrouping: true
            }, 123456);

            assert.equal(numberViewModel.displayValue, '123 456');
         });

         it('getDisplayValue: integers and decimals', function() {
            var numberViewModel = new NumberViewModel({
               useGrouping: true
            }, 123456.78);

            assert.equal(numberViewModel.displayValue, '123 456.78');
         });

         describe('getDisplayValue', function() {
            var getValueTests = [
               ['123456', '123 456'],
               ['-123456', '-123 456'],
               ['123.456', '123.456'],
               ['0', '0'],
               ['-', '-'],
               ['', '']
            ];

            getValueTests.forEach(function(test, i) {
               it('Test ' + i, function() {
                  var numberViewModel = new NumberViewModel({
                     useGrouping: true
                  }, test[0]);

                  assert.isTrue(numberViewModel.displayValue === test[1]);
               });
            });
         });
      });
   }
);
