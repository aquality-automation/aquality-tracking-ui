export const padYear = (endPart: string) => {
    return parseInt(new Date().getFullYear().toString().substring(0, 2) + endPart, 10);
};

export const convertHoursTo24HourFormat = (hours: string, dayPeriod: string): number => {
    const amDayPeriod = 'AM';
    const hoursInDay = 12;
    if (dayPeriod === amDayPeriod) {
        return parseInt(hours, 10);
    }
    return parseInt(hours, 10) + hoursInDay;
};
