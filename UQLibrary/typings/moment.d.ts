declare function moment(value?: string | Date, format?: string): Moment;

declare module moment {
    /**
     * create a duration with a string or number (with give unit of time);
     * @param value a number or string
     * @param unit optional unit of time, by default it is millisecond
     */
    function duration(value: Number | string, unit?: string): Duration;
    function isDuration(value?: any): boolean;
}

declare class Moment{
    /**
     * Format date-time with provided format: e.g YYYY-MM-DD HH:mm:ss
     * YYYY 1915 MM 02 MMM Feb MMMM April Do 2th  hh 8 (12h format) HH (24h) a(am/pm)
     * @param value
     */
    public format(value: string):string;
    /**
     * Calculate the duration from now to the moment;
     */
    public fromNow(): Duration;
    /**
     * Calculate the duration from the moment to now;
     */
    public toNow(): Duration;
    /**
     * Calculate the duration from the value to the moment;
     */
    public from(value: Moment | String | Date): Duration;
    /**
     * Calculate the duration from the moment to value;
     */
    public to(value: Moment | String | Date): Duration;
    /**
     * Add the provided value of units to the date-time
     * @param value
     * @param unit
     */
    public add(value: number, unit: string): Moment;
    /**
     * Subtract the provided value of units to the date-time
     * @param value
     * @param unit
     */
    public subtract(value: number, unit: string): Moment;
    /**
     * Convert Moment to javascript Date
     */
    public toDate(): Date;
    /**
     * set the moment to the start moment by setting it to the end of a unit of time
     * @param value
     */
    public startOf(value: string): Moment;
    /**
     * set the moment to the end moment by setting it to the end of a unit of time
     * @param value
     */
    public endOf(value: string): Moment;
    /**
     * To get the difference between the moment and the value by specific unit
     * @param value
     * @param unit the default unit is millisecond
     * @param showfloatpiont the default unit is false and the result is integer, if true, the result will be float point value;
     */
    public diff(value: Moment | String | Number | Date, unit?: string, showfloatpiont?: boolean): number;
    /**
     * Get the number of days in the current month
     */
    public daysInMonth(): number;
    /**
     * Get an object containing year, month, day-of-month, hour, minute, seconds, milliseconds.
     */
    public toObject(): MomentObject;

    //public years(): number;
    //public months(): number;
    public days(): number;
    public hours(): number;
    public minutes(): number;
    public seconds(): number;
    public milliseconds(): number;
    public year(value: number | string): Moment;
    public year(): number;
    public month(value: number | string): Moment;
    public month(): number;
    public day(value: number | string): Moment;
    public date(value: number | string): Moment;
    /**
     * overload: return the day of month;
     */
    public date(): number;
    public hour(value: number | string): Moment
    public minute(value: number | string): Moment;
    public second(value: number | string): Moment;
    public millisecond(value: number | string): Moment;
}

declare class MomentObject {

}

declare class Duration {
    public milliseconds(): number;
    public asMilliseconds(): number;
    public seconds(): number;
    public asSeconds(): number;
    public minutes(): number;
    public asMinutes(): number;
    public hours(): number;
    public asHours(): number;
    public days(): number;
    public asDays(): number;
    public weeks(): number;
    public asWeeks(): number;
    public months(): number;
    public asMonths(): number;
    public years(): number;
    public asYears(): number;
    public add(value: number | Duration | string, unit?: string): Duration;
    public subtract(value: number | Duration | string, unit?: string): Duration;
    /**
     * get the number can be shown the unit of time
     * @param unit
     */
    public get(unit: string): number;
    /**
     * get the number measured by the unit of time
     * @param unit
     */
    public as(unit: string): number;
}