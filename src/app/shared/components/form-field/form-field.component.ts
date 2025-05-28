import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  standalone: false
})
export class FormFieldComponent  implements OnInit {
  @Input() form!: FormGroup;
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() type: string = 'text';
  @Input() iconName!: string;
  @Input() showPasswordToggle: boolean = false;
  @Input() maxlength: string | number | null = null;
  @Input() minlength: string | number | null = null;
  @Input() pattern?: string;
  @Input() required: boolean = false;
  
  @Output() keyPress = new EventEmitter<KeyboardEvent>();
  
  showPassword: boolean = false;

  constructor() { }

  ngOnInit() {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onKeyPress(event: KeyboardEvent) {
    if (this.keyPress.observers.length > 0) {
      this.keyPress.emit(event);
    }
  }
}
