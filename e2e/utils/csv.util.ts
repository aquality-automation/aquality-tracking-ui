const removeHeaders = (rows: string[]) => {
    rows.shift();
    return rows;
};

const splitRows = (value: string): string[] => {
    return value.split(/\r?\n/);
};

export const compareCSVStrings = (actualCsv: string, expectedCsv: string, skipHeaders: boolean = false) => {
    const actualCsvRows = skipHeaders ? removeHeaders(splitRows(actualCsv)) : splitRows(actualCsv);
    const expectedCsvRows = skipHeaders ? removeHeaders(splitRows(expectedCsv)) : splitRows(expectedCsv);
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
