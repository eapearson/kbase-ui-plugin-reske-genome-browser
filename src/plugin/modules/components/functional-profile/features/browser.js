define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        p = t('p');

    function viewModel(params, componentInfo) {

        var search = params.searchVM;

        // console.log('search vm???', search);

        var height = ko.observable();
        height.subscribe(function (newValue) {
            search.availableRowHeight(newValue);
        });

        var resizerTimeout = 200;
        var resizerTimer = null;

        function calcHeight() {
            var tableHeight = componentInfo.element.querySelector('[name="table"]').clientHeight;
            // TODO: switch to getBoundingClientRect()
            var headerHeight = componentInfo.element.querySelector('[name="header"]').offsetHeight;

            return tableHeight - headerHeight;
        }

        function resizer() {
            if (resizerTimer) {
                return;
            }
            window.setTimeout(function () {
                resizerTimer = null;
                height(calcHeight());
            }, resizerTimeout);
        }
        window.addEventListener('resize', resizer, false);
        height(calcHeight());
        search.fetchingFeatures.subscribe(function (newValue) {
            if (newValue) {
                resizer();
            }
        });

        function doSelectFeature(data) {
            // console.log('data', data);
            search.selectedFeature(data);
        }
        var selectedFeatureGuid = ko.pureComputed(function () {
            if (!search.selectedFeature()) {
                return null;
            }
            return search.selectedFeature().feature_guid;
        });

        var columns = {
            distance: {
                id: 'distance',
                label: 'Distance',
                sort: {
                    direction: ko.observable('ascending'),
                    active: ko.observable(false),
                }
            },
            gene: {
                id: 'gene',
                label: 'Gene',
                sort: {
                    direction: ko.observable('ascending'),
                    active: ko.observable(false),
                }
            },
            userTerm: {
                id: 'userTerm',
                label: 'User term',
                sort: {
                    direction: ko.observable('ascending'),
                    active: ko.observable(false),
                }
            },
            inferredTerm: {
                id: 'inferredTerm',
                label: 'Inferred term',
                sort: {
                    direction: ko.observable('ascending'),
                    active: ko.observable(false),
                }
            }
        };

        var currentSortColumn = ko.observable();

        function doSort(data) {
            var newColumn = data.id;
            // handle direction
            var direction;
            var oldColumn = currentSortColumn();
            if (oldColumn) {
                if (oldColumn === newColumn) {
                    direction = columns[newColumn].sort.direction() === 'ascending' ? 'descending' : 'ascending';
                } else {
                    direction = columns[newColumn].sort.direction();
                }
            } else {
                direction = columns[newColumn].sort.direction();
            }

            // do the actual sort
            search.featuresSort({
                field: newColumn,
                direction: direction
            });

            // Finally flip the sort column.
            if (oldColumn && oldColumn !== newColumn) {
                columns[oldColumn].sort.active(false);
            }
            columns[newColumn].sort.active(true);
            columns[newColumn].sort.direction(direction);
            currentSortColumn(newColumn);
        }

        return {
            doSelectFeature: doSelectFeature,
            selectedFeatureGuid: selectedFeatureGuid,
            search: search,
            columns: columns,
            doSort: doSort
        };
    }

    function buildHeaderColumn(id, label, flex) {
        return div({
            dataBind: {
                with: 'columns.' + id
            },
            style: {
                flex: flex,
                cursor: 'pointer'
            },
            class: 'kb-flex-table-cell'
        }, div({
            dataBind: {
                click: '$component.doSort'
            },
            style: {
                flex: '1 1 0px',
                height: '25px',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }
        }, [
            span({
                dataBind: {
                    css: {
                        'fa-sort-desc': 'sort.active() && sort.direction() === "descending"',
                        'fa-sort-asc': 'sort.active() && sort.direction() === "ascending"',
                        'fa-sort': '!sort.active()'
                    },
                    style: {
                        color: '!sort.active() ? "silver" : null'
                    }
                },
                style: {
                    marginRight: '2px'
                },
                class: 'fa'
            }),
            label
        ]));
    }

    function buildHeader() {
        return div({
            class: 'kb-flex-table-header kb-flex-table-row',
            name: 'header'
        }, [
            buildHeaderColumn('gene', 'Gene', '3 3 30%'),
            buildHeaderColumn('distance', 'Distance', '1 1 10%'),
            buildHeaderColumn('userTerm', 'User term', '3 3 30%'),
            buildHeaderColumn('inferredTerm', 'Inferred term', '3 3 30%'),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '0 0 1.5em'
                }
            }, [])
        ]);
    }

    function buildRow() {
        return div({
            dataBind: {
                click: '$component.doSelectFeature',
                css: {
                    '-selected': 'feature_guid === $component.selectedFeatureGuid()'
                }
            },
            class: 'kb-flex-table-row'
        }, [
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    },
                    dataBind: {
                        text: 'feature_name'
                    }
                }),
                div({
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    },
                    dataBind: {
                        text: 'feature_function'
                    }
                }),
            ]),
            div({
                dataBind: {
                    numberText: 'distance',
                    numberFormat: '"0.00"'
                },
                class: 'kb-flex-table-cell',
                style: {
                    flex: '1 1 10%'
                }
            }),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    },
                    dataBind: {
                        text: 'reference_term_name'
                    }
                }),
                div({
                    dataBind: {
                        text: 'reference_term_guid'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px'
                    }
                })
            ]),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                }
            }, [
                div({
                    dataBind: {
                        text: 'kbase_term_name'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }),
                div({
                    dataBind: {
                        text: 'kbase_term_guid'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px'
                    }
                })
            ]),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '0 0 1.5em'
                }
            }, [
                div({
                    dataBind: {
                        style: {
                            'background-color': 'with_fitness ? "rgba(33, 140, 56, 0.5)" : "rgba(230,230,230, 0.5)"',
                            'color': 'with_fitness ? "black" : "rgba(0,0,0, 0.5)"'
                        }
                    },
                    style: {
                        // backgroundColor: 'rgba(33, 140, 56, 0.5)',
                        height: '25px',
                        overflow: 'hidden',
                        color: 'black',
                        textAlign: 'center'
                    }
                }, ''),
                div({
                    dataBind: {
                        // style: {
                        //     visibility: 'with_expression ? "visible" : "hidden"'
                        // }
                        style: {
                            'background-color': 'with_expression ? "rgba(130, 61, 142, 0.5)" : "rgba(230,230,230, 0.5)"',
                            'color': 'with_expression ? "black" : "rgba(0,0,0, 0.5)"'
                        }
                    },
                    style: {
                        // backgroundColor: 'rgba(130, 61, 142, 0.5)',
                        height: '25px',
                        overflow: 'hidden',
                        color: 'black',
                        textAlign: 'center'
                    }
                }, '')
            ])
        ]);
    }

    function buildError() {
        return div({
            class: 'well danger',
            dataBind: {
                text: 'search.error().mesage'
            }
        });
    }

    function buildLoading() {
        return div({
            style: {
                // margin: '1em',
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'rgba(224, 224, 224, 0.5)',
                border: '1px rgba(224, 224, 224, 0.5) solid'
            }
        }, [
            p([
                'Loading genes...',
                html.loading()
            ])
        ]);
    }

    function template() {
        return div({
            class: 'reske_functional-profile_features_browser',
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            div({
                style: {
                    position: 'absolute',
                    top: '0',
                    right: '0'
                },
                dataBind: {
                    text: 'selectedFeatureGuid'
                }
            }),
            div({
                class: 'kb-flex-table',
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 0 0 4px'
                },
                name: 'table'
            }, [
                buildHeader(),
                '<!-- ko if: search.fetchingFeatures -->',
                buildLoading(),
                '<!-- /ko -->',
                '<!-- ko ifnot: search.fetchingFeatures -->',
                div({
                    dataBind: {
                        foreach: 'search.features'
                    },
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    name: 'features'
                }, buildRow()),
                '<!-- /ko -->',
                '<!-- ko if: search.error -->',
                buildError(),
                '<!-- /ko -->'
            ])
        ]);
        // var container = document.createElement('div');
        // container.innerHTML = markup;
        // return {
        //     element: container.children[0]
        // };
    }

    function component() {
        return {
            viewModel: {
                createViewModel: viewModel
            },
            template: template()
        };
    }
    return component;
});