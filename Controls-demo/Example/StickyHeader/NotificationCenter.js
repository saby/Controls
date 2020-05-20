define('Controls-demo/Example/StickyHeader/NotificationCenter',
   [
      'Core/Control',
      'Types/source',
      'tmpl!Controls-demo/Example/StickyHeader/NotificationCenter/NotificationCenter',

      'Controls/heading',
      'tmpl!Controls-demo/Example/StickyHeader/NotificationCenter/News',
      'tmpl!Controls-demo/Example/StickyHeader/NotificationCenter/Employees',
      'tmpl!Controls-demo/Example/StickyHeader/NotificationCenter/Violations',
   ],
   function(Control, source, template) {

      'use strict';

      var dataset = [
         {
            data: [
               {
                  News: 1,
                  author: 'Bykanov A.',
                  group: 'Platform SABY',
                  title: 'Documentation update wi.sbis.ru',
                  content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque inventore itaque molestias nisi nostrum omnis provident quam rerum! Accusamus blanditiis culpa dolor doloremque eligendi eveniet libero nostrum possimus quaeratvoluptate.',
                  time: '5 Apr 13:36'
               },
               {
                  News: 2,
                  author: 'Zhuravlev M.',
                  group: 'Programming',
                  title: 'New hacks',
                  content: 'At distinctio dolores eligendi esse eveniet molestiae nam provident sint voluptas voluptate! Aliquam aperiam commodi debitis deleniti est excepturi id impedit, ipsum labore minus non quae sequi tempore veniam voluptatem!',
                  time: '10 May 14:00'
               },
               {
                  News: 3,
                  author: 'Sidorov T.',
                  group: 'Trolling',
                  title: 'VDOM',
                  content: 'Accusantium aliquid animi blanditiis commodi corporis dolorem dolorum eius eligendi exercitationem illum laborum molestias nesciunt pariatur perferendis porro praesentium quae quasi reiciendis saepe sit ullam, veniam vero voluptate. Earum, ipsum.',
                  time: '1 Sep 00:00'
               },
               {
                  News: 4,
                  author: 'Smirnov K.',
                  group: 'Prikols',
                  title: 'Peekaboo',
                  content: 'Aliquam amet asperiores consequuntur cupiditate dolore, et expedita in inventore laborum modi natus neque nostrum optio porro, provident quasi quos repellat sed veniam vero. Dolorum mollitia neque obcaecati qui quia?',
                  time: '10 Oct 13:00'
               },
               {
                  News: 5,
                  author: 'Krasilnikov A.',
                  group: 'Popup',
                  title: 'Compatibility',
                  content: 'Accusamus, consequatur cum debitis delectus deserunt explicabo fugiat impedit in laboriosam magni odio perferendis quaerat quas quibusdam ratione rem rerum similique, tempore, tenetur unde vel veniam veritatis vero voluptate voluptatibus!',
                  time: '1 Dec 20:30'
               },
               {
                  News: 6,
                  author: 'Kydrin P.',
                  group: 'Mobilization',
                  title: 'Tomorrow we start from the main',
                  content: 'Accusamus aperiam, aut debitis dolore, dolorem eius error facere illum incidunt laudantium libero minima minus neque officiis porro quae reprehenderit soluta voluptate. At ex excepturi impedit quae vero! Nam, sequi!',
                  time: '23 Oct 01:00'
               },
               {
                  News: 7,
                  author: 'Cherkashin N.',
                  group: 'Javascript for small',
                  title: 'Bind',
                  content: 'Ab, blanditiis consequuntur ducimus esse et, eveniet excepturi facere inventore ipsa iste libero magni mollitia neque, nesciunt quam quis rerum similique sint veniam voluptates. Alias dolor est suscipit ut voluptate.',
                  time: '10 Nov 10:10'
               },
               {
                  News: 8,
                  author: 'Kotik D.',
                  group: 'Bedtime story',
                  title: 'Cheburashka',
                  content: 'Accusamus accusantium aliquam at beatae, debitis dignissimos dolore earum eos esse eveniet, ex fugit hic labore magni maiores nesciunt praesentium quaerat qui quod repudiandae sint sit suscipit, unde veritatis voluptatem?',
                  time: '27 Oct 23:00'
               }
            ],
            keyProperty: 'News'
         },
         {
            data: [
               {
                  Violations: 1,
                  time: '14 june 10:44',
                  title: 'Delay',
                  content: 'Time of arrival: 22:40'
               },
               {
                  Violations: 2,
                  time: '14 september 10:44',
                  title: 'Early arrival',
                  content: 'Time of arrival: 7:00'
               },
               {
                  Violations: 3,
                  time: '16 august 10:44',
                  title: 'Early care',
                  content: 'Time of arrival: 16:23'
               }
            ],
            keyProperty: 'Violations'
         },
         {
            data: [
               {
                  Employees: 1,
                  icon: 'EmoiconAngry'
               },
               {
                  Employees: 2,
                  icon: 'EmoiconAngryInvert'
               },
               {
                  Employees: 3,
                  icon: 'EmoiconAnnoyed'
               },
               {
                  Employees: 4,
                  icon: 'EmoiconBlind'
               },
               {
                  Employees: 5,
                  icon: 'EmoiconShockedInvert'
               },
               {
                  Employees: 6,
                  icon: 'EmoiconPuzzled'
               },
               {
                  Employees: 7,
                  icon: 'EmoiconRofl'
               },
               {
                  Employees: 8,
                  icon: 'EmoiconYawn'
               },
               {
                  Employees: 9,
                  icon: 'EmoiconWink'
               },
               {
                  Employees: 10,
                  icon: 'EmoiconTongue'
               }
            ],
            keyProperty: 'Employees'
         }
      ];

      var ModuleClass = Control.extend({
         _template: template,

         _titleVisible: true,

         _shadowVisible: true,

         _beforeMount: function() {
            this._dataset = dataset.map(function(data) {
               return new source.Memory(data);
            });
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Example/StickyHeader/NotificationCenter/News', 'Controls-demo/Example/StickyHeader/NotificationCenter/Employees', 'Controls-demo/Example/StickyHeader/NotificationCenter/Violations', 'Controls-demo/Example/StickyHeader/NotificationCenter/NotificationCenter'];

      return ModuleClass;
}
);
