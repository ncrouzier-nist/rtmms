angular.module('rtmms.enum').controller('EnumValuesController', ['$scope', 'AuthService', 'EnumService', 'dialogs', function($scope, AuthService, EnumService, dialogs) {

    $scope.authService = AuthService;
    $scope.$watch('authService.isLoggedIn()', function(user) {
        $scope.user = user;
    });
    



var paginationOptions = {
        pageNumber: 1,
        pageSize: 25,
        sort: null,
        filters: null,
    };

    $scope.gridOptions = {
        enableFiltering: true,
        enableColumnResizing: true,
        paginationPageSizes: [25, 50, 75, 100],
        paginationPageSize: 25,
        useExternalPagination: true,
        useExternalSorting: true,
        useExternalFiltering: true,
        enableGridMenu: true,
        enableRowSelection: true,
        multiSelect: false,
        enableSelectAll: false,
        selectionRowHeaderWidth: 35,
        columnDefs: [{
            name: 'groups',
            cellTemplate: '<div class="ui-grid-cell-contents"><span>{{row.entity.enumGroups | EnumGroupsAsString }}</span></div>'
        }, {
            name: 'refid'
        }, {
            name: 'ecode10'
        }, {
            name: 'cfEcode10'
        }, {
            name: 'partition'
        }, {
            name: 'description'
        },{
            name: 'token'
        }, {
            name: 'systematicName'
        }, {
            name: 'commonTerm'
        }, {
            name: 'acronym'
        }, {
            name: 'termDescription'
        }],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
                if (sortColumns.length === 0) {
                    paginationOptions.sort = null;
                } else {
                    paginationOptions.sort = {
                        column: sortColumns[0].colDef.name,
                        value: sortColumns[0].sort.direction
                    };
                }
                getPage();
            });

            gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.pageSize = pageSize;
                getPage();
            });

            gridApi.core.on.filterChanged($scope, function() {
                var grid = this.grid;
                paginationOptions.filters = [];
                angular.forEach(grid.columns, function(value, key) {
                    if (value.filters[0].term) {
                        paginationOptions.filters.push({
                            column: value.colDef.name,
                            value: value.filters[0].term
                        });
                    }
                });
                getPage();
            });


            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                if (row.isSelected) {
                    $scope.selectedEntity = row.entity;
                } else {
                    $scope.selectedEntity = null;
                }
            });
        }
    };

    var getPage = function() {
        EnumService.getEnums({
            limit: paginationOptions.pageSize,
            skip: (paginationOptions.pageNumber - 1) * paginationOptions.pageSize,
            filters: paginationOptions.filters,
            sort: paginationOptions.sort
        }).then(function(result) {
            if (result !== null) {
                $scope.gridOptions.data = result.enums;
                $scope.gridOptions.totalItems = result.totalItems;
            }
        });

    };
    getPage();



}]);

