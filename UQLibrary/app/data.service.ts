
class LibraryDataClient {
    constructor(public service: IHttpService) { }
    /**
     * create a library, do not use with proxy !!!
     */
    public async createLibrary(library: LibraryTypes.ILibrary): Promise<boolean> {
        return Boolean((await this.service.post('createlib.cgi.js', JSON.stringify(library))).data);
    }
    /**
     * to library daily information API, use with proxy
     */
    public async library_hours_day(): Promise<LibraryTypes.ILibrariesByDay>  {
        let arg = await this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/day');
        return <any>arg.data;
    }
    /**
     * to library weekly hours API, use with proxy
     */
    public async library_hours_week(): Promise<LibraryTypes.ILibrariesByWeek> {
        let arg = await this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/week');
        return <any>arg.data;
    }
    /**
     * to computer availability API, use with proxy
     */
    public async computer_availability(): Promise<LibraryTypes.IBuildingComputerAvailability[]> {
        let arg = await this.service.get('https://app.library.uq.edu.au/api/computer_availability');
        let data: LibraryTypes.IBuildingComputerAvailability[] = <any>arg.data;
        return data;
    }

    static ComputerLibraryMappings = {
        'Architecture &amp; Music Library': 'Architecture & Music Library', 'Biological Sciences Library': 'Biological Sciences Library', 'D.H. Engineering &amp; Sciences Library': 'Dorothy Hill Engineering and Sciences Library', 'Duhig Building': 'Duhig Tower', 'Gatton Campus Library': 'Gatton Library', 'Graduate Economics &amp; Business Library': 'Graduate Economics and Business Library', 'Herston Health Sciences Library': 'Herston Health Sciences Library', 'Mater Hospital Library': 'Mater McAuley Library', 'PACE Health Sciences Library': 'PACE Health Sciences Library', 'Social Sciences &amp; Humanities Library': 'Social Sciences & Humanities Library',
    };

    /**
     * Load all the data in a concurrent manner
     * since all three sets of data are useful and relative, they are loaded in a concurrent manner to reduce waiting time.
     * relative information are summerized and added to data for display in angular
     */
    public getData(): Promise<{ libraries: LibraryTypes.ILibraryHoursByDay[], computers: LibraryTypes.IBuildingComputerAvailability[] }> {
        return new Promise<{ libraries: LibraryTypes.ILibraryHoursByDay[], computers: LibraryTypes.IBuildingComputerAvailability[] }>((resolve, reject) => {
            let result = { libraries: [], computers: [] };
            //try obtain all data at the same time;
            let count = 3;
            let librariesByDay: LibraryTypes.ILibraryHoursByDay[];
            let librariesByWeek: LibraryTypes.ILibraryHoursByWeek[];
            let computers: LibraryTypes.IBuildingComputerAvailability[];
            function calculate() {
                //mapping for library
                //summarize computer data: 
                //add totalAvailable (total available number of computers) 
                //add numberOfComputers
                //add numberOfRooms
                //add roomAvailabilities for ng-repeat display
                computers.forEach(item => {
                    if (LibraryDataClient.ComputerLibraryMappings[item.library]) item.mappedName = LibraryDataClient.ComputerLibraryMappings[item.library];
                    let total: number = 0;
                    let available: number = 0;
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
                })
                //summarize library data;
                //add weekday information to day information
                librariesByWeek.forEach(item => {
                    item.departments.forEach(department => {
                        department.weekHoursInfo = [];
                        for (let key in department.weeks[0]) {
                            let day = department.weeks[0][key];
                            let weekday: LibraryTypes.IWeekDayHours = <any>day;
                            weekday.weekday = key;
                            department.weekHoursInfo.push(weekday);
                        }
                    })
                })
                let today = moment().format("YYYY-MM-DD");
                librariesByDay.forEach(lib => {
                    if (lib.desc) {
                        try {
                            //try to combine the html contents in the description
                            let j = jQuery(lib.desc.unescapeHTML());
                            lib.desc = j.contents().text().replace(/\s+/ig, ' ');
                        }
                        catch (ex) {
                            //otherwise, it should be only plain string.
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
                    let openHour: string = '24:00:00';
                    let closeHour: string = '00:00:00';
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
                    } else if (lib.openHour == '00:00:00' && lib.closeHour == '24:00:00') {
                        lib.renderedHours = 'Open 24 Hours Today';
                    } else {
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
                if (count == 0) calculate();
            }
            //send concurrent requests;
            this.library_hours_day().then(value => {  librariesByDay = value.locations; done(); }, reason => reject(reason));
            this.library_hours_week().then(value => { librariesByWeek = value.locations; done(); }, reason => reject(reason));
            this.computer_availability().then(value => { computers = value; done(); }, reason => reject(reason));
        });
    }
}