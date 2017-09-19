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
        p = t('p'),
        div = t('div');

    function viewModel(params) {

        // not too comfortable with this...
        var status = ko.pureComputed(function () {
            if (!params.vm.termRelations()) {
                return {
                    displayable: false,
                    message: 'term relations not ready yet, please select a gene...'
                };
            }
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

            return {
                displayable: true,
                message: ''
            };
        });

        var config = {
            x: 150,
            y: 150,
            width: 300,
            height: 300,
            fontFamily: 'monospace',
            fontSize: 12,
            radius: 80,
            minRadius: 30,
            ringWidth: 10,
            sectorCount: ko.observable(5),
            tickTheta: 0.05,
            tickLength: 10, // in pixels
            ringLayout: ['reference', 'kbase', 'fitness', 'expression'],
            leftMargin: 10,
            goConfig: {
                reference: {
                    label: 'Ref',
                    radial: {
                        length: 70,
                        width: 5
                    },
                    // black
                    color: [0, 0, 0],
                    description: 'The reference term'
                },
                kbase: {
                    label: 'KBase',
                    radial: {
                        length: 100,
                        width: 5
                    },
                    // orange
                    color: [249, 124, 0],
                    description: 'The KBase annotated term'
                },
                fitness: {
                    label: 'Fitness',
                    // green
                    color: [33, 140, 56],
                    description: 'The Fitness term'
                },
                expression: {
                    label: 'Expression',
                    // purple
                    color: [130, 61, 142],
                    description: 'The expression term'
                }
            }
        };

        var tooltipVm = {
            tooltip: ko.observable()
        };

        return {
            status: status,
            config: config,
            vm: params.vm,
            tooltipVm: tooltipVm
        };
    }

    function buildDisplayx() {
        return div({

        }, [
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
                    fontWeight: 'bold',
                    fontSize: '120%'
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

    function buildDisplay() {
        return div({
            class: 'container-fluid'
        }, [
            div({
                class: 'row'
            }, [
                div({
                    class: 'col-sm-6'
                }, div({
                    dataBind: {
                        component: {
                            name: '"reske/gene/dial"',
                            params: {
                                config: 'config',
                                vm: 'vm',
                                tooltipVm: 'tooltipVm'
                            }
                        }
                    }
                })),
                div({
                    class: 'col-sm-6'
                }, div({
                    dataBind: {
                        component: {
                            name: '"reske/functional-profile/distance-widget-details"',
                            params: {
                                config: 'config',
                                vm: 'vm',
                                tooltipVm: 'tooltipVm'
                            }
                        }
                    }
                }))
            ]),
            div({
                style: {
                    fontWeight: 'bold',
                    fontSize: '120%'
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
            style: {
                margin: '10px',
                padding: '10px',
                border: '1px red solid',
            }
        }, [
            p('Sorry, cannot display the widget.'),
            p({
                dataBind: {
                    text: 'status().message'
                }
            })
        ]);
    }

    function template() {
        return div([
            '<!-- ko if: status().displayable -->',
            buildDisplay(),
            '<!-- /ko -->',
            '<!-- ko ifnot: status().displayable -->',
            buildError(),
            '<!-- /ko -->'
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});