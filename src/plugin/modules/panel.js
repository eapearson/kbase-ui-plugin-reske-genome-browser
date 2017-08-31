define([
    'kb_common/html',
    'knockout-plus',
    './geneViewer'
], function(
    html,
    ko,
    GeneViewer
) {
    'use string';

    var t = html.tag,
        div = t('div'),
        svg = t('svg'),
        defs = t('defs'),
        mask = t('mask'),
        circle = t('circle'),
        rect = t('rect'),
        line = t('line'),
        text = t('text');

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;



        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            var arg = {
                config: {
                    predictions: {
                        a: {
                            bandColor: '#CCC',
                            tickColor: 'red'
                        },
                        b: {
                            bandColor: '#AAA',
                            tickColor: 'red'
                        },
                        c: {
                            bandColor: '#666',
                            tickColor: 'red'
                        }
                    },
                    ringWidth: 10,
                    minRadius: 30,
                    radialLength: 90,
                    fontSize: 11,
                    fontFamily: 'sans-serif'
                },
                data: {
                    community: {
                        value: 0.5,
                        color: 'blue',
                        label: 'Community'
                    },
                    kbase: {
                        value: 0.3,
                        color: 'orange',
                        label: 'KBase'
                    },
                    predictions: {
                        a: {
                            value: 0.2
                        },
                        b: {
                            value: 0.1
                        },
                        c: {
                            value: 0.7
                        }
                    }
                }
            };

            container.innerHTML = GeneViewer(arg);
        }

        function stop() {

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