import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { OnInit, AfterViewInit, OnDestroy, OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTable } from 'angular2-datatable';
import { ListToCsvService } from '../../services/listToCsv.service';
import { DatepickerOptions } from 'custom-a1qa-ng2-datepicker';
import * as enLocale from 'date-fns/locale/en';
import { TransformationsService } from '../../services/transformations.service';

@Component({
  selector: 'table-filter',
  templateUrl: './table.filter.component.html',
  styleUrls: ['./table.filter.component.css'],
  providers: [
    ListToCsvService,
    TransformationsService
  ]
})
export class TableFilterComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input() data: any[];
  @Input() columnManagement = true;
  @Input() columns: any[];
  @Input() hiddenColumns: any[] = [];
  @Input() defaultSortBy: { property: string, order: string };
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

  @Output() createEntity = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() action = new EventEmitter();
  @Output() customEvent = new EventEmitter();
  @Output() rowClick = new EventEmitter();
  @Output() shownData = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() bulkChanges = new EventEmitter();

  @ViewChild(DataTable) datatable: DataTable;

  optionsFrom: DatepickerOptions = {
    locale: enLocale,
    minYear: new Date().getFullYear(),
    allowEmpty: true,
    displayFormat: 'DD/MM/YY',
    barTitleFormat: 'MMMM YYYY',
    firstCalendarDay: 1,
    displayIfEmpty: 'From Any'
  };

  optionsTo: DatepickerOptions = {
    locale: enLocale,
    minYear: new Date().getFullYear(),
    allowEmpty: true,
    displayFormat: 'DD/MM/YY',
    barTitleFormat: 'MMMM YYYY',
    firstCalendarDay: 1,
    displayIfEmpty: 'To Any'
  };

  passwordError = 'Password does not match the Confirm Password.';
  emptyFieldError = 'Fill all required fields';
  emailFieldError = 'Email should be equal to this pattern: example@domain.com';
  activePage = 1;
  durationMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
  filteredData: any[];
  showCreation = false;
  appliedFilters: any[] = [];
  newEntity: {} = {};
  bulkChangeEntity: {} = {};
  confirm: string;
  lastSelectedRow = 0;
  errorMessage: string;
  hideManageColumnsModal = true;
  animate = false;
  timerToken: NodeJS.Timer;
  timer: NodeJS.Timer;
  delay = 400;
  prevent = false;
  selectAll = false;

  constructor(
    private listTocsv: ListToCsvService,
    private route: ActivatedRoute,
    private router: Router,
    private transformationsService: TransformationsService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activePage = +params['page'] || this.activePage;
      this.rowsOnPage = +params['rows'] || this.rowsOnPage;
      this.lastSelectedRow = +params['selectedRow'] || this.lastSelectedRow;
      this.applyFilters();
    });

    if (this.allowDelete || this.allowCreate || this.allowBulkUpdate) {
      this.columns.push({ name: 'Action', property: 'action', type: 'button', editable: true });
    }
    if (this.allowBulkUpdate) {
      this.columns.unshift({ name: 'Selector', property: 'ft_select', type: 'selector', editable: true, class: 'fit' });
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

  toggleSelectAll(isSelected: boolean) {
    this.filteredData.forEach(entity => entity.ft_select = isSelected);
  }

  bulkUpdate() {
    const entitiesToUpdate = this.filteredData.filter(entity => entity.ft_select === true || entity.ft_select === 1);
    entitiesToUpdate.forEach(entity => {
      for (const property in this.bulkChangeEntity) {
        if (property) {
          entity[property] = this.bulkChangeEntity[property];
        }
      }
    });

    this.bulkChanges.emit(entitiesToUpdate);
  }

  hasSelectedRows() {
    return this.filteredData.find(entity => entity.ft_select === true || entity.ft_select === 1) !== undefined;
  }

  refreshAlways() {
    clearTimeout(this.timer);
    this.prevent = true;
    this.animate = true;
    this.timerToken = setInterval(() => this.refresh.emit(), 5000);
  }

  ngOnDestroy() {
    clearInterval(this.timerToken);
  }

  ngAfterViewInit() {
    this.setNewPage(this.activePage, this.rowsOnPage);
    if (this.defaultSortBy) { this.sort(this.defaultSortBy); }
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

  sort(sorter: { property: string, order: string }) {
    if (sorter) {
      this.defaultSortBy = sorter;
      this.transformationsService.sort(this.filteredData, sorter);
    }
  }

  manageColumns() {
    this.hideManageColumnsModal = false;
  }

  isHidden(entity: any, proprty: string): boolean {
    if (this.hide) {
      const hide = this.hide(entity, proprty);
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

  handleRangeFilterChange(col, $event, type) {
    let el;
    if (this.appliedFilters.length > 0) {
      el = this.appliedFilters.find(x => x.property === col.property);
    }
    if (!el) {
      el = { property: col.property };
      this.appliedFilters.push(el);
    }
    let ranges: any[] = [];
    ranges = el.range && el.range !== '' ? el.range.split(',') : '0,100'.split(',');

    if (type === 'from') {
      ranges[0] = this.validateRange($event);
    }
    if (type === 'to') {
      ranges[1] = this.validateRange($event);
    }
    el.range = ranges.join(',');
    this.setParams(el);
  }

  validateRange(range) {
    range = +range < 0 ? 0 : range;
    range = +range > 100 ? 100 : range;
    return range;
  }

  invalidRange(col) {
    let el;
    if (this.appliedFilters.length > 0) {
      el = this.appliedFilters.find(x => x.property === col.property);
    }
    if (el) {
      const ranges = el.range.split(',');
      return (+ranges[0] > +ranges[1]);
    }
    return false;
  }

  rangeFilterData(property, type) {
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

  getFilterDate(property, value) {
    if (this.appliedFilters.length > 0) {
      const filter = this.appliedFilters.find(x => x.property === property);
      return filter ? filter[value] : undefined;
    }
  }

  msFilter(property, selectedArray: any[], idProperty?: string) {
    let el;
    if (this.appliedFilters.length > 0) {
      el = this.appliedFilters.find(x => x.property === property);
    }
    if (!el) {
      el = { property: property };
      this.appliedFilters.push(el);
    }
    let options = '';
    selectedArray.forEach(element => {
      if (element && element.findEmpty) {
        options += 'null,';
      } else if (element && element.id) {
        options += `${element.id},`;
      } else if (element && this.transformationsService.getPropertyValue(element, property).id) {
        options += `${this.transformationsService.getPropertyValue(element, property).id},`;
      }
    });
    options = options.slice(0, -1);
    el.options = options;
    this.setParams(el);
  }

  rowClicked(entity, col, $event) {
    const el: HTMLElement = $event.target;
    if ((!col.editable || el.classList.contains('ft-cell')) && col.type !== 'link' && col.type !== 'long-text' && !col.link) {
      const queryParam = {};
      const val = this.transformationsService.getPropertyValue(entity, 'id');
      queryParam['selectedRow'] = val;
      this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' }).then(() => {
        this.rowClick.emit(entity);
      });
    }
  }

  msFilterData(col) {
    const filter = this.appliedFilters.find(x => {
      if (col['objectWithId']) { return x.property === col.objectWithId; }
      if (col['entity']) { return x.property === col.entity; }
      return x.property === col.property;
    });

    let selectedOpts = [];
    if (filter && filter.options) {
      const selectedOptIds = filter.options.split(',');
      selectedOpts = col.values.filter(x => {
        return selectedOptIds.find(y => (x.id ? x.id : this.transformationsService.getPropertyValue(x, filter.property).id) === +y);
      });
    }
    return selectedOpts;
  }

  textFilterData(property) {
    const filter = this.appliedFilters.find(x => x.property === property);
    return filter ? filter.value : '';
  }

  lookupFilterData(property, entity) {
    const filter = this.appliedFilters.find(x => x.property === property);
    return filter ? filter.value : '';
  }

  toggleCreation() {
    this.showCreation = !this.showCreation;
  }

  dateFilterUpdate($event) {
    let el;
    if (this.appliedFilters.length > 0) {
      el = this.appliedFilters.find(x => x.property === $event.property);
    }
    if (!el) {
      el = { property: $event.property };
      this.appliedFilters.push(el);
    }
    if ($event.hasOwnProperty('from')) {
      el['from'] = $event.from ? new Date(new Date($event.from).setHours(0, 0, 0, 0)) : undefined;
    } else if ($event.hasOwnProperty('to')) {
      el['to'] = $event.to ? new Date(new Date($event.to).setHours(23, 59, 59, 99)) : undefined;
    }
    this.setParams(el);
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

  setPropertyValue(entity: any, property: string, value, creation?: boolean, update: boolean = true) {
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
    this.columns.forEach(element => {
      switch (element.type) {
        case 'text':
          messages.push(this.isTextValid(element.property));
          break;
        case 'lookup-autocomplete':
        case 'lookup-colored':
          messages.push(this.isLookupValid(element.property));
          break;
        case 'email':
          messages.push(this.isEmailValid(element.property));
          break;
        case 'password':
          messages.push(this.isPasswordValid(element.property));
          break;
      }
    });
    messages = messages.filter((v, i, a) => v !== '' && a.indexOf(v) === i);

    this.errorMessage = messages.join(', ');

    return this.errorMessage === '';
  }

  isTextValid(property: string): string {
    if (this.newEntity[property]) {
      if (this.newEntity[property] !== '') {
        return '';
      }
    }
    return this.emptyFieldError;
  }

  isPasswordValid(property: string): string {
    if (this.newEntity[property] && this.newEntity[property] !== '') {
      if (this.newEntity[property] === this.confirm) {
        return '';
      }
      return this.passwordError;
    }
    return this.emptyFieldError;
  }

  isEmailValid(property: string): string {
    const value = this.transformationsService.getPropertyValue(this.newEntity, property);
    if (value && value !== '') {
      const regExp = new RegExp('(.+@.+[.][A-z]+)');
      return regExp.test(this.newEntity[property]) ? '' : this.emailFieldError;
    }
    return this.emptyFieldError;
  }

  isLookupValid(property: string): string {
    const value = this.transformationsService.getPropertyValue(this.newEntity, property);
    if (value && value !== '') {
      return '';
    }
    return this.emptyFieldError;
  }


  handleFilterChange(col, $event) {
    this.appliedFilters = this.appliedFilters.filter(x => x.property !== col.property);
    const filter = { property: col.property, value: $event };
    this.appliedFilters.push(filter);
    this.setParams(filter);
  }

  applyFilters() {
    if (this.queryParams) {
      this.readParams();
      this.filteredData = this.data;
      this.appliedFilters.forEach(element => {
        this.filteredData = this.fitData(this.filteredData, element);
      });
    }
    this.sort(this.defaultSortBy);
    this.shownData.emit(this.filteredData);
  }

  fitData(data: any[], filter) {
    if (filter.property !== '' && filter.value !== '') {
      if (filter.hasOwnProperty('value')) {
        return data.filter(x => {
          const val = this.transformationsService.getPropertyValue(x, filter.property);
          if (val) {
            if (val.hasOwnProperty('text')) {
              return val.text.toString().toLowerCase().includes(filter.value.toLowerCase());
            }
            return val.toString().toLowerCase().includes(filter.value.toLowerCase());
          }
          return false;
        });
      } else if (filter.hasOwnProperty('from') || filter.hasOwnProperty('to')) {
        return this.filterDate(data, filter);
      } else if (filter.hasOwnProperty('options')) {
        return this.filterMS(data, filter);
      } else if (filter.hasOwnProperty('range')) {
        return this.filterRange(data, filter);
      } else {
        return data;
      }
    } else { return data; }
  }

  filterMS(filteredData, filter) {
    let data = filteredData;
    if (filter.options) {
      const selectedOpts: any[] = filter.options.split(',');
      data = filteredData.filter(x => {
        const propertyValue = this.transformationsService.getPropertyValue(x, filter.property);
        if (propertyValue) {
          return Array.isArray(propertyValue)
            ? selectedOpts.some(y => propertyValue.find(z => z.id === +y))
            : selectedOpts.every(y => propertyValue.id === +y);
        }
        return selectedOpts.some(y => y === 'null');
      });
    }

    return data;
  }

  filterRange(filteredData, filter) {
    let data = filteredData;
    if (filter.range) {
      const ranges = filter.range.split(',');
      data = filteredData.filter(x => (ranges[0] ? +ranges[0] <= x[filter.property] : true)
        && (ranges[1] ? x[filter.property] <= +ranges[1] : true));
    }
    return data;
  }

  rangeKeyDown($event) {
    $event.target.value = this.validateRange($event.target.value);
  }

  removeRangeFilter(property) {
    const filter = this.appliedFilters.find(x => x.property === property);
    if (filter) {
      filter.range = '';
      this.setParams(filter);
    }
  }

  filterDate(data: any[], filter) {
    const from = filter.from;
    const to = filter.to;
    if (!from && !to) {
      return data;
    }

    return data.filter(x => {
      const val = this.transformationsService.getPropertyValue(x, filter.property);
      if (val) {
        if (from && to) {
          return new Date(from) <= new Date(val) && new Date(val) <= new Date(to);
        } else if (from) {
          return new Date(from) <= new Date(val);
        } else {
          return new Date(val) <= new Date(to);
        }
      }
      return false;
    });
  }

  readParams() {
    if (this.queryParams) {
      this.route.queryParams.subscribe(params => {
        const filterKeys = Object.keys(params);
        this.appliedFilters = this.appliedFilters.filter(x => false);
        filterKeys.forEach(param => {
          if (param.startsWith('f_')) {
            this.readParam(params, param);
          }
        });
      });
    }
  }

  readParam(params, param) {
    if (param.endsWith('_from')) {
      const newString = param;
      const match = newString.match(/f_(.+)_from/)[1];
      let filter = this.appliedFilters.find(x => x.property === match);
      if (!filter) {
        filter = { property: match };
      }
      filter['from'] = params[param];
      this.appliedFilters.push(filter);
    } else if (param.endsWith('_to')) {
      const prop = param.match(/f_(.*)_to/)[1];
      let filter = this.appliedFilters.find(x => x.property === prop);
      if (!filter) {
        filter = { property: prop };
      }
      filter['to'] = params[param];
      this.appliedFilters.push(filter);
    } else if (param.endsWith('_opt')) {
      const prop = param.match(/f_(.*)_opt/)[1];
      let filter = this.appliedFilters.find(x => x.property === prop);
      if (!filter) {
        filter = { property: prop };
      }
      filter['options'] = params[param];
      this.appliedFilters.push(filter);
    } else if (param.endsWith('_rng')) {
      const prop = param.match(/f_(.*)_rng/)[1];
      let filter = this.appliedFilters.find(x => x.property === prop);
      if (!filter) {
        filter = { property: prop };
      }
      filter['range'] = params[param];
      this.appliedFilters.push(filter);
    } else {
      const prop = param.match(/f_(.*)/)[1];
      this.appliedFilters.push({ property: prop, value: params[param] });
    }
  }

  setParams(filter) {
    if (this.queryParams) {
      const queryParam = {};
      if (filter.value) {
        queryParam[`f_${filter.property}`] = filter.value;
      } else if (filter.from || filter.to) {
        filter.from
          ? queryParam[`f_${filter.property}_from`] = new Date(filter.from).toISOString()
          : queryParam[`f_${filter.property}_from`] = '';
        filter.to
          ? queryParam[`f_${filter.property}_to`] = new Date(filter.to).toISOString()
          : queryParam[`f_${filter.property}_to`] = '';
      } else if (filter.options) {
        queryParam[`f_${filter.property}_opt`] = filter.options;
      } else if (filter.range) {
        queryParam[`f_${filter.property}_rng`] = filter.range;
      } else {
        this.route.queryParams.subscribe(params => {
          const filterKeys = Object.keys(params);
          filterKeys.forEach(key => {
            if (!key.includes(filter.property)) {
              queryParam[key] = params[key];
            } else {
              queryParam[key] = '';
            }
          });
        });
      }
      this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' }).then(() => this.applyFilters());
    }
  }

  isLastSelected(entity) {
    if (this.redirect) {
      return this.transformationsService.getPropertyValue(entity, this.redirect.property) === this.lastSelectedRow;
    }
    return false;
  }

  sendCustomEvent($event) {
    this.customEvent.emit($event);
  }

  downloadCSV() {
    let data, filename, link;
    let csv = this.listTocsv.generateCSVString(this.filteredData, this.columns);
    if (csv === null) { return; }

    filename = `export${Date.now()}.csv`;

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    document.body.appendChild(link);
    link.setAttribute('type', 'hidden');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  setDuration(entity, property, $event, update = false) {
    if ($event !== this.transformationsService.calculateDuration(this.transformationsService.getPropertyValue(entity, property))) {
      const strings = $event.split(':');
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

  wasClosed($event) {
    this.hideManageColumnsModal = true;
  }

  openlink(link) {
    if (!link.startsWith('#')) {
      link = `#${link}`;
    }
    const win = window.open(link);
  }
}
