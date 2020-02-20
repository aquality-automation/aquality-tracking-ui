export const Constants = {
    emailPatternHelpText:
`Example %FN{2}%.%LASTNAME%@example.com: For John Doe will result to jo.doe@example.com

%FN% - First Name first letter
%LN% - Last Name first letter
%FN{n}% - First Name first n letters
%LN{n}% - Last Name first n letters
%FirstName% - Full First Name
%LastName% - Full Last Name`,
    emailHelpTextHint: 'Show Examples',
    emailPatternErrorMessage: 'Default Email Pattern should match to this pattern: example@domain.com',
    emailPatternErrorMessageHeader: 'Email Pattern'
};
