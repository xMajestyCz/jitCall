import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in-up',
  templateUrl: './sign-in-up.component.html',
  styleUrls: ['./sign-in-up.component.scss'],
  standalone: false
})
export class SignInUpComponent  implements OnInit {
  @Input() isLogin = false;
  @Input() h1 = '';
  @Input() ionButton = '';
  @Input() routerLink = '';
  @Input() toggleRoute: string = '';

  constructor(private router: Router) { }

  ngOnInit() {}

  goToToggle() {
    this.router.navigate([this.toggleRoute]);
  }
}
