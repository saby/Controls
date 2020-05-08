import {RecordSet} from 'Types/collection';
import {Model, adapter} from 'Types/entity';

let devices = new RecordSet({adapter: new adapter.Sbis()});

devices.addField({name: "@Id", type: 'real'});
devices.addField({name: "DeviceId", type: 'real'});
devices.addField({name: "UserId", type: 'real'});
devices.addField({name: "UserAgent", type: 'string'});
devices.addField({name: "IsPlugin", type: 'boolean'});
devices.addField({name: "DeviceType", type: 'real'});
devices.addField({name: "Status", type: 'real'});
devices.addField({name: "DeviceKey", type: 'string'});
devices.addField({name: 'DeviceName', type: 'string'});
devices.addField({name: "RealDeviceName", type: 'string'});
devices.addField({name: "Browser", type: 'string'});
devices.addField({name: "City", type: 'string'});
devices.addField({name: "DeviceModel", type: 'string'});
devices.addField({name: "IP", type: 'string'});
devices.addField({name: "EnterType", type: 'real'});
devices.addField({name: "Cause", type: 'string'});
devices.addField({name: "CurrentDevice", type: 'string'});
devices.addField({name: "Blocked", type: 'boolean'});
devices.addField({name: "Trusted", type: 'boolean'});
devices.addField({name: "Date", type: 'datetime'});

for (let i = 0; i < getActivityDevices().length; i++) {
    let record = new Model({adapter: 'adapter.sbis'});
    record.addField({name: "@Id", type: 'real'});
    record.addField({name: "DeviceId", type: 'real'});
    record.addField({name: "UserId", type: 'real'});
    record.addField({name: "UserAgent", type: 'string'});
    record.addField({name: "IsPlugin", type: 'boolean'});
    record.addField({name: "DeviceType", type: 'real'});
    record.addField({name: "Status", type: 'real'});
    record.addField({name: "DeviceKey", type: 'string'});
    record.addField({name: 'DeviceName', type: 'string'});
    record.addField({name: "RealDeviceName", type: 'string'});
    record.addField({name: "Browser", type: 'string'});
    record.addField({name: "City", type: 'string'});
    record.addField({name: "DeviceModel", type: 'string'});
    record.addField({name: "IP", type: 'string'});
    record.addField({name: "EnterType", type: 'real'});
    record.addField({name: "Cause", type: 'string'});
    record.addField({name: "CurrentDevice", type: 'string'});
    record.addField({name: "Blocked", type: 'boolean'});
    record.addField({name: "Trusted", type: 'boolean'});
    record.addField({name: "Date", type: 'datetime'});

    record.set("@Id", getActivityDevices()[i]["@Id"]);
    record.set("DeviceId", getActivityDevices()[i]["DeviceId"]);
    record.set("UserId", getActivityDevices()[i]["UserId"]);
    record.set("UserAgent", getActivityDevices()[i]["UserAgent"]);
    record.set("IsPlugin", getActivityDevices()[i]["IsPlugin"]);
    record.set("DeviceType", getActivityDevices()[i]["DeviceType"]);
    record.set("Status", getActivityDevices()[i]["Status"]);
    record.set("DeviceKey", getActivityDevices()[i]["DeviceKey"]);
    record.set("DeviceName", getActivityDevices()[i]["DeviceName"]);
    record.set("RealDeviceName", getActivityDevices()[i]["RealDeviceName"]);
    record.set("Browser", getActivityDevices()[i]["Browser"]);
    record.set("City", getActivityDevices()[i]["City"]);
    record.set("DeviceModel", getActivityDevices()[i]["DeviceModel"]);
    record.set("IP", getActivityDevices()[i]["IP"]);
    record.set("EnterType", getActivityDevices()[i]["EnterType"]);
    record.set("Cause", getActivityDevices()[i]["Cause"]);
    record.set("CurrentDevice", getActivityDevices()[i]["CurrentDevice"]);
    record.set("Trusted", getActivityDevices()[i]["Trusted"]);
    record.set("Date", getActivityDevices()[i]["Date"]);
    devices.add(record);
}

let blockedDevices = new RecordSet({adapter: 'adapter.sbis'});

