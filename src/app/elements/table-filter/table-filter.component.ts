import { Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit, OnDestroy, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListToCsvService } from '../../services/listToCsv.service';
import { TransformationsService } from '../../services/transformations.service';
import { Filter, FilterHelper } from './filter.helper';
import { NotificationsService } from 'angular2-notifications';
import { copyToClipboard } from '../../shared/utils/clipboard.utils';
import {
  faColumns, faCheck, faTimes, faArrowUp, faFile,
  faArrowDown, faSyncAlt, faChevronUp, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { TFColumn, TFSorting, TFColumnType, TFOrder } from './tfColumn';
import { DataTable } from './data-table/DataTable';
import { AttachmentModalComponent } from '../lookup/attachment-modal/attachment-modal.component';
import { TestResultAttachment } from 'src/app/shared/models/test-result';

@Component({
  selector: 'table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @ViewChild(AttachmentModalComponent) attachmentModal: AttachmentModalComponent;
  @Input() hidePageSets = false;
  @Input() hideFilter = false;
  @Input() data: any[];
  @Input() columnManagement = true;
  @Input() columns: TFColumn[];
  @Input() hiddenColumns: TFColumn[] = [];
  @Input() defaultSortBy: TFSorting;
  @Input() rowsOnPage = 10;
  @Input() queryParams: boolean;
  @Input() allowCreate = false;
  @Input() allowDelete = false;
  @Input() redirect: { url: string, property: string };
  @Input() allowExport = false;
  @Input() hide: (entity: any, proprty: string) => boolean;
  @Input() rowColors: [{ property: string, color: string, higher?: any, lower?: any }];
  @Input() rowsOnPageSet: number[] = [5, 10, 20, 50];
  @Input() actionsHeader = true;
  @Input() allowRefresh = false;
  @Input() allowBulkUpdate = false;
  @Input() allowBulkDelete = false;
  @Input() withSelector = false;

  @Output() createEntity = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() action = new EventEmitter();
  @Output() customEvent = new EventEmitter();
  @Output() rowClick = new EventEmitter();
  @Output() shownData = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() bulkChanges = new EventEmitter();
  @Output() bulkDelete = new EventEmitter();
  @Output() lookupCreation = new EventEmitter<{ value: string, column: TFColumn, entity: any }>();
  @Output() lookupAction = new EventEmitter<{ value: string, column: TFColumn, entity: any }>();

  @ViewChild(DataTable) datatable: DataTable;

  passwordError = 'Password does not match the Confirm Password.';
  emptyFieldError = 'Fill all required fields';
  emailFieldError = 'Email should be equal to this pattern: example@domain.com';
  activePage = 1;
  filteredData: any[];
  showCreation = false;
  appliedFilters: Filter[] = [];
  newEntity: {} = {};
  bulkChangeEntity: {} = {};
  confirm: string;
  lastSelectedRow = 0;
  errorMessage: string;
  hideManageColumnsModal = true;
  hideBulkDeleteModal = true;
  animate = false;
  timerToken: NodeJS.Timer;
  timer: NodeJS.Timer;
  delay = 400;
  prevent = false;
  selectAll = false;
  filterHelper: FilterHelper;
  icons = {
    faColumns,
    faCheck,
    faTimes,
    faArrowUp,
    faArrowDown,
    faSyncAlt,
    faChevronUp,
    faChevronDown,
    faFile
  };
  type: string;
  testResultAttachments: TestResultAttachment[];
  attachModalTitle: string;
  hideAttachModal = true;

  constructor(
    private listTocsv: ListToCsvService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    public transformationsService: TransformationsService
  ) {
    this.filterHelper = new FilterHelper(this.transformationsService, this.route, this.router);
  }

  ngOnInit() {
    if (this.queryParams) {
      this.route.queryParams.subscribe(params => {
        this.appliedFilters = this.filterHelper.readFilterParams(params);
        this.applyFilters();
        this.activePage = +params['page'] || this.activePage;
        this.rowsOnPage = +params['rows'] || this.rowsOnPage;
      });
    }

    if ((this.allowDelete || this.allowCreate || this.allowBulkUpdate) && (this.columns && !this.columns.find(x => x.name === 'Action'))) {
      this.columns.push({ name: 'Action', property: 'action', type: TFColumnType.button, editable: true });
    }
    if ((this.allowBulkUpdate || this.withSelector || this.allowBulkDelete) && (this.columns && !this.columns.find(x => x.name === 'Selector'))) {
      this.columns.unshift({ name: 'Selector', property: 'ft_select', type: TFColumnType.selector, editable: true, class: 'fit' });
    }
  }

  ngAfterViewInit() {
    this.setNewPage(this.activePage, this.rowsOnPage);
    if (this.defaultSortBy) {
      this.sort(this.defaultSortBy);
    }
    if (this.datatable && this.queryParams) {
      this.datatable.onPageChange.subscribe(x => {
        this.router.navigate([], { queryParams: { page: x.activePage, rows: x.rowsOnPage }, queryParamsHandling: 'merge' });
      });
    }
  }

  ngOnChanges() {
    this.filteredData = this.data;
    this.applyFilters();
  }

  ngOnDestroy() {
    clearInterval(this.timerToken);
  }

  attachModalClosed() {
    this.attachModalTitle = null;
    this.testResultAttachments = null;
    this.hideAttachModal = true;
  }

  openAttachModal(testname: string, testResultAttachments: TestResultAttachment[]) {
    this.attachModalTitle = testname;
    this.testResultAttachments = testResultAttachments;
    this.hideAttachModal = false;
  }

  getDefaultSorter(col: TFColumn): TFSorting {
    if (col.sorting) {
      return col.sorter
        ? col.sorter
        : { property: col.property, order: TFOrder.desc };
    }

    return undefined;
  }

  handleLookupCreation(value: string, column: TFColumn, entity: any) {
    this.lookupCreation.emit({ value, column, entity });
  }

  handleLookupAction(value: any, column: TFColumn, entity: any) {
    this.lookupAction.emit({ value, column, entity });
  }

  applyFilters() {
    if (this.data) {
      this.filteredData = this.filterHelper.applyFilters(this.appliedFilters, this.data);
      this.sort(this.defaultSortBy);
      this.shownData.emit(this.filteredData);
    }
  }

  sort(sorter: TFSorting) {
    if (sorter) {
      this.defaultSortBy = sorter;
      if (sorter.hasOwnProperty('weights')) {
        this.transformationsService.sortArrayByWeight(this.filteredData, sorter);
      } else {
        this.transformationsService.sort(this.filteredData, sorter);
      }
    }
  }

  hitRefresh() {
    this.animate = true;
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        this.animate = false;
        this.refresh.emit();
        clearInterval(this.timerToken);
      }
      this.prevent = false;
    }, this.delay);
  }

  refreshAlways() {
    clearTimeout(this.timer);
    this.prevent = true;
    this.animate = true;
    this.timerToken = setInterval(() => this.refresh.emit(), 5000);
  }

  toggleSelectAll(isSelected: boolean) {
    this.filteredData.forEach(entity => entity.ft_select = isSelected);
  }

  hasSelectedRows() {
    return this.filteredData.find(entity => entity.ft_select === true || entity.ft_select === 1) !== undefined;
  }

  bulkUpdate() {
    const entitiesToUpdate = this.getSelectedEntitites();
    entitiesToUpdate.forEach(entity => {
      for (const property in this.bulkChangeEntity) {
        if (property) {
          entity[property] = this.bulkChangeEntity[property];
        }
      }
    });

    this.bulkChanges.emit(entitiesToUpdate);
    this.bulkChangeEntity = {};
  }

  confirmBulkDelete() {
    this.hideBulkDeleteModal = false;
  }

  async executeBulkDelete($event) {
    if (await $event) {
      const entitiesToDelete = this.getSelectedEntitites();
      this.bulkDelete.emit(entitiesToDelete);
    }
    this.hideBulkDeleteModal = true;
  }


  getSelectedEntitites() {
    return this.filteredData.filter(entity => entity.ft_select === true || entity.ft_select === 1);
  }

  manageColumns() {
    this.hideManageColumnsModal = false;
  }

  isPropertyShouldBeHidden(entity: any, property: string): boolean {
    if (this.hide) {
      const hide = this.hide(entity, property);
      return hide;
    }
    return false;
  }

  rowColor(entity: any): string {
    let color: string;
    if (this.rowColors && this.rowColors.length > 0) {
      this.rowColors.forEach(rowcol => {
        const prop = this.transformationsService.getPropertyValue(entity, rowcol.property);
        if (rowcol.lower && rowcol.higher) {
          if (prop > rowcol.higher && prop < rowcol.lower) {
            color = rowcol.color;
          }
        } else {
          if (rowcol.higher) {
            if (prop > rowcol.higher) {
              color = rowcol.color;
            }
          } else if (rowcol.lower) {
            if (prop < rowcol.lower) {
              color = rowcol.color;
            }
          } else if (prop) {
            color = rowcol.color;
          }
        }
      });
    }
    return color;
  }

  handleRangeFilterChange(col: any, value: string, type: string) {
    const newFilter: Filter = this.filterHelper.getOrCreateFilter(col.property, this.appliedFilters);
    let ranges: any[] = [];
    ranges = newFilter.range ? newFilter.range.split(',') : [0, undefined];

    switch (type) {
      case 'from':
        ranges[0] = this.fixIvalidRange(value, col);
        break;
      case 'to':
        ranges[1] = this.fixIvalidRange(value, col);
        break;
    }

    newFilter.range = ranges.join(',');
    this.filterChange(newFilter);
  }

  handleLookupFilterChange(property: string, selectedArray: any[]) {
    const options = [];
    selectedArray.forEach(element => {
      if (element && element.findEmpty) {
        options.push(0);
      } else if (element && element.id) {
        options.push(`${element.id}`);
      } else if (element && this.transformationsService.getPropertyValue(element, property).id) {
        options.push(`${this.transformationsService.getPropertyValue(element, property).id}`);
      }
    });
    const newFilter: Filter = { property, options: options.join(',') };
    this.filterChange(newFilter);
  }

  handleDateFilterUpdate(filterData: any) {
    let newFilter = this.appliedFilters.find(x => x.property === filterData.property);
    if (!newFilter) {
      newFilter = { property: filterData.property };
      this.appliedFilters.push(newFilter);
    }
    if (filterData.hasOwnProperty('from')) {
      newFilter.from = filterData.from ? new Date(new Date(filterData.from).setHours(0, 0, 0, 0)) : undefined;
    } else if (filterData.hasOwnProperty('to')) {
      newFilter.to = filterData.to ? new Date(new Date(filterData.to).setHours(23, 59, 59, 99)) : undefined;
    }
    this.filterChange(newFilter);
  }

  fixIvalidRange(range: string | number, col: TFColumn) {
    range = +range < 0 ? 0 : range;
    if (col.type === TFColumnType.percent) {
      range = +range > 100 ? 100 : range;
    }
    return range;
  }

  isRangeInvalid(col: any) {
    const filter = this.appliedFilters.find(x => x.property === col.property);
    if (filter) {
      const ranges = filter.range.split(',');
      return (+ranges[0] > +ranges[1]);
    }
    return false;
  }

  rangeFilterData(property: string, type: string) {
    const filter = this.appliedFilters.find(x => x.property === property);
    if (filter && filter.range) {
      const ranges = filter.range.split(',');
      if (type === 'from') {
        return ranges[0];
      }
      if (type === 'to') {
        return ranges[1];
      }
    }
  }

  getFilterDate(property: string, value: string) {
    const filter = this.appliedFilters.find(x => x.property === property);
    return filter ? filter[value] : undefined;
  }

  getLookupFilterValue(col: TFColumn) {
    const filter = this.appliedFilters.find(x => {
      if (col.lookup.objectWithId) {
        return x.property === col.lookup.objectWithId;
      }
      return x.property === col.property;
    });

    let selectedOpts = [];
    if (filter && filter.options) {
      const selectedOptIds = filter.options.split(',');
      selectedOpts = col.lookup.values.filter(x => {
        return selectedOptIds.find(y => (x.id ? x.id : this.transformationsService.getPropertyValue(x, filter.property).id) === +y);
      });
      if (selectedOptIds.find(y => +y === 0)) {
        selectedOpts.push({
          id: 0,
          findEmpty: true
        });
      }
    }
    return selectedOpts;
  }

  getDotFilterValue(col: TFColumn) {
    const filter = this.appliedFilters.find(x => x.property === col.property);
    return filter ? col.dotsFilter.values.find(x => x.name === filter.dots.name) : '';
  }

  textFilterData(property: string) {
    const filter = this.appliedFilters.find(x => x.property === property);
    return filter ? filter.value : '';
  }

  booleanFilterData(property: string): number {
    const filter = this.appliedFilters.find(x => x.property === property);
    return filter
      ? filter.state === true
        ? 1
        : filter.state === false
          ? 2
          : 3
      : 3;
  }

  toggleCreation() {
    this.showCreation = !this.showCreation;
  }

  setNewPage(activePage: number, rowsOnPage: number) {
    if (this.datatable) { this.datatable.setPage(activePage, rowsOnPage); }
  }

  getMultiPropertyValueString(entity, property, propToShow: any[]) {
    const objs: any[] = this.transformationsService.getPropertyValue(entity, property);
    let resultString = '';
    if (!objs || objs.length < 1) {
      return resultString;
    }

    objs.forEach(obj => {
      propToShow.forEach(prop => {
        resultString += `${this.transformationsService.getPropertyValue(obj, prop)} `;
      });
      resultString = resultString.trim();
      resultString += ', ';
    });

    return resultString.slice(0, -2);
  }

  getLookupProperty(property: string, values) {
    if (values && values.length > 0) {
      const props = property.toString().split('.');
      let val = values[0];
      let newProps = props;
      props.forEach((prop, index) => {
        val[prop] ? val = val[prop] : newProps = newProps.filter(x => x !== prop);
      });
      if (newProps.length > 0) {
        return newProps.join('.');
      }
    }
  }

  getFilterLookupModel(property: string) {
    const props = property.toString().split('.');
    return this.newEntity[props[0]];
  }

  setNewValueFromLookup(property: string, $event) {
    const props = property.toString().split('.');
    this.newEntity[props[0]] = $event;
  }

  setPropertyValue(entity: any, property: string, value: any, creation?: boolean, update: boolean = true) {
    if (typeof value === 'boolean') {
      value = value ? 1 : 0;
    }
    const props = property.toString().split('.');
    if (props.length === 1) {
      entity[props[0]] = value;
    } else if (props.length === 2) {
      entity[props[0]][props[1]] = value;
    } else if (props.length === 3) {
      entity[props[0]][props[1]][props[2]] = value;
    } else if (props.length === 4) {
      entity[props[0]][props[1]][props[2]][props[3]] = value;
    }

    if (creation) {
      this.createEntity.emit({ entity: this.newEntity, property: property });
    } else if (update) {
      this.sendUpdate(entity);
    }
  }

  sendUpdate($event) {
    this.dataChange.emit($event);
  }

  createAction() {
    this.confirm = '';
    this.action.emit({ action: 'create', entity: this.newEntity });
  }

  removeAction($event) {
    this.action.emit({ action: 'remove', entity: $event });
  }

  isNewEntityValid() {
    let messages: string[] = [];
    this.columns.forEach(column => {
      if (column.creation) {
        switch (column.type) {
          case TFColumnType.text:
            messages.push(this.isTextValid(column));
            break;
          case TFColumnType.autocomplete:
          case TFColumnType.colored:
            messages.push(this.isLookupValid(column));
            break;
          case TFColumnType.email:
            messages.push(this.isEmailValid(column));
            break;
          case TFColumnType.password:
            messages.push(this.isPasswordValid(column));
            break;
        }
      }
    });
    messages = messages.filter((v, i, a) => v !== '' && a.indexOf(v) === i);

    this.errorMessage = messages.join(', ');

    return this.errorMessage === '';
  }

  isTextValid(column: TFColumn): string {
    if (this.newEntity[column.property]) {
      if (this.newEntity[column.property] !== '' || !column.creation.required) {
        return '';
      }
    }
    return this.emptyFieldError;
  }

  isPasswordValid(column: TFColumn): string {
    if (this.newEntity[column.property] && this.newEntity[column.property] !== '') {
      if (this.newEntity[column.property] === this.confirm) {
        return '';
      }
      return this.passwordError;
    }
    return this.emptyFieldError;
  }

  isEmailValid(column: TFColumn): string {
    const value = this.transformationsService.getPropertyValue(this.newEntity, column.property);
    if (value && value !== '') {
      const regExp = new RegExp('(.+@.+[.][A-z]+)');
      return regExp.test(this.newEntity[column.property]) ? '' : this.emailFieldError;
    }
    return this.emptyFieldError;
  }

  isLookupValid(column: TFColumn): string {
    const value = this.transformationsService.getPropertyValue(this.newEntity, column.property);
    if ((value && value !== '') || !column.creation.required) {
      return '';
    }
    return this.emptyFieldError;
  }

  handleDotFilterChange(col: TFColumn, value: { name: string, only?: number[], contains?: number[] }) {
    const newFilter: Filter = { property: col.property, dots: value };
    this.filterChange(newFilter);
  }

  handleFilterChange(col: TFColumn, event: any) {
    const newFilter: Filter = { property: col.property, value: event };
    this.filterChange(newFilter);
  }

  handleBooleanFilterChange(col: any, value: number) {
    const newFilter: Filter = { property: col.property, state: value === 1 ? true : value === 2 ? false : undefined };
    this.filterChange(newFilter);
  }

  filterChange(newFilter: Filter) {
    const result = this.filterHelper.applyNewFilter(
      this.data,
      this.appliedFilters,
      newFilter,
      this.queryParams);
    this.filteredData = result.filteredData;
    this.appliedFilters = result.newFilters;
    this.sort(this.defaultSortBy);
  }

  rangeKeyUp($event, column: TFColumn) {
    $event.target.value = this.fixIvalidRange($event.target.value, column);
  }

  removeRangeFilter(property) {
    const filter: Filter = this.appliedFilters.find(x => x.property === property);
    if (filter) {
      filter.range = '';
      this.filterChange(filter);
    }
  }

  sendCustomEvent($event) {
    this.customEvent.emit($event);
  }

  downloadCSV() {
    let data: string, filename: string, link: HTMLAnchorElement;
    const csv = this.getCSV();
    if (csv === null) { return; }
    filename = `export${Date.now()}.csv`;
    data = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link = document.createElement('a');
    document.body.appendChild(link);
    link.setAttribute('type', 'hidden');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  async copyCSV() {
    const csv = this.getCSV();
    copyToClipboard(csv);
    this.notificationsService.success('Copied!');
  }

  getCSV() {
    return this.listTocsv.generateCSVString(this.filteredData, this.columns);
  }

  setDuration(entity, property, $event, update = false) {
    if ($event !== this.transformationsService.calculateDuration(this.transformationsService.getPropertyValue(entity, property))) {
      const strings = $event.match(/.{2}/g);
      const duration = ((+strings[0] * 3600) + (+strings[1] * 60) + (+strings[2])) * 1000;
      if (duration !== NaN) { this.setPropertyValue(entity, property, duration, false, update); }
    }
  }

  createRouterLink(col, entity) {
    let routerLink: string = col.link.template;
    col.link.properties.forEach(property => {
      routerLink = routerLink.replace(`{${property}}`, this.transformationsService.getPropertyValue(entity, property));
    });
    return routerLink;
  }

  execute($event) {
    this.hideManageColumnsModal = true;
    if ($event.apply) {
      this.columns = $event.shown;
      this.hiddenColumns = $event.hidden;
    }
  }

  wasClosed() {
    this.hideManageColumnsModal = true;
    this.hideBulkDeleteModal = true;
  }

  openlink(link: string) {
    window.open(link);
  }

  rowClicked(entity: any, col: any, $event: any) {
    const el: HTMLElement = $event.target;
    const notInlineEditorButton = col.type === TFColumnType.text
      && el.tagName.toLowerCase() !== 'input'
      && el.tagName.toLowerCase() !== 'button'
      && el.tagName.toLowerCase() !== 'path'
      && el.tagName.toLowerCase() !== 'svg'
      && el.tagName.toLowerCase() !== 'fa-icon';
    const notClickableElement = col.type !== TFColumnType.link
      && col.type !== TFColumnType.externalLink
      && col.type !== TFColumnType.longtext
      && col.type !== TFColumnType.autocomplete
      && !col.link;
    const notEditable = !col.editable || this.notEditableByProperty(entity, col) || el.classList.contains('ft-cell');

    const canClick = (notInlineEditorButton) || (notClickableElement && notEditable);

    if (canClick) {
      this.rowClick.emit(entity);
    }
  }

  notEditableByProperty(entity: any, col: TFColumn) {
    if (col.notEditableByProperty) {
      if (typeof col.notEditableByProperty.value === 'boolean') {
        const currentBoolValue = !!this.transformationsService.getPropertyValue(entity, col.notEditableByProperty.property);
        return currentBoolValue === col.notEditableByProperty.value;
      }
      const currentValue = this.transformationsService.getPropertyValue(entity, col.notEditableByProperty.property);
      return currentValue === col.notEditableByProperty.value;
    }
    return false;
  }
}
