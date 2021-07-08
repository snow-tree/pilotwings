import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'
import { map, merge, Observable, switchMap, take } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PilotRecord } from '../pilot.model';

@Component({
  selector: 'pilotwings-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'pilotdb';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  formGroup = new FormGroup({
    search: new FormControl(''),
  });

  items$ = merge(
    this.route.queryParams.pipe(map(b => b.q as string)),
    this.formGroup.valueChanges.pipe(debounceTime(15), map(b => b.search))
  ).pipe(
    switchMap(b => this.search(b as string))
  )

  search(q: string): Observable<PilotRecord[]> {
    return this.http.get<PilotRecord[]>('/search', { params: new HttpParams({ fromObject: { q } }) }).pipe(take(1))
  }
}
