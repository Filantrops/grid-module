'use strict';

var Grid = angular.module('gridModule', ['ngStorage']);
Grid.controller('GridController', ['$scope', '$filter', '$attrs', '$element', 'dataService', 'ngDialog','$localStorage', '$state', '$rootScope', GridController]);
function GridController($scope, $filter, $attrs, $element, dataOp, ngDialog, $localStorage, $state, $rootScope) {
    var grid = this;

    //VARIABLES
    grid.collapseMainData = false;
    grid.collapseWorkersData = true;
    grid.collapseFinanseData = true;
    grid.rows = [];
    grid.gridParams = {};
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
    grid.deleteDataDialog = deleteDataDialog;
    grid.saveGridParam = saveGridParam;

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

    function deleteDataDialog(callBackFunc) {
        ngDialog.openConfirm({
            template: 'shared/grid/deleteDialog.html',
            className: 'ngdialog-theme-default dialog400',
            data: {
                count: grid.selected
            },
            scope: $scope
        }).then(function (value) {
            callBackFunc(grid.checkedRows).then(function(data) {
                if (data) {
                    grid.total = grid.total - Object.keys(grid.checkedRows).length;
                    if (grid.total <= 0) {
                        grid.total = 0;
                    } else {
                        var newLastPage = Math.ceil(grid.total / grid.per_page);

                        if (grid.page > newLastPage) {
                            grid.page = newLastPage;
                        }
                    }
                    grid.checkedRows = {};
                    loadData();
                }
            });
        });
    }

    function saveFilters() {
        var userId = $rootScope.currentUser ? $rootScope.currentUser.id : null;
        if (userId !== null) {
            if (grid.attrSaveFilters) {
                if (!$localStorage[userId]) {
                    $localStorage[userId] = {};
                }
                if (!$localStorage[userId].nzdis_grid_filters) {
                    $localStorage[userId].nzdis_grid_filters = {};
                }
                var filterCache = $localStorage[userId].nzdis_grid_filters;
                if (!filterCache[$state.current.name + "_" + $attrs.alias]) {
                    filterCache[$state.current.name + "_" + $attrs.alias] = {search: ""};
                }
                var currFC = filterCache[$state.current.name + "_" + $attrs.alias];
                currFC.search = grid.params.search;
            }
        }
    }

    function saveGridParam() {
        var userId = $rootScope.currentUser ? $rootScope.currentUser.id : null;
        if (userId !== null) {
            if (!$localStorage[userId]) {
                $localStorage[userId] = {};
            }

            if (!$localStorage[userId].nzdis_grid_filters) {
                $localStorage[userId].nzdis_grid_filters = {};
            }

            var filterCache = $localStorage[userId].nzdis_grid_filters;

            if (!filterCache[$state.current.name + "_" + $attrs.alias]) {
                filterCache[$state.current.name + "_" + $attrs.alias] = {
                    page: grid.page,
                    order_by: grid.params.order_by,
                    order_dir: grid.params.order_dir
                };
            } else {
                filterCache[$state.current.name + "_" + $attrs.alias].page = grid.page;
                filterCache[$state.current.name + "_" + $attrs.alias].order_by = grid.params.order_by;
                filterCache[$state.current.name + "_" + $attrs.alias].order_dir = grid.params.order_dir;
            }
        }
    }

    function getFilters() {
        var userId = $rootScope.currentUser ? $rootScope.currentUser.id : null;
        if (userId !== null) {
           if (grid.attrSaveFilters) {
               if ($localStorage[userId] && $localStorage[userId].nzdis_grid_filters && $localStorage[userId].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias]) {
                   if ($localStorage[userId].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias].search) {
                       grid.params.search = $localStorage[userId].nzdis_grid_filters[$state.current.name + "_" + $attrs.alias].search;
                   }
               }
           }
       }
    }

    function setGridParams(params) {
        grid.gridParams = params;

        var userId = $rootScope.currentUser ? $rootScope.currentUser.id : null;

        if (userId !== null) {
            if (!$localStorage[userId]) {
                $localStorage[userId] = {};
            }

            if (!$localStorage[userId].nzdis_grid_filters) {
                $localStorage[userId].nzdis_grid_filters = {};
            }
        }

        var filterCache = $localStorage[userId].nzdis_grid_filters;

        if (filterCache[$state.current.name + "_" + $attrs.alias] && filterCache[$state.current.name + "_" + $attrs.alias].order_by) {
            grid.params.order_by = filterCache[$state.current.name + "_" + $attrs.alias].order_by;
        } else {
            if (params.default_sort_col != null) {
                grid.params.order_by = params.default_sort_col;
            } else {
                grid.params.order_by = 'id';
            }
        }

        if (filterCache[$state.current.name + "_" + $attrs.alias] && filterCache[$state.current.name + "_" + $attrs.alias].order_dir) {
            grid.params.order_dir = filterCache[$state.current.name + "_" + $attrs.alias].order_dir;
        } else {
            if (params.default_sort_dir != null) {
                grid.params.order_dir = params.default_sort_dir;
            } else {
                grid.params.order_dir = 'asc';
            }
        }

        if (filterCache[$state.current.name + "_" + $attrs.alias] && filterCache[$state.current.name + "_" + $attrs.alias].page) {
            grid.page = filterCache[$state.current.name + "_" + $attrs.alias].page;
        } else {
            grid.page = 1;
        }

        grid.item = params.catalog_name;
        grid.create_function = params.create_function;
        loadData();
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
                grid.saveGridParam();
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
            }, function(response) {
                var userId = $rootScope.currentUser ? $rootScope.currentUser.id : null;
                var filterCache = $localStorage[userId].nzdis_grid_filters;
                delete filterCache[$state.current.name + "_" + $attrs.alias];
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
            saveGridParam();
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
        grid.checked = null;
    }

    function exportData(fileType) {
        dataOp.exportData(grid.attrModule, fileType, grid.checkedRows, grid.total, grid.params.search);
    }

    init();
}
