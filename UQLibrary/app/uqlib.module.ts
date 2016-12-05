/// <reference path="../lib/backgroundhistogram.ts" />
/// <reference path="../app/main.view.ts" />
/// <reference path="../app/newlib.view.ts" />
/// <reference path="../app/today.view.ts" />
/// <reference path="../app/week.view.ts" />
/// <reference path="../app/detail.view.ts" />
module UQLib {
    // create the angular module for this app
    let uqlib = new ngstd.AngularModule('uqlib', ['ngMaterial']);

    //theme of ng-material
    uqlib.app.config(function ($mdThemingProvider: angular.material.IThemingProvider) {
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

}

