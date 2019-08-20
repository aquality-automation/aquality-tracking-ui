import { ActivatedRoute, Router } from '@angular/router';
import { TransformationsService } from '../../services/transformations.service';

export class Filter {
    property: string;
    value?: string;
    from?: Date;
    to?: Date;
    options?: string;
    range?: string;
}

export class FilterHelper {
    transformations: TransformationsService;
    route: ActivatedRoute;
    router: Router;
    constructor(transformations: TransformationsService, route: ActivatedRoute, router: Router) {
        this.transformations = transformations;
        this.route = route;
        this.router = router;
    }

    getOrCreateFilter(property: string, appliedFilters: Filter[]): Filter {
        let filter: Filter;
        if (appliedFilters.length > 0) {
          filter = appliedFilters.find(x => x.property === property);
        }
        if (!filter) {
          filter = { property };
        }

        return filter;
    }

    updateAppliedFilters = (appliedFilters: Filter[], filter: Filter) => {
        appliedFilters = appliedFilters.filter((x: Filter) => x.property !== filter.property);
        if (filter.value || filter.options || filter.range || filter.from || filter.to) {
            appliedFilters.push(filter);
        }
        return appliedFilters;
    }

    addParams = (filter: Filter) => {
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
        this.router.navigate([], { queryParams: queryParam, queryParamsHandling: 'merge' });
    }

    filterData = (data: any[], filter: Filter) => {
        if (filter.property !== '' && filter.value !== '') {
            if (filter.hasOwnProperty('value')) {
                return data.filter(x => {
                    const val = this.transformations.getPropertyValue(x, filter.property);
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

    filterDate(data: any[], filter) {
        const from = filter.from;
        const to = filter.to;
        if (!from && !to) {
            return data;
        }

        return data.filter(x => {
            const val = this.transformations.getPropertyValue(x, filter.property);
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

    filterMS(filteredData: any[], filter: Filter) {
        let data = filteredData.slice();
        const selectedOpts: any[] = filter.options.split(',');
        data = filteredData.filter(x => {
            const propertyValue = this.transformations.getPropertyValue(x, filter.property);
            if (propertyValue) {
                return Array.isArray(propertyValue)
                    ? selectedOpts.some(y => propertyValue.find(z => z.id === +y))
                    : selectedOpts.every(y => propertyValue.id === +y);
            }
            return selectedOpts.some(y => y === 'null');
        });

        return data;
    }

    filterRange(filteredData: any[], filter: Filter) {
        let data = filteredData;
        if (filter.range) {
            const ranges = filter.range.split(',');
            data = filteredData.filter(x => (ranges[0] ? +ranges[0] <= x[filter.property] : true)
                && (ranges[1] ? x[filter.property] <= +ranges[1] : true));
        }
        return data;
    }

    applyNewFilter = (data: any[], appliedFilters: Filter[],
        newFilter: Filter, queryParams: boolean): { filteredData: any[], newFilters: Filter[] } => {
        const newFilters = this.updateAppliedFilters(appliedFilters, newFilter);

        if (queryParams) {
            this.addParams(newFilter);
        }
        return { filteredData: this.applyFilters(newFilters, data), newFilters };
    }

    applyFilters = (filtersToApply: Filter[], data: any[]) => {
        let filteredData = data.slice();
        filtersToApply.forEach((filter: Filter) => {
            filteredData = this.filterData(filteredData, filter);
        });

        return filteredData;
    }

  readFilterParams(queryParams): Filter[] {
    let filters: Filter[] = [];
    if (queryParams) {
      this.route.queryParams.subscribe(params => {
        const filterKeys = Object.keys(params);
        filterKeys.forEach(param => {
            filters = this.readFilterParam(params, param, filters);
        });
      });
    }

    return filters;
  }

  readFilterParam(parameters, parameter, filters: Filter[]) {
    const dateFrom = /f_(.+)_from/;
    const dateTo = /f_(.*)_to/;
    const options = /f_(.*)_opt/;
    const range = /f_(.*)_rng/;
    const value = /f_(.*)/;
    const filter: Filter = new Filter();

    if (dateFrom.test(parameter)) {
      filter.property = parameter.match(dateFrom)[1];
      filter.from = parameters[parameter];
    } else if (dateTo.test(parameter)) {
      filter.property = parameter.match(dateTo)[1];
      filter.to = parameters[parameter];
    } else if (options.test(parameter)) {
      filter.property = parameter.match(options)[1];
      filter.options = parameters[parameter];
    } else if (range.test(parameter)) {
      filter.property = parameter.match(range)[1];
      filter.range = parameters[parameter];
    } else if (value.test(parameter)) {
      filter.property = parameter.match(value)[1];
      filter.value = parameters[parameter];
    }

    if (filter) {
      return this.updateAppliedFilters(filters, filter);
    }
  }
}
