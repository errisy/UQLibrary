class NumberUtil {
    static isValidInteger(value: any){
        return typeof value == 'number' && Number.isFinite(value) && Number.isInteger(value);
    }
}
 