
class LibDataFilters {
    /**filter array fields with keyword*/
    static fieldsFilter = (data: LibraryTypes.ILibraryHoursByDay[], fields: string[], keyword: string) => {
        if (!data || !Array.isArray(data)) return [];
        if (!fields || !Array.isArray(fields)) return data;
        if (!keyword || typeof keyword != 'string' || keyword =='') return data;
        keyword = keyword.toLowerCase();
        return data.filter(item => fields.some(field => item[field] && typeof item[field] == 'string' && (<string>item[field]).toLowerCase().indexOf(keyword) > -1));
    }
    /**test if an object has any fields*/
    static hasKeys = (data: { [key: string]: any }) => {
        let count: number = 0;
        if (data && typeof data == 'object') {
            for (let key in data) {
                count += 1;
            }
        }
        return count > 0;
    }
}