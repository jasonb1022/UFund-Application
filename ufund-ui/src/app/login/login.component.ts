import { Component, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';

const USERNAME_LOGGED_OUT = '';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../dark-mode/dark-mode.component.css', '../app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {

  username: string = USERNAME_LOGGED_OUT;
  

  constructor(private router: Router) {}

  login(): void {

    localStorage.setItem('username', this.username);
    this.router.navigate(['/dashboard']); //Proceed to dashboard

  }

}