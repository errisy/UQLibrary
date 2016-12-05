
module LibraryTypes {

    export interface ILibrariesByDay {
        locations: ILibraryHoursByDay[];
    }
    export interface ILibrariesByWeek {
        locations: ILibraryHoursByWeek[];
    }
    export interface IBuildingComputerAvailability {
        /**The name of the library.*/
        library: string;
        /**The mapped name to library.*/
        mappedName: string;
        /**The building code to be used to call uqlsm map api*/
        buildingCode: string;
        /**The building number if the building is on a UQ campus, otherwise 'null'.*/
        buildingNumber: number;
        /**A map of computer availability in this library. The key is a level (or area) in the building, and the values are the current Available/Occupied counts*/
        availability: IRoomAvailability;
        /**total available number;*/
        totalAvailable: number;
        /**total available number;*/
        numberOfComputers: number;
        /**the percentage of avaliable*/
        availablePercentage: number;
        /**the number of computer rooms*/
        numberOfRooms: number;
        /**room availability*/
        roomAvailabilities: IComputerAvailability[];
    }
    export interface IRoomAvailability {
        [key: string]: IComputerAvailability;
    }
    export interface IComputerAvailability {
        roomCode: string;
        Available: number;
        Occupied: number;
        Percentage: number;
        Name: string;
    }

    export interface ILibrary {
        lid: string;
        name: string;
        abbr: string;
        desc: string;
        campus: string;
        url: string;
        lat: string;
        long: string;
    }

    export interface ILibraryHours {
        /**Library id.*/
        lid: number;
        /**Library name.*/
        name: string;
        /**Entity category: library or department.*/
        category: string;
        /**Day of the week.*/
        day: string;
        /**Library description.*/
        desc: string;
        /**Library url.*/
        url: string;
        /**Library contact info.*/
        contact: string;
        /**Footnotes.*/
        fn: string;
        /**Library latitude.*/
        lat: string;
        /**Library longitude.*/
        long: string;
        /**Library abbreviation*/
        abbr: string;

        //additional fields for easier consumption 
        openHour: string;
        closeHour: string;
        renderedHours: string;
        numberOfOpenDepartments: number;
        renderTodayHours: string;
        isComputersAvailable: boolean;
        /**total available number;*/
        totalAvailable: number;
        /**total available number;*/
        numberOfComputers: number;
        /**the percentage of avaliable*/
        availablePercentage: number;
        numberOfComputerRooms: number;
        rooms: IComputerAvailability[];
    }

    export interface ILibraryHoursByDay extends ILibraryHours {
        /**Library additional notes.*/
        times: ITimes;
        /**Library departments, e.g. AskUs Service Point, Study Area*/
        departments: IDepartmentByDay[];
        /**Library additional notes.*/
        departmentsWeek: IDepartmentByWeek[];

    }
    export interface ILibraryHoursByWeek extends ILibraryHours {
        /**Library additional notes.*/
        weeks: IWeeks;
        /**Library departments, e.g. AskUs Service Point, Study Area*/
        departments: IDepartmentByWeek[];
    }

    export interface ITimes {
        /**Library current opening status , e.g. false, true*/
        currently_open: boolean;
        /**Library status on that day, e.g. open, close*/
        status: string;
        /**Library open and close time, e.g. 8am, 6pm*/
        hours: IOpenTime[];
    }
    export interface IWeeks {
        /**Monday to Sunday*/
        [key: string]: IDayHours;
    }

    export interface IDayHours {
        /**Date e.g. 2016-8-22*/
        date: string;
        /**Department currently opening status and official hours*/
        times: string;
        /**Department open and close time, e.g. 8am - 6pm or 24 Hours*/
        rendered: string;
        /**Department open time, e.g. 08:00:00*/
        open: string;
        /**Department close time, e.g. 18:00:00*/
        close: string;
    }

    export interface IWeekDayHours extends IDayHours {
        /**weekday name, e.g. Monday, Sunday*/
        weekday: string;
    }

    interface IDepartment {
        /**Department id.*/
        lid: number;
        /**Department name.*/
        name: string;
        /**Entity category: library or department.*/
        category: string;
        /**Day of the week.*/
        day: string;
        /**Department description.*/
        desc: string;
        /**Department url.*/
        url: string;
        /**Department contact info.*/
        contact: string;
        /**Footnotes.*/
        fn: string;
        /**Department latitude.*/
        lat: string;
        /**Department longitude.*/
        long: string;
        /**Library id where the department belongs.*/
        parent_lid: number;
        /**Library open and close time, e.g. 8am - 6pm or 24 Hours*/
        rendered: string;
        /**Library open time, e.g. 08:00:00*/
        open: string;
        /**Library close time, e.g. 18:00:00*/
        close: string;
    }
    interface IDepartmentByDay extends IDepartment {
        /**Library current opening status and official hours*/
        times: ITimes;
    }
    interface IDepartmentByWeek extends IDepartment {
        /**Library current opening status and official hours*/
        weeks: IWeeks[];
        weekHoursInfo: IWeekDayHours[];
    }

    /**for calculating over all over time of library */
    export interface IOpenTime{
        from: string;
        to: string;
    }
}