angular.module('stacks', [])
.controller('StacksController', ['$scope', 'Notifications', 'Pagination', 'StackService',
function ($scope, Notifications, Pagination, StackService) {
  $scope.state = {};
  $scope.state.selectedItemCount = 0;
  $scope.state.pagination_count = Pagination.getPaginationCount('stacks');
  $scope.sortType = 'Name';
  $scope.sortReverse = false;

  $scope.changePaginationCount = function() {
    Pagination.setPaginationCount('stacks', $scope.state.pagination_count);
  };

  $scope.order = function (sortType) {
    $scope.sortReverse = ($scope.sortType === sortType) ? !$scope.sortReverse : false;
    $scope.sortType = sortType;
  };

  $scope.selectItems = function (allSelected) {
    angular.forEach($scope.state.filteredStacks, function (stack) {
      if (stack.Checked !== allSelected) {
        stack.Checked = allSelected;
        $scope.selectItem(stack);
      }
    });
  };

  $scope.selectItem = function (item) {
    if (item.Checked) {
      $scope.state.selectedItemCount++;
    } else {
      $scope.state.selectedItemCount--;
    }
  };

  $scope.removeAction = function () {
    $('#loadingViewSpinner').show();
    var counter = 0;

    var complete = function () {
      counter = counter - 1;
      if (counter === 0) {
        $('#loadingViewSpinner').hide();
      }
    };

    angular.forEach($scope.stacks, function (stack) {
      if (stack.Checked) {
        counter = counter + 1;
        StackService.remove(stack)
        .then(function success() {
          Notifications.success('Stack deleted', stack.Name);
          var index = $scope.stacks.indexOf(stack);
          $scope.stacks.splice(index, 1);
        })
        .catch(function error(err) {
          Notifications.error('Failure', err, 'Unable to remove stack ' + stack.Name);
        })
        .finally(function final() {
          complete();
        });
      }
    });
  };

  function initView() {
    $('#loadingViewSpinner').show();

    StackService.stacks()
    .then(function success(data) {
      $scope.stacks = data;
    })
    .catch(function error(err) {
      $scope.stacks = [];
      Notifications.error('Failure', err, 'Unable to retrieve stacks');
    })
    .finally(function final() {
      $('#loadingViewSpinner').hide();
    });
  }

  initView();
}]);