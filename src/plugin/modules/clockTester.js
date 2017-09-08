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

    var vm; // top level view model

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


            return {
                config: config,
                radials: {
                    kbase: {
                        radial: {
                            x: config.x,
                            y: config.y,
                            angle: ko.observable(0),
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
                ticks: (function() {
                    var ticks = [];
                    var diff = 1 / 12;
                    var theta = 0.01;
                    var angle;
                    for (var i = 0; i < 12; i += 1) {
                        angle = diff * i - (theta / 2);
                        ticks.push({
                            tick: {
                                x: config.x,
                                y: config.y,
                                start: angle,
                                theta: theta,
                                radius: 70,
                                width: 10,
                                color: 'red'
                            }
                        });
                    }
                    return ticks;
                }()),
                // ticks: [{
                //         tick: {
                //             x: config.x,
                //             y: config.y,
                //             start: 0.3,
                //             theta: 0.05,
                //             radius: 40,
                //             width: 10,
                //             color: 'red'
                //         }
                //     },
                //     {
                //         tick: {
                //             x: config.x,
                //             y: config.y,
                //             start: 0.5,
                //             theta: 0.3,
                //             radius: 40,
                //             width: 10,
                //             color: 'red'
                //         }
                //     },
                //     {
                //         tick: {
                //             x: config.x,
                //             y: config.y,
                //             start: 0.6,
                //             theta: 0.05,
                //             radius: 70,
                //             width: 10,
                //             color: 'silver'
                //         }
                //     },
                // ],
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
            vm = viewModel();

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

        var timer;

        function startClock() {
            function tick() {
                timer = window.setTimeout(function() {
                    // time as an angle.
                    // just do seconds for now...
                    var now = new Date();
                    var secondsAsAngle = now.getSeconds() / 60;
                    var millisAsAngle = (now.getSeconds() * 1000 + now.getMilliseconds()) / (60 * 1000);
                    vm.radials.kbase.radial.angle(secondsAsAngle);
                    if (timer) {
                        tick();
                    }
                }, 200);
            }
            tick();
        }

        function stopClock() {
            timer = null;
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            render();
            startClock();
        }

        function stop() {
            stopClock();
        }

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