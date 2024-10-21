import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';
import { Need } from '../need';
import { NeedService } from '../need.service';
import { HelpIconComponent } from '../help-icon/help-icon.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { NeedBundle } from '../need-bundle';

@Component({
  selector: 'app-need-search',
  templateUrl: './need-search.component.html',
  styleUrls: ['../help-icon/help-icon.component.css', './need-search.component.css' ]
})
export class NeedSearchComponent implements OnInit {

  
  @Input()
  parent:any;


  needs$!: Observable<Need[]>;
  private searchTerms = new Subject<string>();
  username = localStorage.getItem('username') || '';

  constructor(private needService: NeedService, private dashboardRef: DashboardComponent) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
    }

  addToFundingBasket(need: Need): void {
    this.dashboardRef.add_to_bundle(need);
    }

  ngOnInit(): void {
    this.needs$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.needService.searchNeeds(term)),
    );

  }
}