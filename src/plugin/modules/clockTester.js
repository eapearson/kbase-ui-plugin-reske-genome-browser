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

    function getTime() {
        // time as an angle.
        // just do seconds for now...
        var now = new Date();

        // For the hours hand.

        var hours = now.getHours() +
            now.getMinutes() / 60 +
            now.getSeconds() / 3600;

        var hoursAsAngle = hours / 24;

        var hoursLabel = String(now.getHours()) + ':' +
            numeral(now.getMinutes()).format('00');

        // For the seconds hand.
        var secondsAsAngle = now.getSeconds() / 60;
        var secondsLabel = now.getSeconds();
        return {
            seconds: {
                value: {
                    angle: secondsAsAngle
                },
                label: secondsLabel
            },
            hours: {
                value: {
                    angle: hoursAsAngle
                },
                label: hoursLabel
            }
        };
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

            var time = getTime();

            return {
                config: config,
                radials: {
                    kbase: {
                        radial: {
                            x: config.x,
                            y: config.y,
                            angle: ko.observable(time.seconds.value.angle),
                            length: config.radialLength,
                            width: 4,
                            fontFamily: config.fontFamily,
                            fontSize: config.fontSize,
                            label: ko.observable(time.seconds.label),
                            labelStyle: 'radial',
                            color: 'orange',
                            dropShadow: {
                                offsetX: 2,
                                offsetY: 2,
                                blurRadius: 2,
                                color: 'gray'
                            }
                        }
                    },
                    community: {
                        radial: {
                            x: config.x,
                            y: config.y,
                            angle: ko.observable(time.hours.value.angle),
                            length: config.radialLength,
                            width: 4,
                            fontFamily: config.fontFamily,
                            fontSize: config.fontSize,
                            label: ko.observable(time.hours.label),
                            color: 'black'
                        }
                    }
                },
                seconds: {
                    ring: {
                        x: config.x,
                        y: config.y,
                        radius: 40,
                        width: 10,
                        color: 'blue',
                        stroke: 'red',
                        strokeWidth: 0
                    },
                    tick: (function() {
                        return {
                            x: config.x,
                            y: config.y,
                            start: ko.observable(1 - time.seconds.value.angle - 0.02),
                            theta: 0.04,
                            radius: 40,
                            width: 10,
                            color: 'white'
                        };
                    }())
                },
                hoursRing: {
                    ring: {
                        ring: {
                            x: config.x,
                            y: config.y,
                            radius: 70,
                            width: 10,
                            color: 'orange'
                        }
                    },
                    ticks: (function() {
                        var ticks = [];
                        // we have a 24 hour clock.
                        var totalTicks = 24;
                        // the angle between each one.
                        var eachAngle = 1 / totalTicks;
                        // The length of the tick (arc) as an angle.
                        var theta = 0.01;
                        var angle;
                        for (var i = 0; i < totalTicks; i += 1) {
                            angle = eachAngle * i - (theta / 2);
                            ticks.push({
                                tick: {
                                    x: config.x,
                                    y: config.y,
                                    start: angle,
                                    theta: theta,
                                    radius: 70,
                                    width: 10,
                                    color: 'green'
                                }
                            });
                        }
                        return ticks;
                    }())
                },
                majorHours: (function() {
                    return [0, 6, 12, 18].map(function(hour) {
                        var theta = 0.02;
                        var angle = hour / 24 - theta / 2;
                        return {
                            tick: {
                                x: config.x,
                                y: config.y,
                                start: angle,
                                theta: theta,
                                radius: 70,
                                width: 20,
                                color: 'green'
                            }
                        };
                    });
                }()),
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
                '<!-- ko with: hoursRing -->',
                '<!-- ko with: ring -->',
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
                '<!-- /ko -->',
                '<!-- ko foreach: majorHours -->',
                komponent({
                    name: 'reske/widget/ringTick',
                    params: {
                        tick: 'tick'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko with: seconds -->',
                komponent({
                    name: 'reske/widget/ring',
                    params: {
                        ring: 'ring'
                    }
                }),
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

        function updateClock() {
            var time = getTime();
            vm.radials.kbase.radial.angle(time.seconds.value.angle);
            vm.radials.kbase.radial.label(time.seconds.label);
            vm.radials.community.radial.angle(time.hours.value.angle);
            vm.radials.community.radial.label(time.hours.label);

            vm.seconds.tick.start(1 - time.seconds.value.angle - vm.seconds.tick.theta / 2);
        }

        function startClock() {
            function tick() {
                timer = window.setTimeout(function() {
                    // time as an angle.
                    // just do seconds for now...
                    updateClock();
                    if (timer) {
                        tick();
                    }
                }, 100);
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