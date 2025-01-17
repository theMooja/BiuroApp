import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nominativeDate',
  standalone: true
})
export class NominativeDatePipe implements PipeTransform {

  transform(value: Date | string, format: string = 'MMMM', locale: string = 'pl-PL'): string {
    const date = new Date(value);
    const formatter = new Intl.DateTimeFormat(locale, { month: format === 'MMMM' ? 'long' : undefined });
    return formatter.format(date);
  }

}
