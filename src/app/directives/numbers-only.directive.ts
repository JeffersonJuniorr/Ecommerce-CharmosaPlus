import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {
  constructor( private el: ElementRef ) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;

    const newValue = initialValue.replace(/[^0-9]/g, '');

    if (initialValue !== newValue) {
      this.el.nativeElement.value = newValue;
      event.stopPropagation();
    }
  }
}
