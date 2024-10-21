import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccessController implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const username = localStorage.getItem('username');
    const attemptedRoute = route.url[0].path;

    if (!username) {
      this.router.navigate(['/login']);
      alert('You must enter a username before proceeding');
      return false;
    }
    else if (username !== 'admin' && attemptedRoute === 'needs') {
      this.router.navigate(['/dashboard']);
      alert('You must be an admin to access this page');
      return false;
    }
    else if (username !== 'admin' && attemptedRoute === 'detail') {
      this.router.navigate(['/dashboard']);
      alert('You must be an admin to access this page');
      return false;
    }
  
    return true;
  }
}