blockedDevices.addField({name: "@Id", type: 'real'});
blockedDevices.addField({name: "DeviceId", type: 'real'});
blockedDevices.addField({name: "UserId", type: 'real'});
blockedDevices.addField({name: "UserAgent", type: 'string'});
blockedDevices.addField({name: "IsPlugin", type: 'boolean'});
blockedDevices.addField({name: "DeviceType", type: 'real'});
blockedDevices.addField({name: "Status", type: 'real'});
blockedDevices.addField({name: "DeviceKey", type: 'string'});
blockedDevices.addField({name: 'DeviceName', type: 'string'});
blockedDevices.addField({name: "RealDeviceName", type: 'string'});
blockedDevices.addField({name: "Browser", type: 'string'});
blockedDevices.addField({name: "City", type: 'string'});
blockedDevices.addField({name: "DeviceModel", type: 'string'});
blockedDevices.addField({name: "IP", type: 'string'});
blockedDevices.addField({name: "EnterType", type: 'real'});
blockedDevices.addField({name: "Cause", type: 'string'});
blockedDevices.addField({name: "CurrentDevice", type: 'string'});
blockedDevices.addField({name: "Blocked", type: 'boolean'});
blockedDevices.addField({name: "Trusted", type: 'boolean'});
blockedDevices.addField({name: "Date", type: 'datetime'});

for (let i = 0; i < getLockedDevices().length; i++) {
    let record = new Model({adapter: 'adapter.sbis'});
    record.addField({name: "@Id", type: 'real'});
    record.addField({name: "DeviceId", type: 'real'});
    record.addField({name: "UserId", type: 'real'});
    record.addField({name: "UserAgent", type: 'string'});
    record.addField({name: "IsPlugin", type: 'boolean'});
    record.addField({name: "DeviceType", type: 'real'});
    record.addField({name: "Status", type: 'real'});
    record.addField({name: "DeviceKey", type: 'string'});
    record.addField({name: 'DeviceName', type: 'string'});
    record.addField({name: "RealDeviceName", type: 'string'});
    record.addField({name: "Browser", type: 'string'});
    record.addField({name: "City", type: 'string'});
    record.addField({name: "DeviceModel", type: 'string'});
    record.addField({name: "IP", type: 'string'});
    record.addField({name: "EnterType", type: 'real'});
    record.addField({name: "Cause", type: 'string'});
    record.addField({name: "CurrentDevice", type: 'string'});
    record.addField({name: "Blocked", type: 'boolean'});
    record.addField({name: "Trusted", type: 'boolean'});
    record.addField({name: "Date", type: 'datetime'});

    record.set("@Id", getLockedDevices()[i]["@Id"]);
    record.set("DeviceId", getLockedDevices()[i]["DeviceId"]);
    record.set("UserId", getLockedDevices()[i]["UserId"]);
    record.set("UserAgent", getLockedDevices()[i]["UserAgent"]);
    record.set("IsPlugin", getLockedDevices()[i]["IsPlugin"]);
    record.set("DeviceType", getLockedDevices()[i]["DeviceType"]);
    record.set("Status", getLockedDevices()[i]["Status"]);
    record.set("DeviceKey", getLockedDevices()[i]["DeviceKey"]);
    record.set("DeviceName", getLockedDevices()[i]["DeviceName"]);
    record.set("RealDeviceName", getLockedDevices()[i]["RealDeviceName"]);
    record.set("Browser", getLockedDevices()[i]["Browser"]);
    record.set("City", getLockedDevices()[i]["City"]);
    record.set("DeviceModel", getLockedDevices()[i]["DeviceModel"]);
    record.set("IP", getLockedDevices()[i]["IP"]);
    record.set("EnterType", getLockedDevices()[i]["EnterType"]);
    record.set("Cause", getLockedDevices()[i]["Cause"]);
    record.set("CurrentDevice", getLockedDevices()[i]["CurrentDevice"]);
    record.set("Trusted", getLockedDevices()[i]["Trusted"]);
    record.set("Date", getLockedDevices()[i]["Date"]);
    blockedDevices.add(record);
}

let mainRecord = new Model({adapter: new adapter.Sbis()});

mainRecord.addField({name: "ActivityDevices", type: 'recordset'});
mainRecord.addField({name: "LockedDevices", type: 'recordset'});

mainRecord.set("ActivityDevices", devices);
mainRecord.set('LockedDevices', blockedDevices);

let failingAuth = new RecordSet({adapter: 'adapter.sbis'});

