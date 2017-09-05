define([
    'kb_common/html'
], function(
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        button = t('button'),
        table = t('table'),
        thead = t('thead'),
        tr = t('tr'),
        th = t('th'),
        tbody = t('tbody'),
        td = t('td');

    function viewModel(params) {
        function doSelectFeature(data) {
            params.searchVM.selectedFeature(data);
        }
        return {
            doSelectFeature: doSelectFeature,
            vm: params.searchVM
        };
    }

    function template() {
        return table({
            class: 'table table-striped',
        }, [
            thead([
                tr([
                    th('#'),
                    th('Name'),
                    th('Distance'),
                    th('Community'),
                    th(),
                    th('KBase'),
                    th(),
                    th()
                ])
            ]),
            tbody({
                dataBind: {
                    foreach: 'vm.features'
                }
            }, [
                tr([
                    td({
                        dataBind: {
                            text: 'rowNumber'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'feature_name'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'formatted.distance'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'community_term_name'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'community_term_id'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'kbase_term_name'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'kbase_term_id'
                        }
                    }),

                    td({
                        style: {
                            textAlign: 'right'
                        }
                    }, button({
                        dataBind: {
                            click: '$component.doSelectFeature'
                        },
                        class: 'btn btn-default'
                    }, '>'))
                ])
            ])
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