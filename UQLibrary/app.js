var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class LibDataFilters {
}
/**filter array fields with keyword*/
LibDataFilters.fieldsFilter = (data, fields, keyword) => {
    if (!data || !Array.isArray(data))
        return [];
    if (!fields || !Array.isArray(fields))
        return data;
    if (!keyword || typeof keyword != 'string' || keyword == '')
        return data;
    keyword = keyword.toLowerCase();
    return data.filter(item => fields.some(field => item[field] && typeof item[field] == 'string' && item[field].toLowerCase().indexOf(keyword) > -1));
};
/**test if an object has any fields*/
LibDataFilters.hasKeys = (data) => {
    let count = 0;
    if (data && typeof data == 'object') {
        for (let key in data) {
            count += 1;
        }
    }
    return count > 0;
};
class LibraryDataClient {
    constructor(service) {
        this.service = service;
    }
    /**
     * create a library, do not use with proxy !!!
     */
    createLibrary(library) {
        return __awaiter(this, void 0, void 0, function* () {
            return Boolean((yield this.service.post('createlib.cgi.js', JSON.stringify(library))).data);
        });
    }
    /**
     * to library daily information API, use with proxy
     */
    library_hours_day() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/day');
            return arg.data;
        });
    }
    /**
     * to library weekly hours API, use with proxy
     */
    library_hours_week() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/week');
            return arg.data;
        });
    }
    /**
     * to computer availability API, use with proxy
     */
    computer_availability() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/computer_availability');
            let data = arg.data;
            return data;
        });
    }
    /**
     * Load all the data in a concurrent manner
     * since all three sets of data are useful and relative, they are loaded in a concurrent manner to reduce waiting time.
     * relative information are summerized and added to data for display in angular
     */
    getData() {
        return new Promise((resolve, reject) => {
            let result = { libraries: [], computers: [] };
            //try obtain all data at the same time;
            let count = 3;
            let librariesByDay;
            let librariesByWeek;
            let computers;
            function calculate() {
                //mapping for library
                //summarize computer data: 
                //add totalAvailable (total available number of computers) 
                //add numberOfComputers
                //add numberOfRooms
                //add roomAvailabilities for ng-repeat display
                computers.forEach(item => {
                    if (LibraryDataClient.ComputerLibraryMappings[item.library])
                        item.mappedName = LibraryDataClient.ComputerLibraryMappings[item.library];
                    let total = 0;
                    let available = 0;
                    let numberOfRooms = 0;
                    item.roomAvailabilities = [];
                    for (let key in item.availability) {
                        let room = item.availability[key];
                        let availableInRoom = room.Available;
                        let occupiedInRoom = room.Occupied;
                        if (NumberUtil.isValidInteger(availableInRoom) && NumberUtil.isValidInteger(occupiedInRoom)) {
                            total += (availableInRoom + occupiedInRoom);
                            available += availableInRoom;
                        }
                        numberOfRooms += 1;
                        room.Name = key;
                        room.Percentage = (room.Available * 100) / (room.Available + room.Occupied);
                        item.roomAvailabilities.push(room);
                    }
                    item.totalAvailable = available;
                    item.numberOfComputers = total;
                    item.availablePercentage = available / total * 100;
                    item.numberOfRooms = numberOfRooms;
                });
                //summarize library data;
                //add weekday information to day information
                librariesByWeek.forEach(item => {
                    item.departments.forEach(department => {
                        department.weekHoursInfo = [];
                        for (let key in department.weeks[0]) {
                            let day = department.weeks[0][key];
                            let weekday = day;
                            weekday.weekday = key;
                            department.weekHoursInfo.push(weekday);
                        }
                    });
                });
                let today = moment().format("YYYY-MM-DD");
                librariesByDay.forEach(lib => {
                    if (lib.desc) {
                        try {
                            //try to combine the html contents in the description
                            let j = jQuery(lib.desc.unescapeHTML());
                            lib.desc = j.contents().text().replace(/\s+/ig, ' ');
                        }
                        catch (ex) {
                        }
                    }
                    //work out if the library is open at the moment.
                    lib.numberOfOpenDepartments = lib.departments.filter(department => department.times.currently_open).length;
                    //check computer informations for library
                    let found = computers.find(item => item.mappedName == lib.name);
                    if (found) {
                        lib.isComputersAvailable = true;
                        lib.totalAvailable = found.totalAvailable;
                        lib.numberOfComputers = found.numberOfComputers;
                        lib.availablePercentage = found.availablePercentage;
                        lib.numberOfComputerRooms = found.numberOfRooms;
                        lib.rooms = found.roomAvailabilities;
                    }
                    //sort department with open status
                    lib.departments.sort((a, b) => a.times.currently_open ? (b.times.currently_open ? 0 : 1) : (b.times.currently_open ? -1 : 0));
                    let week = librariesByWeek.find(value => value.lid == lib.lid);
                    let openHour = '24:00:00';
                    let closeHour = '00:00:00';
                    if (week) {
                        lib.departmentsWeek = week.departments;
                        lib.departments.forEach(department => {
                            let match = week.departments.find(value => value.name == department.name);
                            if (match) {
                                match.weeks.forEach(week => {
                                    for (let key in week) {
                                        let day = week[key];
                                        if (day.date == today) {
                                            if (!/closed/ig.test(day.rendered)) {
                                                openHour = (day.open < openHour) ? day.open : openHour;
                                                closeHour = (day.close > closeHour) ? day.close : closeHour;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                    lib.openHour = openHour;
                    lib.closeHour = closeHour;
                    if (lib.openHour == '24:00:00' && lib.closeHour == '00:00:00') {
                        lib.renderedHours = 'Closed Today';
                    }
                    else if (lib.openHour == '00:00:00' && lib.closeHour == '24:00:00') {
                        lib.renderedHours = 'Open 24 Hours Today';
                    }
                    else {
                        lib.renderedHours = 'Open {0} to {1} Today'.format(lib.openHour, lib.closeHour);
                    }
                });
                //sort libraries by open or not
                librariesByDay.sort((a, b) => Math.sign(b.numberOfOpenDepartments - a.numberOfOpenDepartments));
                result.computers = computers;
                result.libraries = librariesByDay;
                resolve(result);
            }
            function done() {
                count -= 1;
                if (count == 0)
                    calculate();
            }
            //send concurrent requests;
            this.library_hours_day().then(value => { librariesByDay = value.locations; done(); }, reason => reject(reason));
            this.library_hours_week().then(value => { librariesByWeek = value.locations; done(); }, reason => reject(reason));
            this.computer_availability().then(value => { computers = value; done(); }, reason => reject(reason));
        });
    }
}
LibraryDataClient.ComputerLibraryMappings = {
    'Architecture &amp; Music Library': 'Architecture & Music Library', 'Biological Sciences Library': 'Biological Sciences Library', 'D.H. Engineering &amp; Sciences Library': 'Dorothy Hill Engineering and Sciences Library', 'Duhig Building': 'Duhig Tower', 'Gatton Campus Library': 'Gatton Library', 'Graduate Economics &amp; Business Library': 'Graduate Economics and Business Library', 'Herston Health Sciences Library': 'Herston Health Sciences Library', 'Mater Hospital Library': 'Mater McAuley Library', 'PACE Health Sciences Library': 'PACE Health Sciences Library', 'Social Sciences &amp; Humanities Library': 'Social Sciences & Humanities Library',
};
var ngstd;
(function (ngstd) {
    var debugging = false;
    function AngluarJSTemplateUrlPacker(url) {
        return url;
    }
    ngstd.AngluarJSTemplateUrlPacker = AngluarJSTemplateUrlPacker;
    /**
     * the base class for types that can be used for model, where name of the type is important for selecting the template.
     */
    class NamedObject {
        get TypeName() {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((this).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        }
        ;
        clone(value) {
            for (var attr in value) {
                //console.log(this.TypeName + ".hasOwnProperty" + attr + " :" + this.hasOwnProperty(attr));
                if (attr != "TypeName" && value.hasOwnProperty(attr))
                    this[attr] = value[attr];
            }
        }
    }
    ngstd.NamedObject = NamedObject;
    /**
     * An implementation of Angular Module. A few important setting features are provided as standard functions.
     */
    class AngularModule {
        constructor(name, modules, configFn) {
            /**
             * enables html5 mode for using base<path> and location service;
             */
            this.LocationHtml5Mode = () => {
                this.app.config(['$locationProvider',
                    ($locationProvider) => {
                        $locationProvider.html5Mode(true);
                    }
                ]);
            };
            /**
             * Include Content Directive in this module;
             */
            this.includeContentDirective = () => {
                this.addInjectedDirective('content', () => new ContentDirective());
            };
            if (!modules)
                modules = [];
            this.app = angular.module(name, modules, configFn);
        }
        config(configFn) {
            this.app.config(configFn);
        }
        trustUrl(pattern) {
            this.app.config(function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(pattern);
            });
        }
        addController(controllerType) {
            //check if valid selector is provided.
            if (!controllerType.selector || typeof controllerType.selector != 'string') {
                console.error('Missing static selector field in type:', controllerType);
                throw 'Error: Missing static selector field in the AngularController type!';
            }
            this.app.controller(controllerType.selector, controllerType);
        }
        addControllerAsSelector(selector, controller) {
            this.app.controller(selector, controller);
        }
        /**
         * Add a directive to the Angular Module;
         * @param name is the name of the directive
         * @param factory is the factory function such as ()=>new Directive(). Directive name won't work.
         */
        addInjectedDirective(name, factory) {
            this.app.directive(name, factory);
        }
        addDirective(directiveType) {
            //check if valid selector is provided.
            if (!directiveType.selector || typeof directiveType.selector != 'string') {
                console.error('Missing static selector field in type:', directiveType);
                throw 'Error: Missing static selector field in the AngularDirective type!';
            }
            this.app.directive(directiveType.selector, () => new directiveType());
        }
        addStdDirective(name, templateUrl, Controller) {
            this.app.directive(name, () => {
                return {
                    restrict: 'E',
                    templateUrl: templateUrl,
                    controller: Controller,
                    scope: {
                        app: '=',
                        data: '=',
                        model: '=',
                        parent: '='
                    },
                    controllerAs: 'controller'
                };
            });
        }
        addFactory(name, factory) {
            this.app.factory(name, factory);
        }
        addService(name, service) {
            this.app.service(name, service);
        }
        /**
         * include all member functions as filters into the current angular module;
         * @param filterObject a class with all filters defined as static methods;
         */
        includeFilters(filterObject) {
            for (let key in filterObject) {
                this.app.filter(key, () => filterObject[key]);
            }
        }
        /**
         * Provide access to the ng.IModule;
         */
        get Base() {
            return this.app;
        }
        includeLoaderController(name) {
            this.addControllerAsSelector(name ? name : 'loader', LoaderController);
        }
    }
    ngstd.AngularModule = AngularModule;
    class AngularController {
    }
    ngstd.AngularController = AngularController;
    /**
     * The controller to load app to avoid displaying uncompiled content.
     */
    class LoaderController extends AngularController {
        constructor($element) {
            super();
            this.$element = $element;
            //remove the loader class tag
            $element.removeClass('loader');
            //remove the loader-hide class tags;
            $element.find('.loader-hide').removeClass('loader-hide');
            //remove the loader-content elements:
            $element.find('.loader-content').remove();
        }
    }
    LoaderController.$inject = ['$element'];
    LoaderController.selector = 'loader';
    ngstd.LoaderController = LoaderController;
    class DirectiveRestrict {
    }
    DirectiveRestrict.E = 'E';
    DirectiveRestrict.A = 'A';
    DirectiveRestrict.AE = 'AE';
    DirectiveRestrict.C = 'C';
    ngstd.DirectiveRestrict = DirectiveRestrict;
    class BindingRestrict {
    }
    BindingRestrict.TwoWay = '=';
    BindingRestrict.In = '@';
    BindingRestrict.Callback = '&';
    BindingRestrict.TwoWayOptional = '=?';
    ngstd.BindingRestrict = BindingRestrict;
    class AngularDirective {
        constructor() {
            this.scope = {};
            return this;
        }
    }
    ngstd.AngularDirective = AngularDirective;
    /**
     * DataTemplate definition for Conent control.
     */
    class DataTemplate {
    }
    ngstd.DataTemplate = DataTemplate;
    class DirectiveViewController {
        constructor($scope, $element, $compile) {
            this.$scope = $scope;
            this.$element = $element;
            this.$compile = $compile;
        }
        get View() {
            return this._View;
        }
        set View(value) {
            this._View = value;
            //initialize the view;
            if (!value.selector || typeof value.selector != 'string') {
                console.error('Missing static selector field in the Angular Directive Type: ', value);
            }
            else {
                if (this.CurrentChildScope)
                    this.CurrentChildScope.$destroy();
                this.$element.children().remove();
                //try compile the 
                this.CurrentChildScope = this.$scope.$new();
                this.CurrentElement = this.$compile('<{0}></{0}>'.format(value.selector))(this.CurrentChildScope);
                this.$element.append(this.CurrentElement);
            }
        }
    }
    DirectiveViewController.$inject = ['$scope', '$element', '$compile'];
    ngstd.DirectiveViewController = DirectiveViewController;
    class DirectiveViewDirecive extends AngularDirective {
        constructor() {
            super();
            this.restrict = 'AE';
            this.scope.ref = '=?';
            this.controller = DirectiveViewController;
            this.controllerAs = 'ctrl';
        }
    }
    ngstd.DirectiveViewDirecive = DirectiveViewDirecive;
    /**
     * Content control controller. It accepts template elements to generate views for data.
     * It will invoke the selector to evaluate what view to use.
     * We suggest building a TabControl based on Content control.
     * Content control use $compile method to build element within subscope. subscope will be destroyed on the removal of corresponding element.
     */
    class ContentController {
        constructor($compile, $element, $http, $scope) {
            this.$compile = $compile;
            this.$element = $element;
            this.$http = $http;
            this.$scope = $scope;
            this.templates = [];
            //this section will collect each of the view template from the inner of this model and they can be applied to each of the software.
            $element.children('template').each((index, elem) => {
                var $elem = $(elem);
                var template = new DataTemplate();
                template.key = $elem.attr('key');
                template.path = $elem.attr('path');
                template.type = $elem.attr('type');
                template.url = $elem.attr('url');
                template.jQuery = $elem;
                if (template.url) {
                    //the embedded template is used for loading process;
                    template.template = $elem.html();
                    $http.get(template.url)
                        .success((data) => {
                        template.template = data;
                        //we must check if the return value can affect the view of the content control.
                        if ($scope.selector) {
                            $scope.selector($scope.data, this.templates).then((result => {
                                if ($scope.view != result) {
                                    //if view is affected, view must be updated.
                                    $scope.view = result;
                                    $scope.$digest();
                                }
                            }));
                        }
                    });
                }
                else {
                    template.template = $elem.html();
                }
                this.templates.push(template);
            });
            $element.children().remove();
            $scope.$watch('data', (newValue, oldValue) => {
                if ($scope.selector) {
                    $scope.selector(newValue, this.templates).then((template => {
                        if (typeof template == 'string') {
                            $scope.view = template;
                            $scope.$apply();
                        }
                    }));
                }
                else {
                    console.warn('Content View Warning: selector is undefined.\n' +
                        'Please provide a valid selector function:\n' +
                        'selector: (data: any, templates: DataTemplate[]) => string');
                }
            });
            //watch the view (string template) and compile it when changed.
            $scope.$watch('view', (newValue, oldValue) => {
                //destroy the existing element;
                if (this.childscope)
                    this.childscope.$destroy();
                $element.children().remove();
                //create a new child scope.
                this.childscope = $scope.$parent.$new(); //use $parent to create childscope to access parent scope data
                $element.append($compile(newValue)(this.childscope));
            });
        }
    }
    ContentController.$inject = ['$compile', '$element', '$http', '$scope'];
    ngstd.ContentController = ContentController;
    /**
 * Control directive.
 */
    class ContentDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.template = '';
            this.scope.data = ngstd.BindingRestrict.TwoWay;
            this.scope.view = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.controller = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.app = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.selector = ngstd.BindingRestrict.TwoWayOptional;
            this.controller = ContentController;
        }
    }
    ngstd.ContentDirective = ContentDirective;
})(ngstd || (ngstd = {}));
/// <reference path="../lib/ngstd.ts" />
class DetailController {
    constructor($scope, $mdMedia) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$inject = ['$scope', '$mdMedia'];
    }
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    get parent() {
        return this.$scope.$parent['ctrl'];
    }
    /**
     * called by ng-init, get the selected library
     */
    onLoad() {
        this.library = this.parent.SelectedLibrary;
    }
}
class DetailDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/detail.view.html');
        this.controller = DetailController;
        this.controllerAs = 'ctrl';
        return this;
    }
}
DetailDirective.selector = 'detail';
/// <reference path="../lib/ngstd.ts" />
class MainController {
    constructor($scope, $location, $mdMedia, $http, $timeout) {
        this.$scope = $scope;
        this.$location = $location;
        this.$mdMedia = $mdMedia;
        this.$http = $http;
        this.$timeout = $timeout;
        this.isLoading = false;
        /**object for test route path */
        this.routeTests = { today: /^\/today/ig, week: /^\/week/ig, lib: /^\/\d+/ig, new: /^\/new/ig };
        /**parse the path and set displayMode to navigate to proper view */
        this.parsePath = () => {
            let path = this.$location.path();
            let route;
            //test each route regex
            for (let key in this.routeTests) {
                this.routeTests[key].lastIndex = undefined;
                if (this.routeTests[key].test(path)) {
                    route = key;
                    break;
                }
            }
            if (route) {
                if (route == 'lib') {
                    this.displayMode = /\/(\d+)/ig.exec(path)[1];
                }
                else {
                    this.displayMode = route;
                }
            }
            else {
                this.displayMode = 'today';
            }
        };
        this.templateSelector = (key, templates) => __awaiter(this, void 0, void 0, function* () {
            let found;
            switch (typeof key) {
                case 'string':
                    if (/\d+/g.test(key)) {
                        found = templates.find(item => item.key == 'detail');
                    }
                    else {
                        found = templates.find(item => item.key == key);
                    }
                    break;
                case 'number':
                    found = templates.find(item => item.key == 'detail');
                    break;
            }
            if (found) {
                this.$location.path('\/' + key);
                this.isLoading = true;
                yield this.wait(200); //leave a bit time for the button to complete its ripple effect;
                this.isLoading = false;
                return found.template;
            }
            else
                return '';
        });
        //initialize proxy and client for data service
        this.proxy = new HttpProxy(this.$http, 'proxy.cgi.js');
        this.proxy.useProxy = true;
        this.client = new LibraryDataClient(this.proxy);
    }
    /**
     * wait to allow animation to complete
     * @param value
     */
    wait(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.$timeout(() => resolve(), value);
            });
        });
    }
    get SelectedLibrary() {
        let id = Number.parseInt(this.displayMode.toString());
        if (typeof id != 'number')
            return;
        let found = this.libraries.find(lib => lib.lid == id);
        return found;
    }
    /**
     * load data when angular is loaded, called by ng-init
     */
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isLoading = true;
            let data = yield this.client.getData();
            this.libraries = data.libraries;
            this.computers = data.computers;
            this.isLoading = false;
            this.$scope.$apply();
            this.parsePath();
        });
    }
}
MainController.$inject = ['$scope', '$location', '$mdMedia', '$http', '$timeout'];
class MainDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/main.view.html');
        this.controller = MainController;
        this.controllerAs = 'ctrl';
    }
}
MainDirective.selector = 'main';
class NewLibController {
    constructor($http, $scope, $mdMedia) {
        this.$http = $http;
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$inject = ['$http', '$scope', '$mdMedia'];
        /**to disable save button when it is submitting data */
        this.SaveDisabled = false;
        this.client = new LibraryDataClient($http);
    }
    /**
     * called by ng-init
     */
    onLoaded() {
        this.Library = {};
    }
    /**
     * triggered by Save button
     * check errors and submit
     */
    Save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.SaveDisabled)
                return;
            if (LibDataFilters.hasKeys(this.$scope.libraryForm.$error)) {
                this.status = 'Errors found!';
                return;
            }
            this.status = 'Creating new Library...';
            this.SaveDisabled = true;
            try {
                this.status = (yield this.client.createLibrary(this.Library)) ? 'Library Successfully Created!' : 'Failed.';
            }
            catch (ex) {
                console.error('Error while creating library: ', ex);
                this.status = 'Error while creating library.';
            }
            this.SaveDisabled = false;
            //apply should be called after async call.
            this.$scope.$apply();
        });
    }
    /**
     * triggered by cancel button, navigate to library list (set displayMode = today)
     */
    Cancel() {
        this.SaveDisabled = true;
        let main = this.$scope.$parent['ctrl'];
        main.displayMode = 'today';
    }
}
class NewLibDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/newlib.view.html');
        this.controller = NewLibController;
        this.controllerAs = 'ctrl';
        return this;
    }
}
NewLibDirective.selector = 'newlib';
class TodayController {
    constructor($scope) {
        this.$scope = $scope;
        /**for presenting weekday */
        this.Weekday = Date.now();
    }
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    get parent() {
        return this.$scope.$parent['ctrl'];
    }
    setMode(mode) {
        this.parent.displayMode = mode.toString();
    }
}
TodayController.$inject = ['$scope'];
class TodayDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/today.view.html');
        this.controller = TodayController;
        this.controllerAs = 'ctrl';
        return this;
    }
}
TodayDirective.selector = 'today';
/**
 * Class to extend string
 */
