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
            params.searchVM.selectedGenome(data);
        }
        return {
            doSelectGenome: doSelectGenome,
            vm: params.searchVM
        };
    }

    function template() {
        return table({
            class: 'table table-striped -genome-browser',
        }, [
            thead([
                tr([
                    th('#'),
                    th('Domain'),
                    th('Scientific name'),
                    th('Id'),
                    th('Features'),
                    th()
                ])
            ]),
            tbody({
                dataBind: {
                    foreach: 'vm.searchResults'
                }
            }, [
                tr([
                    td({
                        dataBind: {
                            text: 'rowNumber + 1'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'domain'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'scientificName'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'id'
                        }
                    }),

                    td({
                        dataBind: {
                            numberText: 'features',
                            numberFormat: '"0,0"'
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