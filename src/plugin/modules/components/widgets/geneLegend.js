define([
    'kb_common/html'
], function (
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    function viewModel(params) {
        return {
            config: params.config,
            vm: params.vm
        };
    }

    function buildTerms(label, type) {
        return [
            div({
                style: {
                    // fontWeight: 'bold',
                    fontSize: '100%',
                    // textDecoration: 'underline'
                    padding: '4px',
                    color: 'white',
                    backgroundColor: 'gray'
                }
            }, label),
            '<!-- ko if: $data.' + type + ' && ' + type + '.terms.length > 0 -->',
            buildTermsTable(label, type),
            '<!-- /ko -->',
            '<!-- ko if: !$data.' + type + ' || ' + type + '.terms.length === 0 -->',
            div({
                style: {
                    fontStyle: 'italic',
                    textAlign: 'center'
                }
            }, 'sorry, no data for this type'),
            '<!-- /ko -->'
        ];

    }

    function buildReferenceTerm(label, type) {
        return [
            div({
                style: {
                    fontWeight: 'bold',
                    fontSize: '100%',
                    textDecoration: 'underline'
                }
            }, label),
            '<!-- ko if: ' + type + ' && ' + type + '.terms.length > 0 -->',
            buildTermsTable(label, type),
            '<!-- /ko -->',
            '<!-- ko if: !' + type + ' || ' + type + '.terms.length === 0 -->',
            div({
                style: {
                    fontStyle: 'italic',
                    textAlign: 'center'
                }
            }, 'sorry, no terms for this type'),
            '<!-- /ko -->'
        ];

    }

    function buildTermsTable(label, type) {
        return table({
            class: 'table table-condensed table-hover'
        }, [
            tr([
                th(''),
                th('alpha'),
                th('Name'),
                th('Id'),
                th('Position'),
                th('p-value')
            ]),
            '<!-- ko foreach: ' + type + '.terms -->',
            tr({
                dataBind: {
                    style: {
                        'font-weight': 'best ? "bold" : "normal" '
                    }
                }
            }, [
                td(div({
                    style: {
                        border: '1px silver solid',
                        width: '15px',
                        height: '15px'
                    },
                    dataBind: {
                        style: {
                            'background-color': 'color'
                        }
                    }
                })),
                td({
                    dataBind: {
                        numberText: 'alpha',
                        numberFormat: '"0.00"'
                    }
                }),
                td({
                    dataBind: {
                        text: 'term_name'
                    }
                }),
                td({
                    dataBind: {
                        text: 'term_guid'
                    }
                }),

                td({
                    dataBind: {
                        numberText: 'term_position',
                        numberFormat: '"0.00"'
                    }
                }),
                td({
                    dataBind: {
                        numberText: 'pvalue',
                        numberFormat: '"0.0000"'
                    }
                })
            ]),
            '<!-- /ko -->'
        ]);
    }

    function buildTermRelations() {
        return [
            '<!-- ko with: vm.termRelations -->',
            buildTerms('User', 'reference'),
            buildTerms('Inferred', 'kbase'),
            buildTerms('Fitness', 'fitness'),
            buildTerms('Expression', 'expression'),
            '<!-- /ko -->'
        ];
    }

    function template() {
        var t = div({
            class: 'component-reske-gene-legend'
        }, buildTermRelations());
        return t;
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});