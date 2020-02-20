import { DatePipe } from '@angular/common';

class DateUtil {
  getDateFormat(locale: string = 'en', format: string = 'MM.dd.yyyy'): string {
    return new DatePipe(locale).transform(new Date(), format);
  }
}

export const dateUtil = new DateUtil();
