angular.module('rtmms.rosetta').controller('RosettaController', ['$scope', 'AuthService', 'RosettaService', 'dialogs', 'uiGridConstants', function($scope, AuthService, RosettaService, dialogs, uiGridConstants) {

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
            field: 'groups',
            cellTemplate: '<div class="ui-grid-cell-contents"><span>{{row.entity.groups | ArrayAsString }}</span></div>'
        },{
            name: 'refid',
            field: 'term.refid',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {

                if (row.entity.term !== undefined) {
                    if (row.entity.term.status === undefined) {

                        return 'red';
                    }
                    if (row.entity.term.status === "proposed") {
                        return 'blue';
                    }
                    if (row.entity.term.status === "ready") {
                        return 'green';
                    }
                    if (row.entity.term.status === "mapped") {
                        return 'orange';
                    }
                }
            }
        }, {
            name: 'cfCode10',
            field: 'term.cfCode10'
        }, {
            name: 'systematicName',
            field: 'term.systematicName'
        }, {
            name: 'commonTerm',
            field: 'term.commonTerm'
        }, {
            name: 'acronym',
            field: 'term.acronym'
        }, {
            name: 'termDescription',
            field: 'term.termDescription'
        }, {
            name: 'partition',
            field: 'term.partition'
        }, {
            name: 'units',
            field: 'units',
            cellTemplate: '<div class="ui-grid-cell-contents"><span class="bold">{{row.entity.unitGroups | EnumOrUnitGroupsAsString }}</span> <span>{{row.entity.units | UnitsAsString }}</span></div>',
            enableSorting: false
        }, {
            name: 'ucums',
            field: 'ucums',
            cellTemplate: '<div class="ui-grid-cell-contents"><span>{{row.entity | UcumsAsStringFromRosetta }}</div>',
            enableSorting: false
        }, {
            name: 'enums',
            field: 'enums',
            cellTemplate: '<div class="ui-grid-cell-contents"><span class="bold">{{row.entity.enumGroups | EnumOrUnitGroupsAsString }}</span> <span>{{row.entity.enums | EnumsAsString }}</span></div>',
            enableSorting: false
        }, {
            name: 'code10',
            field: 'term.code10'
        }, {
            name: 'vendorDescription',
            field: 'vendorDescription'
        }, {
            name: 'displayName',
            field: 'displayName'
        }, {
            name: 'vendorVmd',
            field: 'vendorVmd'
        }],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
                if (sortColumns.length === 0) {
                    paginationOptions.sort = null;
                } else {
                    paginationOptions.sort = {
                        column: sortColumns[0].colDef.field,
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
                            column: value.colDef.field,
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
        RosettaService.getRosettas({
            limit: paginationOptions.pageSize,
            skip: (paginationOptions.pageNumber - 1) * paginationOptions.pageSize,
            filters: paginationOptions.filters,
            sort: paginationOptions.sort
        }).then(function(result) {
            if (result !== null) {
                $scope.gridOptions.data = result.rosettas;
                $scope.gridOptions.totalItems = result.totalItems;
            }
        });

    };
    getPage();


    $scope.showAddCommentModal = function(rosetta) {
        RosettaService.showAddCommentModal(rosetta).then(function() {

        });
    };

    $scope.showEditRosettaModal = function(rosetta) {
        RosettaService.showEditRosettaModal(rosetta).then(function() {

        });
    };

}]);


angular.module('rtmms.rosetta').controller('CommentModalInstanceController', ['$scope', '$modalInstance', 'Restangular', 'rosetta', 'RosettaService', 'UnitService', 'AuthService', function($scope, $modalInstance, Restangular, rosetta, RosettaService, UnitService, AuthService) {




    var formDataInitial;
    $scope.user = AuthService.isLoggedIn();
    $scope.constraintType = 'units';
    
    //console.log($scope.user);

    UnitService.getUnitsAndUnitGroups().then(function(unitsAndUnitGroups) {
        $scope.unitsAndUnitGroups = unitsAndUnitGroups;
    });

     $scope.formData.comments.push({
            author : {
                _id:$scope.user._id,
                name : $scope.user.username
            },
            text:$scope.comment,
            data:''
        });
        console("here");
        console.log($scope.formData.comments);

    $scope.$watch('tags', function() {

        $scope.formData.tags = _.flatten(_.map($scope.tags, _.values));
    }, true);


    $scope.editmode = false;
    if (rosetta) {
        $scope.comments = rosetta.comments;
        $scope.formData = rosetta;

        $scope.formData.comments.push({
            author : {
                _id:$scope.user._id,
                name : $scope.user.username
            },
            text:$scope.comment,
            data:''
        });
        console("here");
        console.log($scope.formData.comments);
       
        formDataInitial = Restangular.copy(rosetta);
        $scope.editmode = true;

       

    } else {
        $scope.formData = {};
        $scope.editmode = false;
    }



    $scope.addRosetta = function() {
        console.log($scope.formrosetta.$invalid);
        if ($scope.formrosetta.$invalid) {
            return;
        }
        RosettaService.createRosetta($scope.formData);
        $modalInstance.dismiss('add');

    };

    $scope.editRosetta = function() {
        console.log($scope.formData);
        $modalInstance.close($scope.formData);
    };
   

    $scope.cancel = function() {

        $scope.formData = formDataInitial;

        $modalInstance.dismiss('cancel');
    };



}]);
