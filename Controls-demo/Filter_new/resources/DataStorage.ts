export const responsibleData = [
    {id: 1, title: 'Структура организации', '@parent': true, parent: null},
    {id: 2, title: 'Директор', '@parent': null, parent: null},
    {id: 3, title: 'Иванов Иван Иванович', parent: 1, '@parent': null},
    {id: 4, title: 'Швыров Петр Алексеевич', parent: 1, '@parent': true},
    {id: 5, title: 'Смирнов Алексей Евгеньевич', parent: 1, '@parent': null},
    {id: 6, title: 'Ильин Илья Иванович', parent: 1, '@parent': null},
    {id: 7, title: 'Васильчиков Василий Васильевич', parent: 1, '@parent': null},
    {id: 8, title: 'Дубов Юрий Вадимович', parent: 4, '@parent': null},
    {id: 9, title: 'Капустина Мария Евгеньевна', parent: 4, '@parent': null},
    {id: 10, title: 'Соловьев Архип Александрович', parent: 4, '@parent': null},
    {id: 11, title: 'Собакин Алексей Валерьевич', parent: 4, '@parent': null}
];
export const warehouseData = [
    {id: 1, title: 'ООО Аргус', '@parent': true, parent: null},
    {id: 2, title: 'Головная организация', '@parent': null, parent: null},
    {id: 3, title: 'Филиал', parent: 1, '@parent': null},
    {id: 4, title: 'Филиалы', parent: 1, '@parent': true},
    {id: 5, title: 'ВТБ БАНК', parent: 1, '@parent': null},
    {id: 6, title: 'ВТБ Москва', parent: 1, '@parent': null},
    {id: 7, title: 'ООО Васильчиков', parent: 1, '@parent': null},
    {id: 8, title: 'Сбербанк', parent: 4, '@parent': null},
    {id: 9, title: 'Альфабанк', parent: 4, '@parent': null},
    {id: 10, title: 'ООО Петров', parent: 4, '@parent': null},
    {id: 11, title: 'Филиал ВТБ', parent: 4, '@parent': null},
    {
        id: 12, title: `Государственное учреждение муниципального образования «Киевский центр подготовки, переподготовки и
     повышения квалификации специалистов водного транспорта»`, parent: null, '@parent': null
    }
];
export const hierarchyOperationData = [
    {id: 'Приход', title: 'Приход', parent: null, '@parent': true},
    {id: 'Расход', title: 'Расход', parent: null, '@parent': true},
    {id: '11', title: 'Поступление от сотрудника', parent: 'Приход', '@parent': null},
    {id: '12', title: 'Оплата от покупателя', parent: 'Приход', '@parent': null},
    {id: '21', title: 'Оплата от покупателя', parent: 'Расход', '@parent': null},
    {id: '22', title: 'Расход', parent: 'Расход', '@parent': null},
    {id: '23', title: 'Расход покупателя', parent: 'Расход', '@parent': null},
    {id: '24', title: 'Оплата поставщику', parent: 'Расход', '@parent': null},
    {id: '13', title: 'Возврат подотчетных сумм', parent: 'Приход', '@parent': null},
    {id: '14', title: 'Возврат излишне перечисленной зарплаты', parent: 'Приход', '@parent': null},
    {id: '15', title: 'Поступление от прочих лиц', parent: 'Приход', '@parent': null},
    {id: '16', title: 'Оплата от покупателя по операциям необлагаемым НДС', parent: 'Приход', '@parent': null},
    {id: '17', title: 'Целевое поступление', parent: 'Приход', '@parent': null},
    {id: '18', title: 'Возврат оплаты от прочих лиц', parent: 'Приход', '@parent': null},
    {
        id: '322', title: `Оплата от покупателя по операциям необлагаемым НДС при участии Государственного учреждения
        муниципального образования «Киевский центр подготовки, переподготовки иовышения квалификации специалистов
        водного транспорта»`,
        parent: 'Приход', '@parent': null
    }
];

export const departments = [
    {id: 1, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка', amount: 1},
    {id: 2, department: 'Продвижение СБИС', owner: 'Кошелев А.Е.', title: 'Продвижение СБИС', amount: 10},
    {id: 3, department: 'Федеральная клиентская служка', owner: 'Мануйлова Ю.А.', title: 'Федеральная клиентская служка', amount: 100},
    {id: 4, department: 'Служба эксплуатации', owner: 'Субботин А.В.', title: 'Служба эксплуатации', amount: 15},
    {id: 5, department: 'Технологии и маркетинг', owner: 'Чеперегин А.С.', title: 'Технологии и маркетинг', amount: 11},
    {id: 6, department: 'Федеральный центр продаж. Call-центр Ярославль', owner: 'Кошелев А.Е.', title: 'Федеральный центр продаж. Call-центр Ярославль', amount: 150},
    {id: 7, department: 'Сопровождение информационных систем', owner: 'Кошелев А.Е.', title: 'Сопровождение информационных систем', amount: 18}
];
