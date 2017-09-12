define([
    'knockout-plus',
    'numeral',
    'kb_common/html'
], function(
    ko,
    numeral,
    html
) {
    'use strict';

    var t = html.tag,
        p = t('p'),
        div = t('div');

    function viewModel(params) {
        if (params.vm.termRelations().reference.terms.length === 0) {
            return {
                displayable: false,
                message: 'Cannot display without reference term'
            };
        }

        if (params.vm.termRelations().kbase.terms.length === 0) {
            return {
                displayable: false,
                message: 'Cannot display without kbase term'
            };
        }

        var config = {
            x: 150,
            y: 150,
            width: 300,
            height: 300,
            fontFamily: 'monospace',
            fontSize: 12,
            radius: 80,
            minRadius: 50,
            radialLength: 100,
            radialWidth: 4,
            ringWidth: 10,
            sectorCount: ko.observable(5),
            tickTheta: 0.05,
            tickLength: 10, // in pixels
            ringLayout: ['reference', 'kbase', 'fitness', 'expression'],
            leftMargin: 10,
            goConfig: {
                reference: {
                    label: 'Ref',
                    // black
                    color: [0, 0, 0],
                },
                kbase: {
                    label: 'Kbase',
                    // orange
                    color: [249, 124, 0]
                },
                fitness: {
                    label: 'Fitness',
                    // green
                    color: [33, 140, 56]
                },
                expression: {
                    label: 'Expression',
                    // purple
                    color: [130, 61, 142]
                }
            }
        };
        return {
            displayable: true,
            config: config,
            vm: params.vm
        };
    }

    function buildDisplay() {
        return div([
            div({
                dataBind: {
                    component: {
                        name: '"reske/gene/dial"',
                        params: {
                            config: 'config',
                            vm: 'vm'
                        }
                    }
                }
            }),
            div({
                style: {
                    fontWeight: 'bold'
                }
            }, 'Legend'),
            div({
                dataBind: {
                    component: {
                        name: '"reske/gene/legend"',
                        params: {
                            config: 'config',
                            vm: 'vm'
                        }
                    }
                }
            })
        ]);
    }

    function buildError() {
        return div({

        }, [
            p('Sorry, cannot display the widget.'),
            p({
                dataBind: {
                    text: 'message'
                }
            })
        ]);
    }

    function template() {
        return div([
            '<!-- ko if: displayable -->',
            buildDisplay(),
            '<!-- /ko -->',
            '<!-- ko ifnot: displayable -->',
            buildError(),
            '<!-- /ko -->'
        ]);
    }

    function templatex() {
        return buildDisplay();
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});