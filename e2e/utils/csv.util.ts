export const compareCSVStrings = (actualCsv: string, expectedCsv: string) => {
    const actualCsvRows = actualCsv.split(/\r?\n/);
    const expectedCsvRows = expectedCsv.split(/\r?\n/);
    const missedFromActual: string[] = [];
    let missedFromExpected: string[] = expectedCsvRows.slice();
    actualCsvRows.forEach(row => {
        if (expectedCsvRows.includes(row)) {
            missedFromExpected = missedFromExpected.filter(x => x !== row);
        } else {
            missedFromActual.push(row);
        }
    });

    return {
        missedFromActual: missedFromActual,
        missedFromExpected: missedFromExpected
    };
};
