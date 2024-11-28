import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToMMSSPipe',
  standalone: true
})
export class SecondsToMMSSPipe implements PipeTransform {

  transform(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes.toString()}:${seconds.toString()}`;
  }

}
