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
            if (!params.vm.termRelations() || params.vm.fetchingTermRelations()) {
                return {
                    loading: true,
                };
            }
            if (!params.vm.termRelations().reference.best_term) {
                return {
                    displayable: false,
                    message: 'Cannot display without User term'
                };
            }

            if (!params.vm.termRelations().kbase.best_term) {
                return {
                    displayable: false,
                    message: 'Cannot display without Orhtolog term'
                };
            }

            return {
                ready: true
            };
        });

        var config = {
            x: 100,
            y: 100,
            width: 200,
            height: 110,
            scale: 1.5,
            fontFamily: 'monospace',
            fontSize: 12,
            radius: 100,
            minRadius: 50,
            ringWidth: 10,
            sectorCount: ko.observable(5),
            tickTheta: 0.05,
            tickLength: 10, // in pixels
            ringLayout: ['fitness', 'expression'],
            leftMargin: 10,
            goConfig: {
                reference: {
                    label: 'User',
                    radial: {
                        length: 70,
                        width: 5
                    },
                    // black
                    color: [100, 100, 100],
                    alpha: 0.5,
                    description: 'The reference term'
                },
                kbase: {
                    label: 'Inferred',
                    radial: {
                        length: 80,
                        width: 5
                    },
                    // orange
                    color: [249, 124, 0],
                    alpha: 0.5,
                    description: 'The Inferred term'
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

        var legend = [{
                color: config.goConfig.reference.color,
                label: config.goConfig.reference.label
            },
            {
                color: config.goConfig.kbase.color,
                label: config.goConfig.kbase.label
            },
            {
                color: config.goConfig.fitness.color,
                label: config.goConfig.fitness.label
            },
            {
                color: config.goConfig.expression.color,
                label: config.goConfig.expression.label
            }
        ];

        var ui = {
            tooltip: ko.observable(),
            legend: legend
        };

        return {
            status: status,
            config: config,
            vm: params.vm,
            ui: ui
        };
    }

    function buildDisplayx() {
        return div({

        }, [
            div({
                dataBind: {
                    component: {
                        name: '"reske/gene/speedometer"',
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
                    fontSize: '120%',
                    marginBottom: '4px;'
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

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function (key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }

    function buildWidget() {
        return div({
            style: {
                display: 'flex',
                flex: '1 1 0px',
                flexDirection: 'row'
            }
        }, [
            div({
                style: {
                    flex: '1 1 0px'
                }
            }, div({
                dataBind: {
                    component: {
                        name: '"reske/gene/speedometer"',
                        params: {
                            config: 'config',
                            vm: 'vm',
                            ui: 'ui'
                        }
                    }
                }
            })),
            div({
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    alignItems: 'flex-end'
                }
            }, div({
                dataBind: {
                    component: {
                        name: '"reske/functional-profile/distance-widget-details"',
                        params: {
                            config: 'config',
                            vm: 'vm',
                            ui: 'ui'
                        }
                    }
                }
            }))
        ]);
    }

    function buildDisplay() {
        return div({
            style: {
                // display: 'flex',
                // flexDirection: 'column',
                flex: '1 1 0px'
            }
        }, [
            buildWidget(),
            // Legend row.
            div({
                style: {
                    flex: '1 1 0px',
                    padding: '8px'
                }
            }, [
                div({
                    style: {
                        fontWeight: 'bold',
                        fontSize: '120%',
                        marginBottom: '4px',
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
            ])
        ]);
    }

    function buildDisplayx() {
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
                            name: '"reske/gene/speedometer"',
                            params: {
                                config: 'config',
                                vm: 'vm',
                                ui: 'ui'
                            }
                        }
                    }
                })),
                div({
                    class: 'col-sm-6'
                }, div({
                    style: {
                        height: '170px',
                        position: 'relative'
                    }
                }, div({
                    dataBind: {
                        component: {
                            name: '"reske/functional-profile/distance-widget-details"',
                            params: {
                                config: 'config',
                                vm: 'vm',
                                ui: 'ui'
                            }
                        }
                    },
                    style: {
                        position: 'absolute',
                        bottom: '0',

                    }
                })))
            ]),
            div({
                style: {
                    fontWeight: 'bold',
                    fontSize: '120%',
                    marginBottom: '4px'
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

    function buildLoading() {
        return div({
            style: {
                margin: '1em',
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'rgba(224, 224, 224, 0.5)',
                border: '1px rgba(224, 224, 224, 0.5) solid'
            }
        }, [
            p([
                'Loading data...',
                html.loading()
            ])
        ]);
    }

    function template() {
        return div({
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            '<!-- ko if: status().ready -->',
            buildDisplay(),
            '<!-- /ko -->',
            '<!-- ko if: status().error -->',
            buildError(),
            '<!-- /ko -->',
            '<!-- ko if: status().loading -->',
            buildLoading(),
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