class StringExtension extends String {
    format(...args) {
        return this.replace(/{\d+}/g, (char) => {
            var index = Number(char.substr(1, char.length - 2));
            return args[index].toString();
        });
    }
    unescapeHTML() {
        return this.replace(/&(gt|lt|amp|nbsp);/ig, (hit) => {
            switch (hit) {
                case '&gt;': return '>';
                case '&lt;': return '<';
                case '&amp;': return '&';
                case '&nbsp;': return ' ';
            }
        }).replace(/&#(\d+);/ig, (hit, ...args) => {
            return String.fromCharCode(Number(args[0]));
        });
    }
}
//apply the definitions to String prototype
String.prototype.format = StringExtension.prototype.format;
String.prototype.unescapeHTML = StringExtension.prototype.unescapeHTML;
/// <reference path="../lib/ngstd.ts" />
/// <reference path="../lib/string.ts" />
class BackgroundHistogramDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'A';
        this.scope.value = '=?';
        this.scope.foreground = '=?';
        this.scope.background = '=?';
        this.link = (scope, element, attr, ...args) => {
            let render = () => {
                let foreground = '#bFb';
                let background = '#aaa';
                let value = 0;
                if (typeof scope.foreground == 'string')
                    foreground = scope.foreground;
                if (typeof scope.background == 'string')
                    background = scope.background;
                if (typeof scope.value == 'number')
                    value = scope.value;
                element.css('background', 'linear-gradient(to right, {0} 0%, {0} {2}%, {1} {2}%, {1} 100%)'.format(foreground, background, Math.round(value)));
            };
            scope.$watch('value', () => render());
            scope.$watch('foreground', () => render());
            scope.$watch('background', () => render());
        };
    }
}
BackgroundHistogramDirective.selector = 'hisback';
class WeekController {
    constructor($scope, $mdMedia) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$inject = ['$scope', '$mdMedia'];
    }
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    get parent() {
        return this.$scope.$parent['ctrl'];
    }
    setMode(mode) {
        this.parent.displayMode = mode.toString();
    }
}
class WeekDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/week.view.html');
        this.controller = WeekController;
        this.controllerAs = 'ctrl';
        return this;
    }
}
WeekDirective.selector = 'week';
/// <reference path="../lib/backgroundhistogram.ts" />
/// <reference path="../app/main.view.ts" />
/// <reference path="../app/newlib.view.ts" />
/// <reference path="../app/today.view.ts" />
/// <reference path="../app/week.view.ts" />
/// <reference path="../app/detail.view.ts" />
var UQLib;
(function (UQLib) {
    // create the angular module for this app
    let uqlib = new ngstd.AngularModule('uqlib', ['ngMaterial']);
    //theme of ng-material
    uqlib.app.config(function ($mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('indigo', {
            default: '600'
        })
            .accentPalette('teal')
            .warnPalette('red')
            .backgroundPalette('grey');
    });
    uqlib.includeContentDirective();
    //include filters controllers and classes;
    uqlib.includeFilters(LibDataFilters);
    uqlib.addDirective(BackgroundHistogramDirective);
    uqlib.addDirective(NewLibDirective);
    uqlib.addDirective(TodayDirective);
    uqlib.addDirective(WeekDirective);
    uqlib.addDirective(DetailDirective);
    uqlib.addDirective(MainDirective);
    uqlib.includeLoaderController();
})(UQLib || (UQLib = {}));
class NumberUtil {
    static isValidInteger(value) {
        return typeof value == 'number' && Number.isFinite(value) && Number.isInteger(value);
    }
}
/**
 * The proxy class that wrap the $http service to retreive data directly or via node.js proxy.
 */
