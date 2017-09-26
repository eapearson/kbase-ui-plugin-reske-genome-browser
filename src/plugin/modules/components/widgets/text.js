define([
    'knockout-plus',
    'numeral',
    'kb_common/html'
], function (
    ko,
    numeral,
    html
) {
    'use strict';

    var t = html.tag,
        text = t('text');

    var unwrap = ko.utils.unwrapObservable;

    function viewModel(params) {
        var text = ko.pureComputed(function () {
            var text = {
                x: params.text.x,
                y: params.text.y,
                fontFamily: params.text.fontFamily,
                fontSize: params.text.fontSize,
                textAnchor: params.text.textAnchor,
                text: params.text.text
            };

            return text;
        });

        return {
            text: text
        };
    }

    function template() {
        return [
            '<!-- ko with: text -->',
            text({
                dataBind: {
                    attr: {
                        x: 'x',
                        y: 'y',
                        'font-family': 'fontFamily',
                        'font-size': 'fontSize',
                        'text-anchor': 'textAnchor'
                    },
                    text: 'text'
                }
            }),
            '<!-- /ko -->',
        ];
    }

    function component() {
        return {
            viewModel: viewModel,
            template: {
                svg: template()
            }
        };
    }
    return component;
});