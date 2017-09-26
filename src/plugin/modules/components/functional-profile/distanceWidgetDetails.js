define([
    'kb_common/html'
], function (
    html
) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        h4 = t('h4'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');


    function viewModel(params) {
        return {
            legend: params.ui.legend
        };
    }

    function buildTooltip() {
        return div({
            dataBind: {
                with: 'vm.tooltip'
            }
        }, [
            h4('Tooltip'),
            table({
                class: 'table'
            }, [
                tr([
                    th('Type'),
                    td({
                        dataBind: {
                            text: 'data.type'
                        }
                    })
                ]),
                tr([
                    th('Term'),
                    td({
                        dataBind: {
                            text: 'data.term.term_name'
                        }
                    })
                ]),
                tr([
                    th('Id'),
                    td({
                        dataBind: {
                            text: 'data.term.term_guid'
                        }
                    })
                ]),
                tr([
                    th('p-value'),
                    td({
                        dataBind: {
                            numberText: 'data.term.pvalue',
                            numberFormat: '"0.0000"'
                        }
                    })
                ]),
                tr([
                    th('distance'),
                    td({
                        dataBind: {
                            numberText: 'data.term.term_position',
                            numberFormat: '"0.000"'
                        }
                    })
                ]),
            ])
        ]);
    }

    function buildMiniLegend() {
        return table({
            dataBind: {
                foreach: 'legend'
            },
            class: '-mini-legend'
        }, [
            tr([
                td(div({
                    dataBind: {
                        style: {
                            'background-color': '"rgb(" + color.join(",") + ")"'
                        }
                    },
                    style: {
                        width: '15px',
                        height: '15px'
                    }
                })),
                td({
                    dataBind: {
                        text: 'label'
                    }
                })
            ])
        ]);
    }

    function template() {
        return div({
            class: 'reske_functional-profile_distance-widget-details',
            style: {
                margin: '0 0 10px 30px'
            }
        }, [
            // div({
            //     style: {
            //         height: '250px',
            //         border: '1px silver solid',
            //         padding: '4px'
            //     }
            // }, [
            //     '<!-- ko if: vm.tooltip() -->',
            //     buildTooltip(),
            //     '<!-- /ko -->',
            //     '<!-- ko ifnot: vm.tooltip() -->',
            //     'Hover over a chart item to see details',
            //     '<!-- /ko -->'
            // ]),
            buildMiniLegend()
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