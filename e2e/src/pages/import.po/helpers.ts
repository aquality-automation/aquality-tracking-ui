import { testNameTypes, elements } from './constants';
import { MatRadioButton } from 'src/elements/mat-radio.element';

class ImportHelper {
    getTestNameSwitcher(testNameType: string): MatRadioButton {
        switch (testNameType) {
            case testNameTypes.className:
                return elements.classNameSwitch;
            case testNameTypes.featureTestName:
                return elements.featureTestNameSwitch;
            case testNameTypes.testDescription:
                return elements.testDescriptionSwitch;
            case testNameTypes.testName:
                return elements.testNameSwitch;
            default:
                throw new Error(`The ${testNameType} test name type is not described in getTestNameSwitcher()`);
        }
    }
}

export const importHelper = new ImportHelper();
