var SAMLChrome = angular.module('SAMLChrome', [])
	.directive('prettyPrint', function ($parse) {
		return {
			restrict: 'E',
			replace: true,
			transclude: false,
			scope: { data: '=data' },
			link: function (scope, element, attrs) {
				let data = scope.data;
				if (data === true) {
					data = '<i>true</i>';
				} else if (data === false) {
					data = '<i>false</i>';
				} else if (data === undefined) {
					data = '<i>undefined</i>';
				} else if (data === null) {
					data = '<i>null</i>';
				} else if (typeof data !== 'number') {
					data = $('<div>').text(data).html();
				}

				let $el = $('<div></div>');

				$el.html(data);

				element.replaceWith($el);
			}
		};
	})
	.directive('resizableColumns', function ($parse) {
		return {
			link: function (scope, element, attrs) {
				const options = {minWidth: 5};

				if ($(element).data('resizable-columns-sync')) {
					var $target = $($(element).data('resizable-columns-sync'));

					$(element).on('column:resize', function(event, resizable, $leftColumn, $rightColumn, widthLeft, widthRight)
					{
						var leftColumnIndex = resizable.$table.find('.rc-column-resizing').parent().find('td, th').index($leftColumn);

						var $targetFirstRow = $target.find('tr:first');

						$($targetFirstRow.find('td, th').get(leftColumnIndex)).css('width', widthLeft + '%');
						$($targetFirstRow.find('td, th').get(leftColumnIndex + 1)).css('width', widthRight + '%');

						$target.data('resizableColumns').syncHandleWidths();
						$target.data('resizableColumns').saveColumnWidths();
					});
				}

				$(element).resizableColumns(options);
			}
		};
	})
	.directive('scrollToNew', function ($parse) {
		return function(scope, element, attrs) {
			if (scope.showIncomingRequests && scope.$last) {
				const $container = $(element).parents('.data-container').first();
				const $parent = $(element).parent();

				$container.scrollTop($parent.height());
			}
		};
	});
