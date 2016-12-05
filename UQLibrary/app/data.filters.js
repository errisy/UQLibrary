class LibraryDataFilters {
}
LibraryDataFilters.avaliableRange = (data, from, to) => {
    if (!data || !Array.isArray(data))
        return [];
    return data.filter(item => item.availablePercentage >= from && item.availablePercentage < to);
};
//# sourceMappingURL=data.filters.js.map