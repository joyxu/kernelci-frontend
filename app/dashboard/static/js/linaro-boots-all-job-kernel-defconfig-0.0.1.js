var jobName = $('#job-name').val();
var kernelName = $('#kernel-name').val();
var defconfigFull = $('#defconfig-full').val();
var pageLen = $('#page-len').val();
var searchFilter = $('#search-filter').val();
var fileServer = $('#file-server').val();

function populateBootsTable(data) {
    'use strict';
    var localData = data.result,
        dataLen = localData.length,
        table = null;

    if (dataLen > 0) {
        table = $('#boots-table').dataTable({
            'dom': '<"row"<"col-xs-12 col-sm-12 col-md-6 col-lg-6"' +
                '<"length-menu"l>>' +
                '<"col-xs-12 col-sm-12 col-md-4 col-lg-4 col-lg-offset-2"f>r' +
                '<"col-xs-12 col-sm-12 col-md-12 col-lg-12"t>>' +
                '<"row"<"col-xs-12 col-sm-12 col-md-6 col-lg-6"i>' +
                '<"col-xs-12 col-sm-12 col-md-6 col-lg-6"p>>',
            'language': {
                'lengthMenu': '_MENU_&nbsp;<strong>boot reports ' +
                    'per page</strong>',
                'zeroRecords': '<h4>No boot reports to display.</h4>',
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
                    'data': 'board',
                    'title': 'Board Model',
                    'render': function(data, type, object) {
                        return '<a class="table-link" href="/boot/' + data +
                            '/job/' + jobName + '/kernel/' +
                            kernelName + '/">' + data + '</a>';
                    }
                },
                {
                    'data': 'lab_name',
                    'title': 'Lab Name',
                    'render': function(data, type, object) {
                        return '<a class="table-link" href="/boot/all/lab/' +
                            data + '/">' + data + '</a>';
                    }
                },
                {
                    'data': 'boot_result_description',
                    'title': 'Failure Reason',
                    'type': 'string',
                    'render': function(data, type, object) {
                        var display = '',
                            status = object.status;
                        if (data !== null && status !== 'PASS') {
                            if (data.length > 45) {
                                display = '<span rel="tooltip" ' +
                                    'data-toggle="tooltip"' +
                                    'title="' + data + '">' +
                                    data.slice(0, 46) + '&hellip;</span>';
                            } else {
                                display = data;
                            }
                        }
                        return display;
                    }
                },
                {
                    'data': 'boot_log',
                    'title': 'Boot Log',
                    'type': 'string',
                    'render': function(data, type, object) {
                        var arch = object.arch,
                            fileServerUrl = object.file_server_url,
                            fileServerResource = object.file_server_resource,
                            defconfigFull = object.defconfig_full,
                            labName = object.lab_name,
                            logPath = null,
                            fileServerUri = null,
                            pathUrl = null,
                            uriPath = null,
                            bootLog = data,
                            bootLogHtml = object.boot_log_html,
                            display = '';

                        if (fileServerUrl !== null &&
                                fileServerUrl !== undefined) {
                            fileServer = fileServerUrl;
                        }

                        if (fileServerResource !== null &&
                                fileServerResource !== undefined) {
                            pathUrl = fileServerResource;
                        } else {
                            pathUrl = jobName + '/' + kernelName + '/' +
                                arch + '-' + defconfigFull + '/';
                        }

                        fileServerUri = new URI(fileServer);
                        uriPath = fileServerUri.path() + '/' + pathUrl;

                        if (bootLog !== null) {
                            if (bootLog.search(labName) === -1) {
                                logPath = uriPath + '/' + labName + '/' +
                                bootLog;
                            } else {
                                logPath = uriPath + '/' + bootLog;
                            }
                            display += '<span rel="tooltip" ' +
                                'data-toggle="tooltip" ' +
                                'title="View raw text boot log"><a href="' +
                                fileServerUri
                                    .path(logPath)
                                    .normalizePath().href() +
                                '">txt' +
                                '&nbsp;<i class="fa fa-external-link">' +
                                '</i></a></span>';
                        }

                        if (bootLogHtml !== null) {
                            if (bootLog !== null) {
                                display += '&nbsp;&mdash;&nbsp;';
                            }
                            if (bootLogHtml.search(labName) === -1) {
                                logPath = uriPath + '/' + labName + '/' +
                                    bootLogHtml;
                            } else {
                                logPath = uriPath + '/' + bootLogHtml;
                            }
                            display += '<span rel="tooltip" ' +
                                'data-toggle="tooltip" ' +
                                'title="View HTML boot log"><a href="' +
                                fileServerUri
                                    .path(logPath)
                                    .normalizePath().href() +
                                '">html&nbsp;<i class="fa fa-external-link">' +
                                '</i></a></span>';
                        }
                        return display;
                    }
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
                                    'title="Boot completed">' +
                                    '<span class="label label-success">' +
                                    '<i class="fa fa-check"></i></span>' +
                                    '</span>';
                                break;
                            case 'FAIL':
                                displ = '<span rel="tooltip" ' +
                                    'data-toggle="tooltip"' +
                                    'title="Boot failed">' +
                                    '<span class="label label-danger">' +
                                    '<i class="fa fa-exclamation-triangle">' +
                                    '</i></span></span>';
                                break;
                            case 'OFFLINE':
                                displ = '<span rel="tooltip"' +
                                    'data-toggle="tooltip"' +
                                    'title="Board offline"' +
                                    '<span class="label label-info">' +
                                    '<i class="fa fa-power-off">' +
                                    '</i></span></span>';
                                break;
                            default:
                                displ = '<span rel="tooltip" ' +
                                    'data-toggle="tooltip"' +
                                    'title="Unknown status">' +
                                    '<span class="label label-warning">' +
                                    '<i class="fa fa-question">' +
                                    '</i></span></span>';
                                break;
                        }
                        return displ;
                    }
                },
                {
                    'data': 'board',
                    'title': '',
                    'orderable': false,
                    'searchable': false,
                    'className': 'pull-center',
                    'render': function(data, type, object) {
                        var lab = object.lab_name;

                        return '<span rel="tooltip" data-toggle="tooltip"' +
                            'title="Details for board&nbsp;' + data +
                            '&nbsp;with&nbsp;' +
                            jobName + '&dash;' + kernelName + '&dash;' +
                            defconfigFull +
                            '&nbsp;&dash;&nbsp;(' + lab + ')' +
                            '"><a href="/boot/' + data + '/job/' + jobName +
                            '/kernel/' + kernelName + '/defconfig/' +
                            defconfigFull +
                            '/lab/' + lab + '/?_id=' + object._id.$oid + '">' +
                            '<i class="fa fa-search"></i></a></span>';
                    }
                }
            ]
        });

        $(document).on('click', '#labtable tbody tr', function() {
            var localTable = table.fnGetData(this),
                location = '#';
            if (localTable) {
                location = '/boot/' + localTable.board + '/job/' +
                    localTable.job + '/kernel/' + localTable.kernel +
                    '/defconfig/' + localTable.defconfig_full + '/lab/' +
                    localTable.lab_name + '/';
                if (localTable._id !== null) {
                    location += '?_id=' + localTable._id.$oid;
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
    } else {
        $('#table-loading').remove();
        JSBase.replaceContentByID(
            '#table-div',
            '<strong>No boot reports found.</strong>');
    }
}

function ajaxDeferredFailed() {
    'use strict';
    $('#table-loading').remove();
    JSBase.replaceContentByID(
        '#table-div',
        '<strong>Error loading data.</strong>');
}

$(document).ready(function() {
    'use strict';
    $('#li-boot').addClass('active');
    $('#table-div').hide();

    var ajaxDeferredCall = null,
        ajaxData = null,
        errorReason = 'Error loading boot reports data';

    JSBase.replaceContentByID(
        '#dd-tree',
        '<span rel="tooltip" data-toggle="tooltip" ' +
        'title="Boot details for&nbsp;' + jobName + '">' +
        '<a href="/boot/all/job/' + jobName + '">' + jobName +
        '</a></span>' +
        '&nbsp;&mdash;&nbsp;' +
        '<span rel="tooltip" data-toggle="tooltip" ' +
        'title="Details for job&nbsp;' + jobName +
        '"><a href="/job/' + jobName +
        '"><i class="fa fa-sitemap"></i></a></span>'
    );
    JSBase.replaceContentByID(
        '#dd-git-describe',
        '<span rel="tooltip" data-toggle="tooltip" ' +
        'title="Boot report details for&nbsp;' + jobName +
        '&nbsp;&dash;&nbsp;' +
        kernelName + '"><a href="/boot/all/job/' + jobName +
        '/kernel/' + kernelName + '">' + kernelName +
        '</a></span>' +
        '&nbsp;&mdash;&nbsp;' +
        '<span rel="tooltip" data-toggle="tooltip" ' +
        'title="Details for build&nbsp;' + jobName +
        '&nbsp;&dash;&nbsp;' +
        kernelName + '"><a href="/build/' + jobName +
        '/kernel/' + kernelName +
        '"><i class="fa fa-cube"></i></a></span>'
    );
    JSBase.replaceContentByID(
        '#dd-defconfig',
        defconfigFull + '&nbsp;&mdash;&nbsp;' +
        '<span rel="tooltip" data-toggle="tooltip" title="' +
        'Details for build&nbsp;' + jobName + '&nbsp;&dash;&nbsp;' +
        kernelName + '&nbsp;&dash;&nbsp;' + defconfigFull + '">' +
        '<a href="/build/' + jobName + '/kernel/' + kernelName + '/defconfig/' +
        defconfigFull + '/"><i class="fa fa-cube"></i></a></span>'
    );

    ajaxData = {
        'job': jobName,
        'kernel': kernelName,
        'defconfig_full': defconfigFull
    };
    ajaxDeferredCall = JSBase.createDeferredCall(
        '/_ajax/boot',
        'GET',
        ajaxData,
        null,
        ajaxDeferredFailed,
        errorReason
    );

    $.when(ajaxDeferredCall).done(populateBootsTable);
});
