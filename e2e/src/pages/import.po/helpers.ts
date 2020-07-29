import { testNameTypes, elements } from './constants';
import { UiSwitch } from '../../elements/ui-switch';

class ImportHelper {
    getTestNameSwitcher(testNameType: string): UiSwitch {
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