failingAuth.addField({name: "@Id", type: 'real'});
failingAuth.addField({name: "DeviceId", type: 'real'});
failingAuth.addField({name: "UserId", type: 'real'});
failingAuth.addField({name: "UserAgent", type: 'string'});
failingAuth.addField({name: "IsPlugin", type: 'boolean'});
failingAuth.addField({name: "DeviceType", type: 'real'});
failingAuth.addField({name: "Status", type: 'real'});
failingAuth.addField({name: "DeviceKey", type: 'string'});
failingAuth.addField({name: 'DeviceName', type: 'string'});
failingAuth.addField({name: "RealDeviceName", type: 'string'});
failingAuth.addField({name: "Browser", type: 'string'});
failingAuth.addField({name: "City", type: 'string'});
failingAuth.addField({name: "DeviceModel", type: 'string'});
failingAuth.addField({name: "IP", type: 'string'});
failingAuth.addField({name: "EnterType", type: 'real'});
failingAuth.addField({name: "Cause", type: 'string'});
failingAuth.addField({name: "CurrentDevice", type: 'string'});
failingAuth.addField({name: "Blocked", type: 'boolean'});
failingAuth.addField({name: "Trusted", type: 'boolean'});
failingAuth.addField({name: "Date", type: 'datetime'});

for (let i = 0; i < getFailingAuth().length; i++) {
    let record = new Model({adapter: 'adapter.sbis'});
    record.addField({name: "@Id", type: 'real'});
    record.addField({name: "DeviceId", type: 'real'});
    record.addField({name: "UserId", type: 'real'});
    record.addField({name: "UserAgent", type: 'string'});
    record.addField({name: "IsPlugin", type: 'boolean'});
    record.addField({name: "DeviceType", type: 'real'});
    record.addField({name: "Status", type: 'real'});
    record.addField({name: "DeviceKey", type: 'string'});
    record.addField({name: 'DeviceName', type: 'string'});
    record.addField({name: "RealDeviceName", type: 'string'});
    record.addField({name: "Browser", type: 'string'});
    record.addField({name: "City", type: 'string'});
    record.addField({name: "DeviceModel", type: 'string'});
    record.addField({name: "IP", type: 'string'});
    record.addField({name: "EnterType", type: 'real'});
    record.addField({name: "Cause", type: 'string'});
    record.addField({name: "CurrentDevice", type: 'string'});
    record.addField({name: "Blocked", type: 'boolean'});
    record.addField({name: "Trusted", type: 'boolean'});
    record.addField({name: "Date", type: 'datetime'});

    record.set("@Id", getFailingAuth()[i]["@Id"]);
    record.set("DeviceId", getFailingAuth()[i]["DeviceId"]);
    record.set("UserId", getFailingAuth()[i]["UserId"]);
    record.set("UserAgent", getFailingAuth()[i]["UserAgent"]);
    record.set("IsPlugin", getFailingAuth()[i]["IsPlugin"]);
    record.set("DeviceType", getFailingAuth()[i]["DeviceType"]);
    record.set("Status", getFailingAuth()[i]["Status"]);
    record.set("DeviceKey", getFailingAuth()[i]["DeviceKey"]);
    record.set("DeviceName", getFailingAuth()[i]["DeviceName"]);
    record.set("RealDeviceName", getFailingAuth()[i]["RealDeviceName"]);
    record.set("Browser", getFailingAuth()[i]["Browser"]);
    record.set("City", getFailingAuth()[i]["City"]);
    record.set("DeviceModel", getFailingAuth()[i]["DeviceModel"]);
    record.set("IP", getFailingAuth()[i]["IP"]);
    record.set("EnterType", getFailingAuth()[i]["EnterType"]);
    record.set("Cause", getFailingAuth()[i]["Cause"]);
    record.set("CurrentDevice", getFailingAuth()[i]["CurrentDevice"]);
    record.set("Trusted", getFailingAuth()[i]["Trusted"]);
    record.set("Date", getFailingAuth()[i]["Date"]);
    failingAuth.add(record);
}

