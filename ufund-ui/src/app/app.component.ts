import { Component, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { Subscribable, Subscription } from 'rxjs';
import { Router } from '@angular/router';


const USERNAME_LOGGED_OUT = '';
const USERNAME_ADMIN = 'admin';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./dark-mode/dark-mode.component.css','./app.component.css'],
  encapsulation : ViewEncapsulation.None  //<-- Use global CSS styles (e.g. light/dark mode colors from dark-mode.component.css)
})

export class AppComponent {

  //Variables
  title:string = 'UFund';

  //Constructor
  constructor(private router: Router) {}

  //Functions

  /**
   * @returns true if the user is logged in (false otherwise)
   */
  is_logged_in(): boolean {
    return (localStorage.getItem('username') !== USERNAME_LOGGED_OUT);
    }

  /**
   * @returns true if the user is an admin (false otherwise)
   */
  is_admin(): boolean {
    return (localStorage.getItem('username') === USERNAME_ADMIN);
    }

  /**
   * Logs the user out and returns to the login page
   * @returns void
   * @postcondition the user is logged out and returned to the login page
   */
  logout(): void {

    localStorage.setItem('username', USERNAME_LOGGED_OUT);
    this.router.navigate(['/login']); //Return to login

    }

}