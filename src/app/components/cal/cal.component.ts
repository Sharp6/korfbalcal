import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { GamesService } from '../../services/games.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-cal',
  imports: [CommonModule, MatCheckboxModule, MatTableModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './cal.component.html',
  styleUrl: './cal.component.css'
})
export class CalComponent implements OnInit {
  displayedColumns: string[] = ['title', 'team', 'isHomeGame', 'date', 'time'];

  teams: string[] = this.gamesService.teams;
  selectedTeams = new FormControl(this.gamesService.teams.slice());
  onlyHomeGames = new FormControl(false);

  filterForm = new FormGroup({
    selectedTeams: this.selectedTeams,
    onlyHomeGames: this.onlyHomeGames
  });
  filterChange: EventEmitter<any> = new EventEmitter();

  constructor(private gamesService: GamesService) {
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe(filters => {
      //this.filterChange.emit(filters);
      this.filteredGames$ = this.games$.pipe(
        map(games => {
          console.log(filters);
          let filteredGames = games;
          filteredGames = filteredGames.filter(game => filters.selectedTeams?.includes(game.team));
          filteredGames = filteredGames.filter(game => filters.onlyHomeGames ? game.isHomeGame : true);
          return filteredGames;
        })
      )
    });
  }

  games$: Observable<any[]> = this.gamesService.games$;
  filteredGames$ = this.games$;


}
