import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  teams = ['VOORW A', 'VOORW B', 'U11', 'U13', 'U15', 'U17', 'U19'];

  private apiUrl = '/api/ajax/calendar/events';

  constructor(private http: HttpClient) { }

  private _events$: Observable<any> = this.fetchEvents()
    .pipe(
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
          return game;
        });
    })
  )

  fetchEvents(): Observable<any> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'accept-language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'Referer': 'https://www.voorwaartskkc.be/',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });

    const body = new URLSearchParams({
      languageId: '2',
      view: 'website',
      'widget-settings-id': '40233',
      'filter-search': '',
      'fc-start': '2026-02-27 11:49',
      'fc-end': '2026-12-31 23:59'
    }).toString();

    return this.http.post(this.apiUrl, body, { headers });
  }
}


