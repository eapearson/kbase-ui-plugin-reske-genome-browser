define([
    'kb_common/html'
], function (
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        table = t('table'),
        thead = t('thead'),
        tbody = t('tbody'),
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
                    fontWeight: 'normal',
                    backgroundColor: 'gray',
                    color: 'white'
                }
            }, label),
            '<!-- ko if: $data.' + type + ' && ' + type + '.terms.length > 0 -->',
            buildTermsTable(label, type),
            '<!-- /ko -->',
            '<!-- ko if: !$data.' + type + ' || ' + type + '.terms.length === 0 -->',
            div({
                style: {
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: '10px'
                }
            }, 'sorry, no data for this type'),
            '<!-- /ko -->'
        ];

    }

    function buildUserTermsTable(label, type) {
        return table({
            class: ''
        }, [
            // tr([
            //     th(''),
            //     // th('alpha'),
            //     th('Name'),
            //     th('Id'),
            //     th(''),
            //     th('')
            // ]),

            tr(th({ colspan: '5' })),

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
                // td({
                //     dataBind: {
                //         numberText: 'alpha',
                //         numberFormat: '"0.00"'
                //     }
                // }),
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

                td(),
                td()
            ]),
            '<!-- /ko -->'
        ]);
    }

    function buildUserTerm(label, type) {
        return [
            div({
                style: {
                    // fontWeight: 'bold',
                    fontSize: '100%',
                    // textDecoration: 'underline'
                    padding: '4px',
                    color: 'white',
                    fontWeight: 'normal',
                    backgroundColor: 'gray'
                }
            }, label),
            '<!-- ko if: $data.' + type + ' && ' + type + '.terms.length > 0 -->',
            buildUserTermsTable(label, type),
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

    function buildJustHeader() {
        return table({
            style: {
                marginBottom: '0'
            }
        }, [
            thead(
                tr([
                    th(''),
                    // th('alpha'),
                    th('GO Term'),
                    th('Id'),
                    th('Distance'),
                    th('p-value')
                ]))
        ]);
    }

    function buildTermsTable(label, type) {
        return table({
            class: ''
        }, tbody([
            // tr([
            //     th(''),
            //     // th('alpha'),
            //     th('Name'),
            //     th('Id'),
            //     th('Distance'),
            //     th('p-value')
            // ]),
            tr(th({ colspan: '5' })),
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
                // td({
                //     dataBind: {
                //         numberText: 'alpha',
                //         numberFormat: '"0.00"'
                //     }
                // }),
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
                        typedText: {
                            type: '"number"',
                            value: 'term_position',
                            format: '"0.00"'
                        }
                    }
                }),
                td({
                    dataBind: {
                        typedText: {
                            type: '"number"',
                            value: 'pvalue',
                            format: '"0.000"'
                        }
                    }
                })
            ]),
            '<!-- /ko -->'
        ]));
    }

    function buildTermRelations() {
        return [
            buildJustHeader(),
            '<!-- ko with: vm.termRelations -->',
            buildUserTerm('User', 'reference'),
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