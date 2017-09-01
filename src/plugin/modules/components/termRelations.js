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
        return {
            vm: params.vm
        };
    }

    function template() {
        return div({
            dataBind: {
                foreach: 'vm.termRelations'
            }
        }, table({
            class: 'table table-striped'
        }, [
            tr([
                th({
                    style: {
                        width: '40%'
                    }
                }, 'Relation type'),
                td({
                    dataBind: {
                        text: 'relation_type'
                    }
                })
            ]),
            tr([
                th({
                    style: {
                        width: '40%'
                    }
                }, 'Term id'),
                td({
                    dataBind: {
                        text: 'term_id'
                    }
                })
            ]),
            tr([
                th({
                    style: {
                        width: '40%'
                    }
                }, 'Term name'),
                td({
                    dataBind: {
                        text: 'term_name'
                    }
                })
            ]),
            tr([
                th({
                    style: {
                        width: '40%'
                    }
                }, 'Term position'),
                td({
                    dataBind: {
                        text: 'term_position'
                    }
                })
            ]),
        ]));
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});