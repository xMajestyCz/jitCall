import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: false
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '0:00';
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
