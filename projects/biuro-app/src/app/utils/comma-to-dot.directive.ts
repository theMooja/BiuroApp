import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCommaToDot]',
  standalone: true
})
export class CommaToDotDirective {

  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && this.control && this.control.control) {
      const newValue = input.value.replace(/,/g, '.');
      this.control.control.setValue(newValue, { emitEvent: false });
    }
  }

}
