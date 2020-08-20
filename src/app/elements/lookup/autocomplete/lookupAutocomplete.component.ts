import { Component, Input, Output, EventEmitter, OnChanges, OnInit} from '@angular/core';
import { BaseLookupComponent } from '../baseLookup';
import { TransformationsService } from '../../../services/transformations.service';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'lookup-autocomplete',
  templateUrl: 'lookupAutocomplete.component.html',
  styleUrls: ['../baseLookup.scss', './lookup-autocomplete.component.scss'],
  providers: [
    TransformationsService
  ]
})
export class LookupAutocompleteComponent extends BaseLookupComponent implements OnChanges, OnInit {
  @Input() maxlength = '100';
  @Input() allowCreation = false;
  @Output() searchText = new EventEmitter();
  faExternalLinkAlt = faExternalLinkAlt;

  toggleOff() {
    this.hidden = true;
    this.selectedItemText = this.model ? this.textToShow(this.model) : '';
  }

  ngOnChanges() {
      this.selectedItemText = this.model ? this.textToShow(this.model) : '';
      this.filteredArray = this.array;
      this.sort();
    }

  ngOnInit() {
    this.selectedItemText = this.model ? this.textToShow(this.model) : '';
    this.filteredArray = this.array;
    this.sort();
  }

  sendSearchText() {
    this.searchText.emit(this.selectedItemText);
    this.toggleOff();
  }

  inList(): boolean {
    return this.selectedItemText ? this.array.find(x => x.name === this.selectedItemText.trim()) : true;
  }

  onKey($event) {
    this.selectedItemText = $event;
    if (this.selectedItemText && this.selectedItemText !== '') {
      this.filteredArray = this.array.filter(x => this.textToShow(x).toLowerCase().includes(this.selectedItemText.toLowerCase().trim()));
    } else {
      this.filteredArray = this.array;
    }
    this.sort();
  }
}
