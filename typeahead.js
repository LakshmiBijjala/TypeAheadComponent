(function () {
    "use strict";
    angular.module("PartnerCoSellWeb")
            .directive("typeaheadd", initTypeAhead);

    function initTypeAhead() {
        return {
            restrict: "E",
            templateUrl: "dist/app/templates/custom-typeahead.html",
            scope: {
                data: '=data',
                id: '=id',
                selectedItem: '=',
                selectCallback: '&',
                elementNotfound: '&',
                changeInputs: '&',
                selectedInputValue: '='
            },
            link: function (scope, element, attr, ctrl) {

                scope.nameToRender = (attr.nameToRender) ? attr.nameToRender : 'name';
                scope.idToRender = (attr.idToRender) ? attr.idToRender : 'id';

                scope.previousSelectedElement = '';
                scope.listheader = attr.listheader;
                var id = scope.id = attr.id;
                scope.currentElement = '';
                scope.count = 0;

                var inputElement = angular.element('.inputsearch');
                var popupElement = angular.element('.search-dropdown');


                scope.showOverLay = false;

                scope.inputKeydown = function (e) {
                    scope.changeInputs({ changedData: scope.selectedInputValue });
                    var elementFound = false;
                    if (e.keyCode != 9) {
                        if (e.keyCode == 40) {
                            scope.count++;
                            scope.setCurrent(scope.count);

                            var focusElement = angular.element('#' + scope.id).find('.search-dropdown').find('li:first-of-type').find('a');
                            focusElement.focus();
                            focusElement.addClass('.activeListItem');
                            e.preventDefault();

                        } else {

                            var searchValue = angular.lowercase(scope.selectedInputValue);
                            scope.showOverLay = true;

                            scope.finalList = [];

                            for (var i = 0, dataLen = scope.data.length; i < dataLen; i++) {
                                if (searchValue != '' && scope.data[i][scope.nameToRender] != Models.ErrorMessages.ProductNotFound && scope.data[i][scope.nameToRender] != Models.ErrorMessages.UnexpectedError) {
                                    scope.finalList.push(scope.data[i]);
                                    elementFound = true;
                                }
                            }
                        }
                    }


                };



                scope.finalList = scope.data;

                scope.focusNextElement = function (e, changedObj) {
                    if (e.keyCode == 40) { //up arrow to focus next list element
                        if (scope.data.length == scope.count) {
                            return;
                        } else {
                            scope.count++;
                            scope.setCurrent(scope.count);
                            angular.element('.activeListItem').next().find('a').addClass('.activeListItem');
                            angular.element('.activeListItem')[0].scrollIntoView(false);
                        }

                    } else if (e.keyCode == 13) { //enter key to select the value
                        scope.selectedItem = scope.data[scope.count - 1];
                        scope.selectedInputValue = scope.selectedItem[scope.nameToRender];
                        scope.showOverLay = false;
                        scope.selectCallback(false);
                    } if (e.keyCode == 38) { //down arrow to focus previous list elemtn
                        if (scope.count == 1) {
                            return;
                        } else {
                            scope.count--;
                            scope.setCurrent(scope.count);
                            angular.element('.activeListItem').prev().find('a').addClass('.activeListItem');
                            angular.element('.activeListItem')[0].scrollIntoView(false);
                        }

                    }
                    e.preventDefault();
                    e.stopPropagation();
                };

                element.on('keydown', function (e) {
                    if (e.keyCode == 9) {
                        scope.showOverLay = false;
                    }
                });


                var setSelectedValue = function () {
                    if (scope.selectedItem != null && scope.selectedItem != undefined && scope.data != undefined && scope.selectedItem != undefined) {
                        for (var i = 0; i < scope.data.length; i++) {
                            if (scope.data[i][scope.idToRender] == scope.selectedItem.id) {
                                scope.selectedItem = { 'name': scope.data[i][scope.nameToRender], 'id': scope.data[i][scope.idToRender] };
                                scope.previousSelectedElement = scope.data[i];
                                scope.selectedInputValue = scope.data[i][scope.nameToRender];
                            }
                        }
                    }
                };

                scope.listItemclick = function (changedObj) {

                    scope.selectedItem = changedObj;
                    scope.previousSelectedElement = changedObj;
                    scope.selectedInputValue = changedObj[scope.nameToRender];
                    scope.showOverLay = false;
                    scope.selectCallback({ selectedProduct: scope.selectedItem });

                };

                scope.dropdownIconclick = function (e) {
                    if (attr.disabledmode == "false" || !attr.disabledmode) {
                        scope.finalList = scope.data;
                        scope.showOverLay = !scope.showOverLay;
                        e.stopPropagation();
                    }
                };

                angular.element('body').on('click', function (event) {
                    if (scope.showOverLay) {
                        scope.showOverLay = false;
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }
                });

                scope.$watch('selectedInputValue', function () { return $('.search-dropdown').is(':visible'); }, function (val) {

                    $('.search-dropdown-top').removeClass('search-dropdown-top');
                    if (val == true) {
                        scope.checkOverFlow();
                    }

                });
                scope.checkOverFlow = function () {
                    var $elem = $('.search-dropdown').not('.ng-hide');


                    var $window = $('.wrapdeal-left');

                    var docViewTop = $window.scrollTop();
                    var docViewBottom = docViewTop + $window.height();

                    var elemTop = $elem.offset().top;
                    var elemBottom = elemTop + $elem.height();

                    if (((docViewTop < elemTop) && (docViewBottom > elemBottom + 350))) {
                        $($elem[0]).removeClass('search-dropdown-top');
                    } else {
                        $($elem[0]).addClass('search-dropdown-top');
                    }
                };
                scope.checkOverFlow();
                setSelectedValue();

                scope.setCurrent = function (index) {
                    scope.currentElement = index;
                };

                scope.isCurrent = function (index) {
                    if (index == scope.currentElement) {
                        return true;
                    } else {
                        return false;
                    }
                };
                scope.$watch('data', function (newValue, oldValue) {
                    scope.data = newValue;
                    var searchValue = angular.lowercase(scope.selectedInputValue);

                    scope.finalList = [];
                    scope.errorList = {};

                    for (var i = 0, dataLen = scope.data.length; i < dataLen; i++) {
                        if (scope.data[i][scope.nameToRender] != Models.ErrorMessages.ProductNotFound && scope.data[i][scope.nameToRender] != Models.ErrorMessages.UnexpectedError) {
                            scope.finalList.push(scope.data[i]);
                        }
                        else if ((scope.data[i][scope.nameToRender].indexOf(Models.ErrorMessages.ProductNotFound) == 0) || (scope.data[i][scope.nameToRender].indexOf(Models.ErrorMessages.UnexpectedError) == 0)) {
                            scope.errorList = scope.data[i];
                        }
                    }
                });


            }

        }
    }

})();
