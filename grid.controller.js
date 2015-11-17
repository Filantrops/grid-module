'use strict';

var Grid = angular.module('gridModule', ['ngStorage']);
Grid.controller('GridController', ['$scope', '$filter', '$attrs', '$element', 'dataService', 'ngDialog','$localStorage', '$state', GridController]);
function GridController($scope, $filter, $attrs, $element, dataOp, ngDialog, $localStorage, $state) {
    var grid = this;

    //VARIABLES
    grid.collapseMainData = false;
    grid.collapseWorkersData = true;
    grid.collapseFinanseData = true;
    grid.rows = [];
    grid.checkedRows = {};
    grid.checked = false;
    grid.spinner = false;
    grid.attrSaveFilters = $attrs.saveFilters;
    grid.attrModule = $attrs.module;
    grid.last_page = 1;
    grid.page = 1;
    grid.total = null;
    grid.selected = 0;
    grid.sort = {
        reversed: {},
        sort_key: null
    };

    Object.size = function (obj) {
        var size = 0;

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                size++;
            }
        }

        return size;
    };

    if ($attrs.perPage) {
        grid.per_page = $attrs.perPage;
    } else {
        grid.per_page = 20;
    }

    grid.static_filters = {};
    grid.static_custom_filters = {};

    grid.params = {
        order_by: 'id',
        order_dir: 'asc',
        filters: {},
        custom_filters: {}
    };

    //METHODS
    grid.init = init;
    grid.loadData = loadData;
    grid.sortBy = sortBy;
    grid.filter = filter;
    grid.resetFilters = resetFilters;
    grid.pagainate = pagainate;
    grid.spinnerOn = spinnerOn;
    grid.spinnerOff = spinnerOff;
    grid.getCheckState = getCheckState;
    grid.checkAll = checkAll;
    grid.addRemoveCheckedObject = addRemoveCheckedObject;
    grid.addCheckedObject = addCheckedObject;
    grid.removeCheckedObject = removeCheckedObject;
    grid.setGridParams = setGridParams;
    grid.changePerPage = changePerPage;
    grid.uncheckAll = uncheckAll;
    grid.updateCount = updateCount;
    grid.showAdvancedSearch = showAdvancedSearch;
    grid.intersect = intersect;
    grid.saveFilters = saveFilters;
    grid.getFilters = getFilters;
    grid.exportData = exportData;

    grid.keyDown = function (event) {
        if (event.keyCode == 13)
            filter();
    };

    //LISTENERS AND WATCHERS
    $scope.$on('refresh_grid', function (event, args) {
        if (args == $attrs.alias) {
            loadData();
        }
    });

    $scope.$on('set_filters', function (event, args) {
        if (args.alias == $attrs.alias) {
            if (args.filters) {
                grid.params.filters = angular.extend(grid.params.filters, args.filters);
            }
            if (args.custom_filters) {
                grid.params.custom_filters = angular.extend(grid.params.custom_filters, args.custom_filters);
            }
            filter();
        }
    });

    $scope.$on('set_static_filters', function (event, args) {
        if (args.alias == $attrs.alias) {
            if (args.filters) {
                grid.static_filters = args.filters;
            }
            if (args.custom_filters) {
                grid.static_custom_filters = args.custom_filters;
            }
            filter();
        }
    });

    function saveFilters() {
        if(grid.attrSaveFilters) {
            if (!$localStorage["user_0"]) {
                $localStorage["user_0"] = {};
            }
            if (!$localStorage["user_0"].nzdis_grid_filters) {
                $localStorage["user_0"].nzdis_grid_filters = {};
            }
            var filterCache = $localStorage["user_0"].nzdis_grid_filters;
            if (!filterCache[$state.current.name + "_" + $attrs.alias]) {
                filterCache[$state.current.name + "_" + $attrs.alias] = {search: ""};
            }
            var currFC = filterCache[$state.current.name + "_" + $attrs.alias];
            currFC.search = grid.params.search;
        }
    }

    function getFilters() {
       if(grid.attrSaveFilters) {
           if ($localStorage["user_0"] && $localStorage["user_0"].nzdis_grid_filters && $localStorage["user_0"].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias]) {
               if ($localStorage["user_0"].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias].search) {
                   grid.params.search = $localStorage["user_0"].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias].search;
               }
           }
       }
    }

    function setGridParams(params) {
        grid.gridParams = params;
        grid.item = params.catalog_name;
        grid.create_function = params.create_function;
    }

    function showAdvancedSearch() {
        ngDialog.open({
            template: 'advancedSearchModal',
            className: 'ngdialog-theme-default theme-normal',
            scope: $scope
        });
    }

    //REALISATION
    function init() {
        getFilters();
        loadData();
    }

    function intersect(a, b) {
        var t;
        if (b.length > a.length)
            t = b, b = a, a = t; // indexOf to loop over shorter
        return a.filter(function (e) {
            if (b.indexOf(e) !== -1)
                return true;
        });
    }

    function changePerPage(per_page) {
        grid.page = 1;
        grid.per_page = per_page;
        loadData();
    }

    function updateCount() {
        grid.selected = Object.size(grid.checkedRows);
    }

    function addRemoveCheckedObject(object, status) {
        if(status) {
            grid.addCheckedObject(object);
        } else {
            grid.removeCheckedObject(object.id);
        }
        grid.updateCount();
    }

    function addCheckedObject(object) {
        grid.checkedRows[object.id] = {
            checked: true,
            object: angular.copy(object),
            disabled: false
        };
    }

    function removeCheckedObject(objectId) {
        delete grid.checkedRows[objectId];
        grid.checked = false;
    }

    function loadData(spinner) {
        if (typeof (spinner) === 'undefined') {
            spinner = true;
        }
        if (spinner) {
            spinnerOn();
        }
        var params = grid.params;
        params.offset = (grid.page - 1) * grid.per_page;
        params.limit = grid.per_page;

        //for mock-ups
        params.start = (grid.page - 1) * grid.per_page;
        params.length = grid.per_page;

        //for mock-ups
        if ($attrs.dynamic) {
            grid.advanced_search_data = [];
            dataOp.getData(grid.attrModule, params).then(function(data) {
                grid.rows = data.rows;
                grid.total = data.total_count;

                if (data.export_link) {
                    grid.export_link = data.export_link;
                } else {
                    grid.export_link = null;
                }

                if (data.file_name) {
                    grid.file_name = data.file_name;
                } else {
                    grid.file_name = null;
                }

                angular.forEach(params.search, function (searchVal, searchKey) {
                    if (searchVal !== '' && grid.gridParams.columns) {
                        angular.forEach(grid.gridParams.columns, function (item) {
                            if (item.key == searchKey) {
                                grid.advanced_search_data.push({ key: item.text, value : searchVal, ref: searchKey});
                            }

                        });

                    }
                });

                getCheckState();
                spinnerOff();
            });
        } else {
            var data = dataOp.getData(grid.attrModule, params);
            grid.rows = data.data;
            grid.total = data.total;
            grid.export_link = null;
            grid.export_link = null;

            getCheckState();
            spinnerOff();
        }

    }

    function sortBy(key, sortable) {
        if (typeof (sortable) === 'undefined') {
            sortable = true;
        } else {
            sortable = eval(sortable);
        }
        if (sortable) {
            var params = grid.params;

            grid.sort.sort_key = key;

            if (params.order_by == key) {
                params.order_dir = params.order_dir == 'asc' ? 'desc' : 'asc';

                grid.sort.reversed[key] = params.order_dir == 'asc' ? false : true;
            } else {
                params.order_by = key;
                params.order_dir = 'asc';
                grid.sort.reversed[key] = false;
            }
            loadData();
        }
    }

    function filter() {
        grid.page = 1;
        saveFilters();
        loadData();
    }

    function resetFilters(filters) {
        if (typeof filters == 'undefined') {
            grid.params.filters = {};
            grid.params.custom_filters = {};
        } else {
            if (filters.filters) {
                filters.filters.forEach(function (filter) {
                    delete grid.params.filters[filter];
                });
            }
            if (filters.custom_filters) {
                filters.custom_filters.forEach(function (filter) {
                    delete grid.params.custom_filters[filter];
                });
            }
        }

        grid.filter();
    }

    function pagainate(page) {
        if (page === 'prev') {
            page = grid.page - 1;
        }
        if (page === 'next') {
            page = grid.page + 1;
        }
        if (page < 1) {
            page = 1;
        }
        if (page > grid.last_page) {
            page = grid.last_page;
        }
        grid.page = page;
        loadData();
    }

    function spinnerOn() {
        if (!grid.spinner) {
            // spinneris arī tērē resursus :)
            grid.spinner_timeout = setTimeout(function () {
                grid.spinner = true;
                grid.spinnerEl = $element.find('.spinner');
                grid.spinnerEl.addClass('whirl standard');
            }, 200);
        }
    }

    function spinnerOff() {
        if (grid.spinner) {
            grid.spinnerEl.removeClass('whirl standard');
            grid.spinner = false;
        }
        clearTimeout(grid.spinner_timeout);
    }

    function getCheckState() {
        var checked = true;
        grid.rows.forEach(function (row) {
            if (!grid.checkedRows[row.id]) {
                checked = false;
            }
        });
        grid.checked = checked;
    }

    function checkAll() {
        grid.checked = !grid.checked;
        grid.rows.forEach(function(row) {
            if ((typeof grid.checkedRows[row.id] == "undefined" || !grid.checkedRows[row.id].disabled)) {
                grid.addRemoveCheckedObject(row, grid.checked);
            }
        });
    }

    function uncheckAll() {
        grid.checkedRows = {};
        grid.updateCount();
    }

    function exportData(fileType) {
        dataOp.exportData(grid.attrModule, fileType, grid.checkedRows, grid.total);
    }

    init();
}
