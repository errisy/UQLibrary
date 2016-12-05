/// <reference path="../lib/ngstd.ts" />

interface IMainDirectiveScope extends ng.IScope {

}

class MainController {
    static $inject: ngstd.Injectables[] = ['$scope', '$location', '$mdMedia', '$http', '$timeout'];
    constructor(public $scope: ng.IScope,
        public $location: ng.ILocationService,
        public $mdMedia: angular.material.IMedia,
        public $http: ng.IHttpService,
        public $timeout: ng.ITimeoutService) {

        //initialize proxy and client for data service
        this.proxy = new HttpProxy(this.$http, 'proxy.cgi.js');
        this.proxy.useProxy = true; 
        this.client = new LibraryDataClient(this.proxy);
    }
    /**
     * wait to allow animation to complete 
     * @param value
     */
    public async wait(value: number) {
        return new Promise<void>(resolve => {
            this.$timeout(() => resolve(), value);
        })
    }
    /**mode that determines what content to display*/
    public displayMode: string;
    public get SelectedLibrary(): LibraryTypes.ILibraryHoursByDay {
        let id = Number.parseInt(this.displayMode.toString());
        if (typeof id != 'number') return;
        let found = this.libraries.find(lib => lib.lid == id);
        return found;
    }
    public isLoading: boolean = false;
    /**the proxy instance */
    public proxy: HttpProxy;
    /**the data service instance, used with proxy here to obtain data */
    public client: LibraryDataClient;
    /**the summarized library dataset */
    public libraries: LibraryTypes.ILibraryHoursByDay[];
    /**the summarized computer availability dataset */
    public computers: LibraryTypes.IBuildingComputerAvailability[];
    /**
     * load data when angular is loaded, called by ng-init
     */
    public async onLoad() {
        this.isLoading = true;
        let data = await this.client.getData();
        this.libraries = data.libraries;
        this.computers = data.computers;
        this.isLoading = false;
        this.$scope.$apply();
        this.parsePath();
    }
    /**object for test route path */
    public routeTests: { [key: string]: RegExp } = { today: /^\/today/ig, week: /^\/week/ig, lib: /^\/\d+/ig, new: /^\/new/ig };
    /**parse the path and set displayMode to navigate to proper view */
    public parsePath = () => {
        let path = this.$location.path();
        let route: string;
        //test each route regex
        for (let key in this.routeTests) {
            this.routeTests[key].lastIndex = undefined;
            if (this.routeTests[key].test(path)) {
                route = key;
                break;
            }
        }
        if (route) {
            if (route == 'lib') {//for lib id
                this.displayMode = /\/(\d+)/ig.exec(path)[1];
            }
            else {//for today week new
                this.displayMode = route;
            }
        } else {//by default, set today
            this.displayMode = 'today';
        }
    }
    public templateSelector = async (key: any, templates: ngstd.DataTemplate[]) => {
        let found: ngstd.DataTemplate;
        switch (typeof key) {
            case 'string':
                if (/\d+/g.test(key)) { //for lib id, get detail template
                    found = templates.find(item => item.key == 'detail');
                }
                else { //for other, find by key
                    found = templates.find(item => item.key == key);
                }
                break;
            case 'number'://for lib id, get detail template
                found = templates.find(item => item.key == 'detail');
                break;
        }
        if (found) {
            this.$location.path('\/' + key);
            this.isLoading = true;
            await this.wait(200); //leave a bit time for the button to complete its ripple effect;
            this.isLoading = false;
            return found.template;
        }
        else return '';
    }
}
class MainDirective extends ngstd.AngularDirective<IMainDirectiveScope> {
    static selector = 'main';
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker( '/view/main.view.html');
        this.controller = MainController;
        this.controllerAs = 'ctrl';
    }
}