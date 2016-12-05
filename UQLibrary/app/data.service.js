var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class LibraryDataClient {
    constructor(service) {
        this.service = service;
    }
    library_hours_day() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/day');
            return arg.data;
        });
    }
    library_hours_week() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/v2/library_hours/week');
            return arg.data;
        });
    }
    computer_availability() {
        return __awaiter(this, void 0, void 0, function* () {
            let arg = yield this.service.get('https://app.library.uq.edu.au/api/computer_availability');
            let data = arg.data;
            //calculate the rate of availability for later usage
            data.forEach(item => {
                let total = 0;
                let available = 0;
                for (let key in item.availability) {
                    let room = item.availability[key];
                    let availableInRoom = room.Available;
                    let occupiedInRoom = room.Occupied;
                    if (NumberUtil.isValidInteger(availableInRoom) && NumberUtil.isValidInteger(occupiedInRoom)) {
                        total += (availableInRoom + occupiedInRoom);
                        available += availableInRoom;
                    }
                }
                item.totalAvailable = available;
                item.numberOfComputer = total;
                item.availablePercentage = available / total * 100;
            });
            return data;
        });
    }
}
//# sourceMappingURL=data.service.js.map