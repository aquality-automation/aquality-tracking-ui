import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { BaseLookupComponent } from './baseLookup';

@Component({
  selector: 'lookup-autocomplete-multiselect',
  templateUrl: './lookupAutocompleteMultiselect.component.html',
  styleUrls: ['./lookupAutocompleteMultiselect.component.css'],
  providers: [
  ]
})
export class LookupAutocompleteMultiselectComponent extends BaseLookupComponent implements OnInit, OnChanges {
  @Input() model: any[] = [];
  @Output() onClosed = new EventEmitter();
  notSelectedArray: any[];
  searchText = '';

  ngOnInit() {
    this.filteredArray = this.notSelectedArray;
    this.sort();
    this.removeModelFromArray();
  }

  itemUpdate($event) {
    this.modelChange.emit($event);
  }

  select(item) {
    if (!this.model) {
      this.model = [];
    }
    this.searchText = '';
    this.model.push(item);
    this.itemUpdate(this.model);
    this.doShowList();
  }

  removeFromSelected(item) {
    this.model = this.model.filter(x => {
      return x.hasOwnProperty('id') ? x.id !== item.id : x !== item;
    });
    this.itemUpdate(this.model);
    this.doShowList();
  }

  toggleOff() {
    if (!this.hidden) {
      this.hidden = true;
      this.searchText = '';
      this.onKey();
      this.onClosed.emit(this.model);
    }
  }

  ngOnChanges() {
    this.sort();
    this.removeModelFromArray();
    this.onKey();
  }

  doShowList() {
    this.onKey();
    this.removeModelFromArray();
  }

  onKey() {
    if (this.searchText && this.searchText !== '') {
      this.filteredArray = this.notSelectedArray.filter(x => this.textToShow(x).toLowerCase().includes(this.searchText.toLowerCase()));
    } else {
      this.filteredArray = this.notSelectedArray;
    }
  }

  disabledText() {
    if (this.model) {
      const text: string[] = [];
      this.model.forEach(element => {
        text.push(this.textToShow(element));
      });
      return text.join(', ');
    }
  }

  removeModelFromArray() {
    this.notSelectedArray = this.array;
    if (this.model) {
      this.model.forEach(item => {
        this.notSelectedArray = this.notSelectedArray.filter(x => {
          if (x.hasOwnProperty('id')) {
            return x.id !== item.id;
          }
          return x !== item;
        });
      });
    }
    this.filteredArray = this.notSelectedArray;
  }
}
