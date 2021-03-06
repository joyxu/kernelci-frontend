var searchFilter = $('#search-filter').val();
var pageLen = $('#page-len').val();

function createBuildsTable(data) {
    'use strict';

    var localData = data.result,
        table = null;

    table = $('#defconfstable').dataTable({
        'dom': '<"row"<"col-xs-12 col-sm-12 col-md-6 col-lg-6"' +
            '<"length-menu"l>>' +
            '<"col-xs-12 col-sm-12 col-md-4 col-lg-4 col-lg-offset-2"f>r' +
            '<"col-xs-12 col-sm-12 col-md-12 col-lg-12"t>>' +
            '<"row"<"col-xs-12 col-sm-12 col-md-6 col-lg-6"i>' +
            '<"col-xs-12 col-sm-12 col-md-6 col-lg-6"p>>',
        'language': {
            'lengthMenu': '_MENU_&nbsp;<strong>builds per page</strong>',
            'zeroRecords': '<h4>No builds to display.</h4>',
            'search': '<div id="search-area" class="input-group">' +
                '<span class="input-group-addon">' +
                '<i class="fa fa-search"></i></span>_INPUT_</div>'
        },
        'initComplete': function(settings, data) {
            $('#table-loading').remove();
            $('#table-div').fadeIn('slow', 'linear');

            var api = this.api();

            if (pageLen !== undefined && pageLen !== null) {
                if (pageLen.length > 0) {
                    pageLen = Number(pageLen);
                    if (isNaN(pageLen)) {
                        pageLen = 25;
                    }

                    api.page.len(pageLen).draw();
                }
            }

            if (searchFilter !== null && searchFilter !== undefined) {
                if (searchFilter.length > 0) {
                    api.search(searchFilter, true).draw();
                }
            }
        },
        'lengthMenu': [25, 50, 75, 100],
        'deferRender': true,
        'ordering': true,
        'processing': true,
        'stateDuration': -1,
        'stateSave': true,
        'order': [5, 'desc'],
        'search': {
            'regex': true,
            'smart': true
        },
        'data': localData,
        'columns': [
            {
                'data': '_id',
                'visible': false,
                'searchable': false,
                'orderable': false
            },
            {
                'data': 'job',
                'title': 'Tree &dash; Branch',
                'render': function(data, type, object) {
                    var display = '<a class="table-link" href="/job/' +
                        data + '/">' + data;

                    if (object.git_branch !== null) {
                        display += '&nbsp;&dash;&nbsp;<small>' +
                            object.git_branch + '</small>';
                    }
                    return display + '</a>';
                }
            },
            {
                'data': 'kernel',
                'title': 'Kernel',
                'type': 'string',
                'className': 'kernel-column',
                'render': function(data, type, object) {
                    var display = '<span rel="tooltip" data-toggle="tooltip"' +
                        'title="' + data + '">' + data + '</span>';
                    return display;
                }
            },
            {
                'data': 'defconfig_full',
                'title': 'Defconfig',
                'className': 'defconfig-column',
                'render': function(data, type, object) {
                    var display = '<span rel="tooltip" ' +
                        'data-toggle="tooltip" ' +
                        'title="' + data + '">' + data + '</span>';
                    return display;
                }
            },
            {
                'data': 'arch',
                'title': 'Arch.'
            },
            {
                'data': 'created_on',
                'title': 'Date',
                'type': 'date',
                'className': 'pull-center',
                'render': function(data) {
                    var created = new Date(data.$date);
                    return created.getCustomISODate();
                }
            },
            {
                'data': 'status',
                'title': 'Status',
                'type': 'string',
                'className': 'pull-center',
                'render': function(data) {
                    var displ;
                    switch (data) {
                        case 'PASS':
                            displ = '<span rel="tooltip" ' +
                                'data-toggle="tooltip"' +
                                'title="Build completed">' +
                                '<span class="label label-success">' +
                                '<li class="fa fa-check"></li></span></span>';
                            break;
                        case 'FAIL':
                            displ = '<span rel="tooltip" ' +
                                'data-toggle="tooltip"' +
                                'title="Build failed">' +
                                '<span class="label label-danger">' +
                                '<li class="fa fa-exclamation-triangle">' +
                                '</li></span></span>';
                            break;
                        default:
                            displ = '<span rel="tooltip" ' +
                                'data-toggle="tooltip"' +
                                'title="Unknown status">' +
                                '<span class="label label-warning">' +
                                '<li class="fa fa-question">' +
                                '</li></span></span>';
                            break;
                    }
                    return displ;
                }
            },
            {
                'data': 'job',
                'title': '',
                'orderable': false,
                'searchable': false,
                'className': 'pull-center',
                'render': function(data, type, object) {
                    return '<span rel="tooltip" data-toggle="tooltip"' +
                        'title="Details for&nbsp;' + data +
                        '&nbsp;&dash;&nbsp;' + object.kernel +
                        '&nbsp;&dash;&nbsp;' + object.defconfig_full +
                        '">' +
                        '<a href="/build/' + data +
                        '/kernel/' + object.kernel + '/defconfig/' +
                        object.defconfig_full + '/">' +
                        '<i class="fa fa-search"></i></a></span>';
                }
            }
        ]
    });

    $(document).on('click', '#defconfstable tbody tr', function() {
        var tableData = table.fnGetData(this),
            location = '#';
        if (tableData) {
            location = '/build/' + tableData.job +
                '/kernel/' + tableData.kernel + '/defconfig/' +
                tableData.defconfig_full;
            if (tableData._id !== null) {
                location += '?_id=' + tableData._id.$oid;
            }

            window.location = location;
        }
    });

    $('#search-area > .input-sm').attr('placeholder', 'Filter the results');
    $('.input-sm').keyup(function(key) {
        // Remove focus from input when Esc is pressed.
        if (key.keyCode === 27) {
            $(this).blur();
        }
    });
}

function failedAjaxCall() {
    'use strict';
    $('#table-loading').remove();
}

$(document).ready(function() {
    'use strict';

    $('#li-build').addClass('active');
    $('#table-div').hide();

    var ajaxDeferredCall = null,
        ajaxData = null,
        errorReason = '';

    errorReason = 'Defconfig data call failed';
    ajaxData = {
        'sort': 'created_on',
        'sort_order': -1,
        'date_range': $('#date-range').val(),
        'field': [
            '_id', 'job', 'kernel', 'status',
            'arch', 'created_on', 'git_branch', 'defconfig_full'
        ]
    };
    ajaxDeferredCall = JSBase.createDeferredCall(
        '/_ajax/defconf',
        'GET',
        ajaxData,
        null,
        failedAjaxCall,
        errorReason
    );

    $.when(ajaxDeferredCall).done(createBuildsTable);
});
