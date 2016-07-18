'use strict';

function setContainerHeight(elementArray, height) {
  angular.forEach(elementArray, function () {
    $(this).css('height', height);
  });
}

function findContainerMaxHeight(elementArray) {
  let maxHeight = 0;
  let height;

  angular.forEach(elementArray, function (element) {
    height = element.offsetHeight;

    if (height > maxHeight) {
      maxHeight = height;
    }
  });

  setContainerHeight(elementArray, height);
}

function setHeight() {
  return function (scope /*, element, attrs */) {
    if (scope.$last) {
      const $panel = angular.element('.panel');
      const $panelBody = angular.element('.panel-body').find('p');

      findContainerMaxHeight($panel, function () {
        findContainerMaxHeight($panelBody);
      });
    }
  };
}

angular
  .module('directive.setHeight', [])
  .directive('setHeight', setHeight);
