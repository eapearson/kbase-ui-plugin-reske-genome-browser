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
        // sort by pvalue so that the best appear at the top...

        // hmm, should we sort in-situ or copy the data?


        return params;
    }

    // function buildTermRelationsx() {
    //     return div({
    //         dataBind: {
    //             foreach: 'vm.termRelations'
    //         }
    //     }, table({
    //         class: 'table table-striped'
    //     }, [
    //         tr([
    //             th({
    //                 style: {
    //                     width: '40%'
    //                 }
    //             }, 'Relation type'),
    //             td({
    //                 dataBind: {
    //                     text: 'relation_type'
    //                 }
    //             })
    //         ]),
    //         tr([
    //             th({
    //                 style: {
    //                     width: '40%'
    //                 }
    //             }, 'Id'),
    //             td({
    //                 dataBind: {
    //                     text: 'term_id'
    //                 }
    //             })
    //         ]),
    //         tr([
    //             th({
    //                 style: {
    //                     width: '40%'
    //                 }
    //             }, 'Name'),
    //             td({
    //                 dataBind: {
    //                     text: 'term_name'
    //                 }
    //             })
    //         ]),
    //         tr([
    //             th({
    //                 style: {
    //                     width: '40%'
    //                 }
    //             }, 'Position'),
    //             td({
    //                 dataBind: {
    //                     numberText: 'term_position',
    //                     numberFormat: '"0.00"'
    //                 }
    //             })
    //         ]),
    //     ]));
    // }

    function buildTerms(label, type) {
        return div([
            div({
                style: {
                    fontWeight: 'bold'
                }
            }, label),
            table({
                class: 'table'
            }, [
                tr([
                    th('Id'),
                    th('Name'),
                    th('p-value'),
                    th('Position')
                ]),
                '<!-- ko foreach: vm.termRelations().' + type + '.terms -->',
                tr({
                    dataBind: {
                        style: {
                            'font-weight': 'best ? "bold" : "normal" '
                        }
                    }
                }, [
                    td({
                        dataBind: {
                            text: 'term_guid'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'term_name'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'pvalue',
                            numberFormat: '"0.0000"'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'term_position',
                            numberFormat: '"0.00"'
                        }
                    })
                ]),
                '<!-- /ko -->'
            ])
        ]);
    }

    function buildReferenceTerms() {
        return div([
            div({
                style: {
                    fontWeight: 'bold'
                }
            }, 'Reference'),
            table({
                class: 'table'
            }, [
                tr([
                    th('Id'),
                    th('Name'),
                    th('p-value'),
                    th('Position')
                ]),
                '<!-- ko foreach: vm.termRelations().reference.terms -->',
                tr({
                    dataBind: {
                        style: {
                            'font-weight': 'best ? "bold" : "normal" '
                        }
                    }
                }, [
                    td({
                        dataBind: {
                            text: 'term_guid'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'term_name'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'pvalue',
                            numberFormat: '"0.0000"'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'term_position',
                            numberFormat: '"0.00"'
                        }
                    })
                ]),
                '<!-- /ko -->'
            ])
        ]);
    }

    function buildKBaseTerms() {
        return div([
            div({
                style: {
                    fontWeight: 'bold'
                }
            }, 'KBase'),
            table({
                class: 'table'
            }, [
                tr([
                    th('Id'),
                    th('Name'),
                    th('p-value'),
                    th('Position')
                ]),
                '<!-- ko foreach: vm.termRelations().kbase.terms -->',
                tr({
                    dataBind: {
                        style: {
                            'font-weight': 'best ? "bold" : "normal" '
                        }
                    }
                }, [
                    td({
                        dataBind: {
                            text: 'term_guid'
                        }
                    }),
                    td({
                        dataBind: {
                            text: 'term_name'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'pvalue',
                            numberFormat: '"0.0000"'
                        }
                    }),
                    td({
                        dataBind: {
                            numberText: 'term_position',
                            numberFormat: '"0.00"'
                        }
                    })
                ]),
                '<!-- /ko -->'
            ])
        ]);
    }


    function buildTermRelations() {
        return [
            buildTerms('Reference', 'reference'),
            buildTerms('KBase', 'kbase'),
            buildTerms('Fitness', 'fitness'),
            buildTerms('Expression', 'expression')
        ];
    }

    function buildFeature() {
        return div({

        }, table({
            class: 'table table-striped'
        }, [
            tr([
                th({
                    style: {
                        width: '40%'
                    }
                }, 'Feature ID'),
                td({
                    dataBind: {
                        text: 'vm.selectedFeature().feature_guid'
                    }
                })
            ])
        ]));
    }

    function template() {
        return div([
            buildFeature(),
            buildTermRelations()
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