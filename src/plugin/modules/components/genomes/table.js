define([
    'knockout-plus',
    'kb_common/html'
], function(
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        a = t('a'),
        span = t('span'),
        table = t('table'),
        tr = t('tr'),
        td = t('td'),
        th = t('th'),
        thead = t('thead'),
        tbody = t('tbody');

    /*
    viewModel
    params should be:
    search: search vm, including
      sortingRules
      searchResults

      the searchResults must match our expectation here, which is:
      rowNumber, domain, scientific_name, id, features+
     */
    function viewModel(params) {
        // function doOpenNarrative(data) {
        //     var url = params.search.runtime.config('services.narrative.url');
        //     window.open(url + '/narrative/' + data.narrativeId, '_blank');
        // }
        function doSelectGenome(data) {
            params.searchVM.selectedGenome(data);
        }
        var actions = {
            doSelectGenome: doSelectGenome
        };
        var columns = [{
            name: 'rowNumber',
            label: '#',
            type: 'number',
            format: '0,0',
            width: '5%',
            sort: {
                keyName: 'timestamp',
                isTimestamp: true,
                direction: 'descending'
            }
        }, {
            name: 'domain',
            label: 'Domain',
            type: 'string',
            width: '10%',
            sort: {
                keyName: 'domain',
                isTimestamp: false,
                direction: 'ascending'
            },
            // action: doOpenNarrative
        }, {
            name: 'scientificName',
            label: 'Scientific name',
            type: 'string',
            width: '35%',
            // sort: {
            //     keyName: 'scientific_name',
            //     isTimestamp: false,
            //     direction: 'ascending'
            // }
        }, {
            name: 'id',
            label: 'Id',
            type: 'string',
            width: '35%',
            sort: {
                keyName: 'id',
                isTimestamp: false,
                direction: 'ascending'
            }
        }, {
            name: 'features',
            label: 'Features',
            type: 'number',
            format: '0,0',
            width: '10%',
            style: {
                'text-align': 'right',
                'padding-right': '10px'
            },
            sort: {
                keyName: 'features',
                isTimestamp: false,
                direction: 'ascending'
            }
        }, {
            label: 'Select',
            width: '5%',
            actionLabel: '>',
            type: 'action',
            action: 'doSelectGenome'
        }];
        var columnsMap = columns.reduce(function(map, column) {
            map[column.name] = column;
            return map;
        }, {});

        // Default sort
        var sortColumn = ko.observable('rowNumber');
        var sortDirection = ko.observable('ascending');

        function doSort(data) {
            var columnName = data.name;
            if (columnName === sortColumn()) {
                if (sortDirection() === 'ascending') {
                    sortDirection('descending');
                } else {
                    sortDirection('ascending');
                }
            } else {
                sortColumn(columnName);
                sortDirection(columnsMap[columnName].sort.direction);
            }

            var column = columnsMap[columnName];

            // Maybe do this through a subscription to the individual 
            // observables...
            var sortRule = {
                is_timestamp: column.sort.isTimestamp ? 1 : 0,
                is_object_name: column.sort.isObjectName ? 1 : 0,
                key_name: column.sort.keyName,
                descending: sortDirection() === 'descending' ? 1 : 0
            };
            params.searchVM.sortingRules.removeAll();
            params.searchVM.sortingRules.push(sortRule);
        }

        return {
            searchVM: params.searchVM,
            columns: columns,
            doSort: doSort,
            // doOpenNarrative: doOpenNarrative,
            sortColumn: sortColumn,
            sortDirection: sortDirection,

            actions: actions
        };
    }

    function buildResultsTable() {
        return table({
            class: 'table table-striped'
        }, [
            thead({},
                tr({
                    dataBind: {
                        foreach: {
                            data: '$component.columns',
                            as: '"column"'
                        }
                    }
                }, [
                    th({
                        dataBind: {
                            style: {
                                width: 'column.width',
                            }
                        }
                    }, [
                        '<!-- ko if: column.sort -->',
                        span({
                            dataBind: {
                                text: 'column.label',
                                click: '$component.doSort'
                            },
                            style: {
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }
                        }),
                        '<!-- ko if: $component.sortColumn() === column.name -->',
                        '<!-- ko if: $component.sortDirection() === "descending" -->',
                        span({
                            class: 'fa fa-sort-desc'
                        }),
                        '<!-- /ko -->',
                        '<!-- ko if: $component.sortDirection() === "ascending" -->',
                        span({
                            class: 'fa fa-sort-asc'
                        }),
                        '<!-- /ko -->',
                        '<!-- /ko -->',
                        '<!-- /ko -->',
                        '<!-- ko if: !column.sort -->',
                        span({
                            dataBind: {
                                text: 'column.label'
                            }
                        }),
                        '<!-- /ko -->'
                    ])
                ])
            ),
            tbody({
                dataBind: {
                    foreach: {
                        data: 'searchVM.searchResults',
                        as: '"item"'
                    }
                }
            }, [
                tr({
                    dataBind: {
                        foreach: {
                            data: '$component.columns',
                            as: '"column"'
                        }
                    }
                }, [
                    td({
                        dataBind: {
                            style: 'column.style'
                        }
                    }, [
                        '<!-- ko if: column.action -->',
                        // a({
                        //     dataBind: {
                        //         text: 'item[column.name]',
                        //         click: 'function () {column.action(item);}'
                        //     },
                        //     style: {
                        //         cursor: 'pointer'
                        //     }
                        // }),
                        '<!-- ko if: column.type === "action" -->',
                        a({
                            class: 'btn btn-default',
                            dataBind: {
                                text: 'column.actionLabel',
                                click: 'function () {$component.actions[column.action](item);}'
                            },
                            style: {
                                cursor: 'pointer'
                            }
                        }),
                        '<!-- /ko -->',
                        '<!-- /ko -->',

                        '<!-- ko ifnot: column.action -->',

                        '<!-- ko if: column.type === "number" -->',
                        span({
                            dataBind: {
                                numberText: 'item[column.name]',
                                numberFormat: 'column.format'
                            }
                        }),
                        '<!-- /ko -->',
                        '<!-- ko if: column.type === "date" -->',
                        '<!-- /ko -->',

                        '<!-- ko if: column.type === "string" -->',
                        span({
                            dataBind: {
                                text: 'item[column.name]'
                            }
                        }),
                        '<!-- /ko -->',

                        '<!-- ko if: column.type === "action" -->',
                        a({
                            class: 'btn btn-default',
                            dataBind: {
                                text: 'column.actionLabel',
                                click: 'function () {actions[column.action](item);}'
                            },
                            style: {
                                cursor: 'pointer'
                            }
                        }),
                        '<!-- /ko -->',

                        '<!-- /ko -->'
                    ])
                ])
            ])
        ]);
    }

    function template() {
        return div({
            class: 'container-fluid'
        }, [
            buildResultsTable()
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