import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CalFilters } from '../../models/cal-filters.model';

@Component({
  selector: 'app-cal-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cal-filters.component.html',
  styleUrl: './cal-filters.component.css'
})
export class CalFiltersComponent implements OnChanges {
  @Input({ required: true }) teams: string[] = [];
  @Input({ required: true }) filters!: CalFilters;
  @Output() filtersChange = new EventEmitter<CalFilters>();

  selectedTeams = new FormControl<string[]>([]);
  onlyHomeGames = new FormControl(false);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  filterForm = new FormGroup({
    selectedTeams: this.selectedTeams,
    onlyHomeGames: this.onlyHomeGames,
    startDate: this.startDate,
    endDate: this.endDate
  });

  constructor() {
    this.filterForm.valueChanges.subscribe(values => {
      const next: CalFilters = {
        selectedTeams: values.selectedTeams ?? [],
        onlyHomeGames: values.onlyHomeGames ?? false,
        startDate: values.startDate ?? new Date(),
        endDate: values.endDate ?? new Date()
      };
      this.filtersChange.emit(next);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters'] && this.filters) {
      this.filterForm.patchValue({
        selectedTeams: this.filters.selectedTeams,
        onlyHomeGames: this.filters.onlyHomeGames,
        startDate: this.filters.startDate,
        endDate: this.filters.endDate
      }, { emitEvent: false });
    }
  }

  selectAllTeams() {
    this.selectedTeams.setValue(this.teams.slice());
  }

  deselectAllTeams() {
    this.selectedTeams.setValue([]);
  }

  isTeamSelected(team: string) {
    return this.selectedTeams.value?.includes(team) ?? false;
  }

  toggleTeam(team: string, checked: boolean) {
    const next = new Set(this.selectedTeams.value ?? []);
    if (checked) {
      next.add(team);
    } else {
      next.delete(team);
    }
    this.selectedTeams.setValue(Array.from(next));
  }

  setNextDaysRange(days: number) {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    this.startDate.setValue(start);
    this.endDate.setValue(end);
  }
}