//Демо данные
function getActivityDevices() {
        return [
            {
                "@Id": 10011608,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 2,
                DeviceKey: "070ee870-d9a7-4438-77a1-cabc52089fed",
                DeviceName: "R54-KOVALEV",
                RealDeviceName: "R54-KOVALEV",
                Browser: "Chrome 80.0.3987",
                City: "Новосибирск",
                DeviceModel: null,
                IP: "10.54.14.102",
                EnterType: 1,
                Cause: null,
                CurrentDevice: true,
                Blocked: null,
                Trusted: false,
                Date: new Date("Wed Apr 22 2020 10:03:07 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 10002074,
                DeviceId: null,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 0,
                UserId: 5894891,
                Status: 1,
                DeviceKey: "2798cc2d-2e09-fd60-fe41-0cafbe86a666",
                DeviceName: "R78-MELNIKOVA",
                RealDeviceName: "R78-MELNIKOVA",
                Browser: "Yandex Browser 20.3.2",
                City: "Санкт-Петербург",
                DeviceModel: null,
                IP: "10.78.14.166",
                EnterType: 0,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Apr 21 2020 22:43:41 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 10009311,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "3d6f3e05-e2a9-43de-b978-a9e4419c256c",
                DeviceName: "Windows 10",
                RealDeviceName: "Windows 10",
                Browser: "Chrome 81.0.4044",
                City: "Рыбинск",
                DeviceModel: null,
                IP: "10.176.129.181",
                EnterType: 0,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Apr 21 2020 21:59:04 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9991994,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: false,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "e3f24bc5-ccee-e752-828d-de207ea8d010",
                DeviceName: "USD-KRASNOGOROV",
                RealDeviceName: "USD-KRASNOGOROV",
                Browser: "Chrome 80.0.3987",
                City: "Ярославль",
                DeviceModel: null,
                IP: "10.76.175.6",
                EnterType: 0,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Apr 21 2020 20:37:23 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9922217,
                DeviceId: null,
                UserAgent: '',
                IsPlugin: false,
                DeviceType: 3,
                UserId: 5894891,
                Status: 1,
                DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
                DeviceName: "USD-ANDRONOV1",
                RealDeviceName: "USD-ANDRONOV1",
                Browser: "Chrome 80.0.3987",
                City: "Ярославль",
                DeviceModel: null,
                IP: "10.76.174.184",
                EnterType: 3,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Apr 21 2020 18:43:03 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9919504,
                DeviceId: null,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 2,
                UserId: 5894891,
                Status: 1,
                DeviceKey: "72a669a1-ed9c-648c-ccc4-70614bd1d624",
                DeviceName: "R44-LUKASHENKO",
                RealDeviceName: "R44-LUKASHENKO",
                Browser: "Chrome 81.0.4044",
                City: "Кострома",
                DeviceModel: null,
                IP: "10.44.14.60",
                EnterType: 2,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Apr 21 2020 18:02:45 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9996779,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "d0f218bf-0074-4984-b842-8c4be4c19129",
                DeviceName: "Windows 10",
                RealDeviceName: "Windows 10",
                Browser: "Chrome 81.0.4044",
                City: "Рыбинск",
                DeviceModel: null,
                IP: "10.176.133.127",
                EnterType: 1,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Wed Apr 15 2020 18:24:38 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9968135,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "d7e586b7-2ba5-0f93-c9b2-59878a8b5b9e",
                DeviceName: "R78-GUSEV",
                RealDeviceName: "R78-GUSEV",
                Browser: "Chrome 80.0.3987",
                City: "Рыбинск",
                DeviceModel: null,
                IP: "10.176.128.22",
                EnterType: 1,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Thu Mar 19 2020 16:38:45 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9996242,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: false,
                DeviceType: 0,
                Status: 1,
                DeviceKey: "e251d209-b65e-3b7f-8860-01940c62bbda",
                DeviceName: "DESKTOP-6B09GDL",
                RealDeviceName: "DESKTOP-6B09GDL",
                Browser: "Chrome 80.0.3987",
                City: "Ярославль",
                DeviceModel: null,
                IP: "10.76.146.37",
                EnterType: 1,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Wed Mar 18 2020 20:12:45 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9924338,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "b9a1e8c0-dbe2-2971-38d7-98e74e556ddc",
                DeviceName: "USD-DRUZHINEC1",
                RealDeviceName: "USD-DRUZHINEC1",
                Browser: "Chrome 80.0.3987",
                City: "Ярославль",
                DeviceModel: null,
                IP: "10.76.180.119",
                EnterType: 1,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Mon Mar 16 2020 19:12:52 GMT+0700 (Новосибирск, стандартное время)")
            },
            {
                "@Id": 9987609,
                DeviceId: null,
                UserId: 5894891,
                UserAgent: '',
                IsPlugin: true,
                DeviceType: 1,
                Status: 1,
                DeviceKey: "2a832238-7b85-452c-b53e-5df30c70b005",
                DeviceName: "Mac OS X 10.14.6",
                RealDeviceName: "Mac OS X 10.14.6",
                Browser: "Chrome 78.0.3904",
                City: "Санкт-Петербург",
                DeviceModel: null,
                IP: "10.78.14.210",
                EnterType: 2,
                Cause: null,
                CurrentDevice: false,
                Blocked: null,
                Trusted: false,
                Date: new Date("Tue Feb 25 2020 18:12:00 GMT+0700 (Новосибирск, стандартное время)")
            }
        ];
}

function getFailingAuth() {
    return [
        {
            "@Id": 377398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: 'Chrome 78.0.3904',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: "Chrome 80.0.3987",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 308977398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRO123NOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 98377398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 3778908880398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 370007398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 37700398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 30890877398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 377389088,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 3773980,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3707398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 390398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37778398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 364398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 351398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3773981444,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37777773398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 377412398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37755398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37712398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 377167398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3771598,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3167398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3117398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 35537398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 31198,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37888,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 378388,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 377398667,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37667398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3715447398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date( "Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37327398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37744398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 0,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 37717398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37127398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 377555398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 377331298,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 37667398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3775398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },{
            "@Id": 3774398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 3773398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 3772398,
            DeviceId: 9922217,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "5d4358e9-9fc6-05c0-91d4-c8c44055880b",
            DeviceName: "USD-ANDRONOV1",
            RealDeviceName: null,
            Browser: null,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.184",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Apr 16 2020 14:36:03 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 374420,
            DeviceId: null,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "e89b4c28-5e7e-4cb1-bd68-f035a69ad8f1",
            DeviceName: "Устройство не определено",
            RealDeviceName: null,
            Browser: "Chrome 80.0.3987",
            City: "Ярославль",
            DeviceModel: null,
            IP: "10.176.134.184",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: null,
            Date: new Date("Tue Mar 31 2020 14:03:19 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 372834,
            DeviceId: 10004977,
            UserId: null,
            Status: null,
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 1,
            DeviceKey: "f4c6eb37-fabe-1d39-49ac-0b8e28430b70",
            DeviceName: "R78-EGOROV",
            RealDeviceName: null,
            Browser: "Chrome 80.0.3987",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.78.14.194",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Mar 19 2020 19:30:43 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 372701,
            DeviceId: 9996779,
            UserId: null,
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 3,
            Status: null,
            DeviceKey: "d0f218bf-0074-4984-b842-8c4be4c19129",
            DeviceName: "Windows 10",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.176.128.197",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Mar 19 2020 13:32:19 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 369899,
            DeviceId: 9989704,
            UserId: null,
            Status: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 2,
            DeviceKey: "ac1fcad0-a2da-3f45-1903-6c331f79fa98",
            DeviceName: "USD-PROG205",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.174.135",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Wed Mar 04 2020 20:56:01 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id:" 361021,
            DeviceId: 9991994,
            UserId: null,
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 1,
            Status: null,
            DeviceKey: "e3f24bc5-ccee-e752-828d-de207ea8d010",
            DeviceName: "USD-KRASNOGOROV",
            RealDeviceName: null,
            Browser: "Chrome 80.0.3987",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.76.175.6",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Tue Jan 28 2020 18:52:54 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 361020,
            DeviceId: 9991994,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            UserId: null,
            Status: null,
            DeviceKey: "e3f24bc5-ccee-e752-828d-de207ea8d010",
            DeviceName: "USD-KRASNOGOROV",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Рыбинск",
            DeviceModel: null,
            IP: "10.76.175.6",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Tue Jan 28 2020 18:52:39 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 360713,
            DeviceId: 9926523,
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 2,
            UserId: null,
            Status: null,
            DeviceKey: "eb77adc6-91c2-f4c4-bb4a-8e333d4cfd26",
            DeviceName: "USD-ELIFANTEV",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Рыбинск",
            DeviceModel: null,
            IP: "10.76.174.218",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Mon Jan 27 2020 23:01:09 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 359646,
            DeviceId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            UserId: null,
            Status: null,
            DeviceKey: "0a2d4b6f-9f8b-03d1-45a9-35ee8c8340c3",
            DeviceName: "Устройство не определено",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Рыбинск",
            DeviceModel: null,
            IP: "10.16.14.46",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: null,
            Date: new Date("Thu Jan 23 2020 14:34:56 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 359645,
            DeviceId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            UserId: null,
            Status: null,
            DeviceKey: "0a2d4b6f-9f8b-03d1-45a9-35ee8c8340c3",
            DeviceName: "Устройство не определено",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.16.14.46",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: null,
            Date: new Date("Thu Jan 23 2020 14:34:47 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 341122,
            DeviceId: 9949202,
            UserId: null,
            Status: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            DeviceKey: "c790a921-9723-4f7d-8f18-a7e9221e3928",
            DeviceName: "iPad",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Новосибирск",
            DeviceModel: null,
            IP: "10.44.8.133",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Fri Oct 25 2019 21:52:59 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 339055,
            DeviceId: 9919504,
            UserId: null,
            Status: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            DeviceKey: "72a669a1-ed9c-648c-ccc4-70614bd1d624",
            DeviceName: "R44-LUKASHENKO",
            RealDeviceName: null,
            Browser: "Yandex Browser 20.3.2",
            City: "Ярославль",
            DeviceModel: null,
            IP: "10.44.14.60",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Mon Oct 21 2019 13:51:00 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 332338,
            DeviceId: 9921773,
            UserId: null,
            Status: null,
            DeviceKey: "0915033e-ba8d-7d14-8a3d-b9e15915ebf8",
            DeviceName: "R78-EGOROV",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 3,
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.78.14.194",
            EnterType: 3,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Mon Sep 23 2019 18:28:16 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 330170,
            DeviceId: 9923316,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 0,
            Status: null,
            DeviceKey: "15077af4-a5fe-83c6-3848-527127ac091d",
            DeviceName: "R78-GUSEV",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Рыбинск",
            DeviceModel: null,
            IP: "10.78.14.140",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Wed Sep 11 2019 15:03:58 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 329921,
            DeviceId: 9923316,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 0,
            Status: null,
            DeviceKey: "15077af4-a5fe-83c6-3848-527127ac091d",
            DeviceName: "R78-GUSEV",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "",
            DeviceModel: null,
            IP: "10.78.14.140",
            EnterType: 2,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Tue Sep 10 2019 18:52:33 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 329920,
            DeviceId: 9923316,
            UserId: null,
            UserAgent: '',
            IsPlugin: false,
            DeviceType: 1,
            Status: null,
            DeviceKey: "15077af4-a5fe-83c6-3848-527127ac091d",
            DeviceName: "R78-GUSEV",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.78.14.140",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Tue Sep 10 2019 18:52:29 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 326792,
            DeviceId: 9921773,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "0915033e-ba8d-7d14-8a3d-b9e15915ebf8",
            DeviceName: "R78-EGOROV",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.78.14.194",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Thu Sep 05 2019 16:54:25 GMT+0700 (Новосибирск, стандартное время)")
        },
        {
            "@Id": 323124,
            DeviceId: 9919504,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "72a669a1-ed9c-648c-ccc4-70614bd1d624",
            DeviceName: "R44-LUKASHENKO",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.44.14.60",
            EnterType: 1,
            Cause: "Ввод неправильного пароля",
            CurrentDevice: null,
            Blocked: null,
            Trusted: false,
            Date: new Date("Tue Sep 03 2019 16:02:17 GMT+0700 (Новосибирск, стандартное время)")
        }
    ];
}

function getLockedDevices() {
    return [
        {
            "@Id": 9987779,
            DeviceId: null,
            UserId: 58964891,
            Status: 0,
            DeviceKey: "2a832238-7b85-452c-b53e-5df30c70b005",
            DeviceName: "Mac OS X 10.14.6",
            RealDeviceName: "Mac OS X 10.14.6",
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceType: 0,
            IsPlugin: true,
            DeviceModel: null,
            IP: "10.78.14.210",
            EnterType: 1,
            Cause: null,
            CurrentDevice: false,
            Blocked: true,
            Trusted: false,
            Date: new Date("Tue Feb 25 2020 18:12:00 GMT+0700 (Новосибирск, стандартное время)")
        }, {
            "@Id": 3231254,
            DeviceId: 99119504,
            UserId: null,
            UserAgent: '',
            IsPlugin: true,
            DeviceType: 1,
            Status: null,
            DeviceKey: "72a669a1-ed9c-648c-ccc4-70614bd1d624",
            DeviceName: "R44-LUKASHENKO",
            RealDeviceName: null,
            Browser: "Chrome 78.0.3904",
            City: "Санкт-Петербург",
            DeviceModel: null,
            IP: "10.44.14.60",
            EnterType: 1,
            Cause: null,
            CurrentDevice: null,
            Blocked: true,
            Trusted: false,
            Date: new Date("Tue Sep 03 2019 16:02:17 GMT+0700 (Новосибирск, стандартное время)")
        }
    ];
}

export {
    mainRecord,
    failingAuth
};
