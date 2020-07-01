import { DatePipe } from '@angular/common';

class DateUtils {
  getDateFormat(locale: string = 'en', format: string = 'MM.dd.yyyy'): string {
    return new DatePipe(locale).transform(new Date(), format);
  }
}

export default new DateUtils();
