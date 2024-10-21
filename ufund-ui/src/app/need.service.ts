import { Injectable } from '@angular/core';

import { Observable, of, BehaviorSubject } from 'rxjs';
import PriorityQueue from 'ts-priority-queue';

import { Need } from './need';
import { HEROES } from './mock-needs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { NeedBundle } from './need-bundle';

@Injectable({
  providedIn: 'root',
})
export class NeedService {

  private needsUrl = 'http://localhost:8080/needs'
  private recommendedNeedsSubject = new BehaviorSubject<Need[]>([]);
  public recommendedNeedsMessage = this.recommendedNeedsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private messageService: MessageService) {

      //Initialize Recommended Needs
      this.refreshRecommendedNeeds();

    }

  //#region (RECOMMENDED NEEDS)
  /**
   * @param stringA 
   * @param stringB
   * @returns 
   */
  compareStringCharacters(stringA: string, stringB: string) {

    if ((stringA===undefined) || (stringB===undefined)) {
      return 0;
      }

    let charMatchCount:number = 0;
    let charsChecked:Set<string> = new Set();

    let stringALower:string = stringA.toLowerCase();
    let stringBLower:string = stringB.toLowerCase();

    for (const c of stringALower) {

      //Already checked this character
      if (charsChecked.has(c)) {
        continue;
        }

      //Check if the character is in the other string
      if (stringBLower.includes(c)) {
        charMatchCount++;
        }
      
      //Mark the character as checked
      charsChecked.add(c);
      
    }

    return charMatchCount;

    }

  /**
   * @param needTarget 
   * @returns 
   */
  compareNeeds(needTarget: Need) {
    
    const fundingBasket = this.getFundingBasket(); 
  
    let priorityTotal: number = 0.0;
  
    fundingBasket.forEach(bundle => {
      const needTemplate = bundle.get_need_template();
      const bundleCount = bundle.get_count();

      priorityTotal += this.compareStringCharacters(needTarget.name, needTemplate.name);
      priorityTotal += this.compareStringCharacters(needTarget.type, needTemplate.type);
      priorityTotal -= Math.abs(needTarget.cost - needTemplate.cost) / 100;
  
      const BUNDLE_SIZE_WEIGHT = 0.33;
      priorityTotal *= ((1.00 + bundleCount) * BUNDLE_SIZE_WEIGHT);

    }); 
  
    const RANDOM_WEIGHT = 0.05;
    priorityTotal += Math.random() * RANDOM_WEIGHT;
    
    priorityTotal = Math.max(0.00, priorityTotal);

    return priorityTotal;
  
  }
  

  refreshRecommendedNeeds() {
    this.getNeeds().subscribe(needs => {

      const bundlePriorities: [Need, number][] = [];

      const fundingBasket = this.getFundingBasket();
      fundingBasket.forEach(bundle => {

        for (let i = 0; i < bundle.get_count(); i++) {
          bundlePriorities.push([bundle.get_need_template(), this.compareNeeds(bundle.get_need_template())]);
          }
        
        });

      const filteredNeeds = needs.filter(need => {
        return !bundlePriorities.some(([bundledNeed, _]) => need.id === bundledNeed.id);
        }); 
 
      //const needPriorities: [Need, number][] = [];
      const queue = new PriorityQueue<Need>({
        comparator: (a, b) => (this.compareNeeds(b) - this.compareNeeds(a))
        });

      filteredNeeds.forEach(need => queue.queue(need)); 

      needs.forEach(need => {
        if (!filteredNeeds.includes(need)) {
          queue.queue(need);
          }
      });

      const RECOMMENDED_NEEDS_COUNT = 4; 
      let newRecommendedNeeds: Need[] = [];

      while (queue.length && newRecommendedNeeds.length < RECOMMENDED_NEEDS_COUNT) {
        const need = queue.dequeue();
        if (need.quantity > 0) { 
          newRecommendedNeeds.push(need);
        }
      }

      this.recommendedNeedsSubject.next(newRecommendedNeeds);
    });
  }

  getFundingBasket(): NeedBundle[] {
    const fundingBasket = JSON.parse(localStorage.getItem('fundingBasket') || '[]');
    let needBundles: NeedBundle[] = [];
    for (let bundle in fundingBasket) {
      let need = fundingBasket[bundle].needTemplate;
      let count = fundingBasket[bundle].count;
      let newBundle = new NeedBundle(need);
      for (let i = 0; i < count; i++) {
        newBundle.add_need_instance();
      }
      needBundles.push(newBundle);
    }
    return needBundles;
    
  }

  /** GET needs from the server */
  getNeeds(): Observable<Need[]> {
    return this.http.get<Need[]>(this.needsUrl)
      .pipe(
        tap(_ => this.log('fetched needs')),
        catchError(this.handleError<Need[]>('getNeeds', []))
      );
  }

  /** GET need by id. Will 404 if id not found */
  getNeed(id: number): Observable<Need> {
    const url = `${this.needsUrl}/${id}`;
    return this.http.get<Need>(url).pipe(
      tap(_ => this.log(`fetched need id=${id}`)),
      catchError(this.handleError<Need>(`getNeed id=${id}`))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** PUT: update the need on the server */
  updateNeed(need: Need): Observable<any> {
    return this.http.put(this.needsUrl, need, this.httpOptions).pipe(
      tap(_ => this.log(`updated need id=${need.id}`)),
      catchError(this.handleError<any>('updateNeed'))
    );
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  /** POST: add a new need to the server */
  addNeed(need: Need): Observable<Need> {
    return this.http.post<Need>(this.needsUrl, need, this.httpOptions).pipe(
      tap((newNeed: Need) => this.log(`added need w/ id=${newNeed.id}`)),
      catchError(this.handleError<Need>('addNeed'))
    );
  }

  /** DELETE: delete the need from the server */
  deleteNeed(id: number): Observable<Need> {
    const url = `${this.needsUrl}/${id}`;

    return this.http.delete<Need>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted need id=${id}`)),
      catchError(this.handleError<Need>('deleteNeed'))
    );
  }

  /* GET needs whose name contains search term */
  searchNeeds(term: string): Observable<Need[]> {
    if (!term.trim()) {
      // if not search term, return empty need array.
      return of([]);
    }
    return this.http.get<Need[]>(`${this.needsUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found needs matching "${term}"`) :
        this.log(`no needs matching "${term}"`)),
      catchError(this.handleError<Need[]>('searchNeeds', []))
    );
  }
  
  /** Log a NeedService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`NeedService: ${message}`);
  }
  

}