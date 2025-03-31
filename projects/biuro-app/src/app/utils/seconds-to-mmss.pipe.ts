import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToMMSSPipe',
  standalone: true
})
export class SecondsToMMSSPipe implements PipeTransform {

  transform(value: number): string {
    if (isNaN(value)) return '00:00';

    const isNegative = value < 0;
    value = Math.abs(value);

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const result = `${minutes.toString()}:${seconds.toString()}`;
    return isNegative ? `-${result}` : result;
  }

}

@Pipe({
  name: 'secondsToHHMMSSPipe',
  standalone: true
})
export class SecondsToHHMMSSPipe implements PipeTransform {

  transform(value: number): string {
    if (isNaN(value)) return '00:00:00';

    const isNegative = value < 0;
    value = Math.abs(value);

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const result = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return isNegative ? `-${result}` : result;
  }

}
