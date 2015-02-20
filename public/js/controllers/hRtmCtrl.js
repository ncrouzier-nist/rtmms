angular.module('rtmms.hRtm').controller('HarmonizedRosettaController', ['$scope', 'AuthService', 'dialogs', function($scope, AuthService, dialogs) {

    $scope.authService = AuthService;
    $scope.$watch('authService.isLoggedIn()', function(user) {
        $scope.user = user;
    });
    

   
}]);

angular.module('rtmms.hRtm').controller('HarmonizedRosettaModalInstanceController', ['$scope', '$modalInstance', 'rosetta',  function($scope, $modalInstance, rosetta) {


    $scope.editmode = false;
    if (result) {
        
    } else {
        

    }


    $scope.addResult = function() {
        if ($scope.time.hours === undefined) $scope.time.hours = 0;
        if ($scope.time.minutes === undefined) $scope.time.minutes = 0;
        if ($scope.time.seconds === undefined) $scope.time.seconds = 0;
        $scope.formData.time = $scope.time.hours * 3600 + $scope.time.minutes * 60 + $scope.time.seconds;

        var members = $.map($scope.formData.member, function(value, index) {
            return [value];
        });
        $scope.formData.member = members;



        $modalInstance.close($scope.formData);
    };

    $scope.editResult = function() {
        $modalInstance.close($scope.formData);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };






}]);
