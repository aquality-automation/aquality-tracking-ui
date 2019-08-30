export interface WithSearch {

    /**
     * Type Text into Search Field and select option
     * @param value option name
     */
    select(value: string);

    /**
    * Only select option from opened selector
    * @param value option name
    */
    selectOption(value: string);
}
