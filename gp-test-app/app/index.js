(function () {
    "use strict";
    angular.module('pracujGP', [])
        .config(function ($locationProvider) {
            $locationProvider.html5Mode(true).hashPrefix('!');
        })
        .controller('gitHubApiController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
            $scope.predicate = '-updated_at';
            $scope.listLimit = 5;
            let timer;
            $scope.user = {
                userData: {},
                repoData: null,
                name: "",
                search: {
                    lastSearchedName: "",
                    delay: 1000,
                    gitHubUrl: "https://api.github.com/users/",
                    lookup: function (inputChanged) {
                        $scope.loading = true;
                        $scope.errorMessage = "";
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            repoSearch(inputChanged)
                        }, $scope.user.search.delay);
                    }
                }

            };

            $scope.userLoaded = false;
            $scope.reposLoaded = false;
            $scope.loading = $scope.user.name.length > 0;
            let repoSearch = function (inputChanged) {
                if (!(!$location.hash() || inputChanged))
                    $scope.user.name = $location.hash();
                if (!!$scope.user.name && $scope.user.name != $scope.user.search.lastSearchedName) {

                    $location.hash($scope.user.name);
                    $http.get($scope.user.search.gitHubUrl + $scope.user.name)
                        .then(
                            function successCallback(response) {
                                $scope.user.userData = response.data;
                                $scope.userLoaded = true;
                                loadProjects();
                            },
                            function errorCallback(response) {
                                $scope.userLoaded = false;
                                $scope.reposLoaded = false;
                                $scope.loading = false;
                                switch (response.status) {
                                    case 403:
                                        $scope.errorMessage = response.data.message;

                                        break;
                                    case 404:
                                        $scope.errorMessage = "User not found";
                                        break;
                                    default:
                                    //
                                }
                            }
                        );
                    $scope.user.search.lastSearchedName = $scope.user.name;
                }
            };

            $scope.userLoaded = false;

            let loadProjects = function () {
                $http.get($scope.user.userData.repos_url)
                    .then(
                        function successCallback(response) {
                            $scope.loading = false;
                            $scope.listLimit = Math.min(response.data.length, $scope.listLimit);
                            $scope.user.repoData = response.data;
                            $scope.reposLoaded = true;
                        },
                        function errorCallback(response) {
                            $scope.loading = false;
                            $scope.reposLoaded = false;
                        }
                    );
            };
            repoSearch();
        }])
        .directive('buildStatus', ['$http', function ($http) {
            return {
                restrict: 'E',
                template: `
                    <div class="col s12" ng-show="statuses.length>0">
                        <ul class="collection">
                            <li class="collection-item"
                                ng-repeat="status in statuses | orderBy:predicate:reverse"
                                ng-class-even="'blue lighten-5'">
                                <span>{{status.updated_at | date : "d MMM y" : timezone}}: {{status.state}}</span>
                                <p>
                                    {{status.description}}
                                </p>
                            </li>
                        </ul>
                    </div>
                `,
                replace: true,
                scope: {
                    repoName: "@",
                    userName: "@"
                },
                controller: function ($scope) {
                    let url = "https://api.github.com/repos/" + $scope.userName + "/" + $scope.repoName + "/commits/master/statuses";
                    $http({method: 'GET', url: url}).then(function (response) {
                        $scope.statuses = response.data;
                    }, function (response) {
                        $scope.statuses =[];
                        console.log(response);
                    });
                }
            }
        }]);
})();
