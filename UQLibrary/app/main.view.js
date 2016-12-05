/// <reference path="../lib/ngstd.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class MainController {
    constructor($http) {
        this.$http = $http;
        this.$inject = ['$http'];
        this.displayMode = 0;
        this.proxy = new HttpProxy(this.$http, 'http://localhost:2016/proxy.cgi.js');
        this.proxy.useProxy = true;
        this.client = new LibraryDataClient(this.proxy);
    }
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.showOpenNow();
        });
    }
    showOpenNow() {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayMode = 1;
            this.HoursByDay = yield this.client.library_hours_day();
        });
    }
    showTodayHours() {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayMode = 2;
            this.HoursByDay = yield this.client.library_hours_day();
        });
    }
    showWeeklyHours() {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayMode = 3;
            this.HoursByWeek = yield this.client.library_hours_week();
        });
    }
    templateSelector(data, templates) {
        if (typeof data == 'string') {
            data = Number.parseInt(data);
        }
        if (typeof data != 'number')
            return '';
        let index = data;
        switch (index) {
            case 1:
                {
                    let found = templates.find(item => item.key == 'open');
                    return found ? found.template : '';
                }
            case 2:
                {
                    let found = templates.find(item => item.key == 'day');
                    return found ? found.template : '';
                }
        }
    }
    loadHours() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    showAvailableComputers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayMode = 4;
            this.ComputerAvailabilities = yield this.client.computer_availability();
            console.log('ComputerAvailabilities:', this.ComputerAvailabilities);
        });
    }
}
class MainDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = '/view/main.view.html';
        this.controller = MainController;
        this.controllerAs = 'ctrl';
    }
}
MainDirective.selector = 'main';
//# sourceMappingURL=main.view.js.map