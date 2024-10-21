import { Component } from '@angular/core';

@Component({
  selector: 'app-dark-mode',
  templateUrl: './dark-mode.component.html',
  styleUrl: './dark-mode.component.css'
})
export class DarkModeComponent {

  useDarkMode:boolean = false;     //Default to light mode

  constructor() {

    //Update initial dark mode state
    this.useDarkMode = (localStorage.getItem('useDarkMode') === 'true');
    this.updateDarkMode(this.useDarkMode);

    }

  updateDarkMode(useDarkModeCur:boolean) {

    //Toggles dark mode on or off based on the current state
    this.useDarkMode = !useDarkModeCur;
    localStorage.setItem('darkMode', useDarkModeCur ? 'true' : 'false');

    //Update the CSS variables for light/dark mode
    const root = document.documentElement;
    if (this.useDarkMode)
      root.classList.add('dark-theme');
    else
      root.classList.remove('dark-theme');

    }

  }
