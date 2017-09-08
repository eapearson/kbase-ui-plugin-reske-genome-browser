define([
    'numeral',
    'knockout-plus',
    'kb_common/html'
], function(
    numeral,
    ko,
    html
) {
    'use string';

    var t = html.tag,
        div = t('div'),
        svg = t('svg'),
        table = t('table'),
        tr = t('tr'),
        td = t('td'),
        th = t('th'),
        input = t('input'),
        label = t('label');

    // COMPONENTS

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function(key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }

    function buildEditor() {
        return div([
            div({
                class: 'form'
            }, [
                div({
                    class: 'form-group'
                }, [
                    label('Sectors'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('#'),
                            td(input({
                                dataBind: {
                                    value: 'config.sectorCount'
                                },
                                class: 'form-control'
                            }))
                        ])
                    ])
                ]),
                div({
                    class: 'form-group'
                }, [
                    label('Radial 1'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('Label'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Color'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Value'),
                            td(input({
                                class: 'form-control'
                            }))
                        ])
                    ])
                ]),
                div({
                    class: 'form-group'
                }, [
                    label('Radial 2'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('Label'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Color'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Value'),
                            td(input({
                                class: 'form-control'
                            }))
                        ])
                    ])
                ])

            ])
        ]);
    }

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        function viewModel() {
            var config = {
                x: 150,
                y: 150,
                fontFamily: 'monspace',
                fontSize: 10,
                radius: 80,
                radialLength: 100,
                sectorCount: ko.observable(5)
            };

            var data = {
                reference: {
                    goterm: {
                        id: 'GO:0005447',
                        name: 'eukaryotic elongation factor-2 kinase activator activity',
                    }
                },
                kbase: {
                    goterm: {
                        id: 'GO:0003858',
                        name: 'toxin activity',
                        distance: 0.3676767707829466
                    },
                    types: {
                        // now each go term type can have multiple go term assignments with a p-value
                        fitness: [{
                            id: 'GO:0001731',
                            name: '11-deoxycortisol binding',
                            distance: 0.33,
                            pValue: 0.01
                        }, {
                            id: 'GO:0001732',
                            name: 'abc',
                            distance: 0.33,
                            pValue: 0.02
                        }, {
                            id: 'GO:0001733',
                            name: 'def',
                            distance: 0.33,
                            pValue: 0.06
                        }],
                        expression: [{
                            id: 'GO:0004316',
                            name: 'ADP binding',
                            distance: 0.6,
                            pValue: 0.03
                        }, {
                            id: 'GO:0004316',
                            name: 'xyz',
                            distance: 0.6,
                            pValue: 0.04
                        }, {
                            id: 'GO:0004316',
                            name: 'uvw',
                            distance: 0.6,
                            pValue: 0.03
                        }]
                    }
                }
            };

            return {
                config: config,
                radials: {
                    kbase: {
                        radial: {
                            x: config.x,
                            y: config.y,
                            angle: 0.23,
                            length: config.radialLength,
                            width: 4,
                            fontFamily: config.fontFamily,
                            fontSize: config.fontSize,
                            label: 'You (KBase)',
                            color: 'orange'
                        }
                    },
                    community: {
                        radial: {
                            x: config.x,
                            y: config.y,
                            angle: 0,
                            length: config.radialLength,
                            width: 4,
                            fontFamily: config.fontFamily,
                            fontSize: config.fontSize,
                            label: 'Ref',
                            color: 'black'
                        }
                    }
                },
                rings: [
                    // {
                    //     ring: {
                    //         x: config.x,
                    //         y: config.y,
                    //         radius: 90,
                    //         width: 10,
                    //         color: 'green'
                    //     }
                    // },
                    {
                        ring: {
                            x: config.x,
                            y: config.y,
                            radius: 40,
                            width: 10,
                            color: 'blue'
                        }
                    },
                    {
                        ring: {
                            x: config.x,
                            y: config.y,
                            radius: 70,
                            width: 10,
                            color: 'orange'
                        }
                    }
                ],
                ticks: [{
                        tick: {
                            x: config.x,
                            y: config.y,
                            start: 0.3,
                            theta: 0.05,
                            radius: 40,
                            width: 10,
                            color: 'red'
                        }
                    },
                    {
                        tick: {
                            x: config.x,
                            y: config.y,
                            start: 0.5,
                            theta: 0.3,
                            radius: 40,
                            width: 10,
                            color: 'red'
                        }
                    },
                    {
                        tick: {
                            x: config.x,
                            y: config.y,
                            start: 0.6,
                            theta: 0.05,
                            radius: 70,
                            width: 10,
                            color: 'silver'
                        }
                    },
                ],
                center: {
                    x: config.x,
                    y: config.y,
                    radius: 6,
                    color: 'black'
                }
            };
        }

        function render() {
            // Make a big frickin' structure...
            var vm = viewModel();

            var w = svg({
                id: 'mysvg',
                width: 300,
                height: 300,
                style: {
                    outline: '1px silver solid',
                    margin: '10px'
                }
            }, [
                '<!-- ko foreach: rings -->',
                komponent({
                    name: 'reske/widget/ring',
                    params: {
                        ring: 'ring'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko foreach: ticks -->',
                komponent({
                    name: 'reske/widget/ringTick',
                    params: {
                        tick: 'tick'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko with: radials.kbase -->',
                komponent({
                    name: 'reske/widget/radial',
                    params: {
                        radial: 'radial'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko with: radials.community -->',
                komponent({
                    name: 'reske/widget/radial',
                    params: {
                        radial: 'radial'
                    }
                }),
                '<!-- /ko -->',
                // buildRadial(vm.radials.kbase, vm.config),
                // buildRadial(vm.radials.community, vm.config),
                komponent({
                    name: 'reske/widget/circle',
                    params: {
                        x: 'center.x',
                        y: 'center.y',
                        radius: 'center.radius',
                        color: 'center.color'
                    }
                })
            ]);

            container.innerHTML = div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6'
                    }, w),
                    div({
                        class: 'col-sm-6'
                    }, buildEditor())
                ])
            ]);
            ko.applyBindings(vm, container);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            render();
        }

        function stop() {}

        function detach() {}

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function(config) {
            return factory(config);
        }
    };
});