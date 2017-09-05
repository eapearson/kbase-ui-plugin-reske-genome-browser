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
        function doSelectGenome(data) {
            params.vm.selectedGenome(data);
        }
        return {
            doSelectGenome: doSelectGenome,
            vm: params.vm
        };
    }

    function template() {
        return table({
            class: 'table table-striped',
        }, [
            thead([
                tr([
                    th('Domain'),
                    th('Scientific name'),
                    th('Id'),
                    th('Features'),
                    th()
                ])
            ]),
            tbody({
                dataBind: {
                    foreach: 'vm.genomes'
                }
            }, [
                tr([
                    td({
                        dataBind: {
                            text: 'data.domain'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'data.scientific_name'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'data.id'
                        }
                    }),

                    td({
                        dataBind: {
                            text: 'data.features'
                        }
                    }),
                    td({
                        style: {
                            textAlign: 'right'
                        }
                    }, button({
                        dataBind: {
                            click: '$component.doSelectGenome'
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