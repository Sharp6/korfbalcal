import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  teams = ['VOORW A', 'VOORW B', 'U11', 'U13', 'U15', 'U17', 'U19'];
  defaultStartDate = new Date();
  defaultEndDate = new Date(new Date().getFullYear(), 11, 31, 23, 59);

  private apiUrl = `${environment.apiBaseUrl}/ajax/calendar/events`;
  private dateRange$ = new BehaviorSubject<{ start: Date; end: Date }>({
    start: this.defaultStartDate,
    end: this.defaultEndDate
  });

  constructor(private http: HttpClient) { }

  private _events$: Observable<any> = this.dateRange$.pipe(
    distinctUntilChanged((prev, next) =>
      prev.start.getTime() === next.start.getTime() &&
      prev.end.getTime() === next.end.getTime()
    ),
    switchMap(range => this.fetchEvents(range.start, range.end)),
    shareReplay(1)
  );

  games$:Observable<any[]> = this._events$.pipe(
    map(events => {
      return events
        .filter((e: { eventType: number; }) => e.eventType == 3)
        .map((game: { title: string | string[]; team: string; }) => {
          this.teams.forEach(team => {
            if (game.title.includes(team)) {``
              game.team = team;
            }
          });
          return game;
        })
        .map((game: { title: string; isHomeGame: boolean; }) => {
          if (game.title.startsWith("VW") || game.title.startsWith("VOORW")) {
            game.isHomeGame = true;
          } else {
            game.isHomeGame = false;
          }
          game.title = game.title.replace('VOORW', 'VW');
          return game;
        });
    })
  )

  setDateRange(start: Date, end: Date) {
    this.dateRange$.next({ start, end });
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  fetchEvents(start: Date, end: Date): Observable<any> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'accept-language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      //'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      //'sec-ch-ua-mobile': '?0',
      //'sec-ch-ua-platform': '"macOS"',
      //'sec-fetch-dest': 'empty',
      //'sec-fetch-mode': 'cors',
      //'sec-fetch-site': 'cross-site',
      //'Referer': 'https://www.voorwaartskkc.be/',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    const body = new URLSearchParams({
      languageId: '2',
      view: 'website',
      'widget-settings-id': '40233',
      'filter-search': '',
      'fc-start': this.formatDateTime(start),
      'fc-end': this.formatDateTime(end)
    }).toString();

    return this.http.post(this.apiUrl, body, { headers });
  }
}