class HttpProxy {
    constructor($http, proxyLink) {
        this.$http = $http;
        this.proxyLink = proxyLink;
        this.useProxy = false;
    }
    /**
     * get the json data from the link
     * @param link
     */
    get(link, config) {
        if (this.useProxy) {
            return this.getByProxy(link, config);
        }
        else {
            let error;
            try {
                return this.$http.get(link, config);
            }
            catch (ex) {
                console.warn('error when connecting to server, try proxy now.');
                error = true;
            }
            if (error) {
                //try the proxy
                this.useProxy = true; //use proxy next time.
                return this.getByProxy(link, config);
            }
        }
    }
    post(link, data, config) {
        if (this.useProxy) {
            return this.postByProxy(link, data, config);
        }
        else {
            let error;
            try {
                return this.$http.post(link, data, config);
            }
            catch (ex) {
                console.log(ex);
                error = true;
            }
            if (error) {
                //try the proxy
                this.useProxy = true; //use proxy next time.
                return this.postByProxy(link, data, config);
            }
        }
    }
    getByProxy(link, config) {
        let iproxy = {
            data: null,
            link: link,
            method: 'GET',
            config: config
        };
        return this.$http.post(this.proxyLink, iproxy);
    }
    postByProxy(link, data, config) {
        let iproxy = {
            data: data,
            link: link,
            method: 'POST',
            config: config
        };
        return this.$http.post(this.proxyLink, iproxy);
    }
}
//# sourceMappingURL=app.js.map