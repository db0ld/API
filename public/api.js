var schemas = module.exports;
var endpoint = 'http://' + location.host + '/api/';
var postFieldCount = 0;

$(document).ready(function() {
    for (var objType in schemas) {
        var objTypeList = $('#object');
        objTypeList.append($('<option>').attr('value', objType).text(objType));
    }

    $('#urlbase').text(endpoint);

    $('#object, #single-collection').on('click', function(e) {
        var objType = $('#object').val();
        var pathType = $('#single-collection').val();

        if (schemas[objType].routes && schemas[objType].routes[pathType]) {
            $('#endpoint').val(schemas[objType].routes[pathType]);
        }
    });

    $('#http-method-tabs li').on('click', function(e) {
        $('#http-params > div').addClass('hidden');
        $('#http-method-tabs li').removeClass('active');
        $('#' + e.currentTarget.id).addClass('active');
        $('#' + e.currentTarget.id + '-content').removeClass('hidden');
    });

    $('#send').on('click', function(e) {
        e.preventDefault();

        console.log('Sending data...');
        var url = endpoint + $('#endpoint').val();
        var httpMethod = $('#http-method-tabs li.active').text().trim();
        var data = null;
        if (httpMethod == 'POST' || httpMethod == 'PUT') {
            data = JSON.parse($('#textarea-' + httpMethod).val());
        }

        $.ajax({
            url: url,
            type: httpMethod,
            success: function(data) {
                $('#result').text(JSON.stringify(data, null, 4));
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#result').text('Error: ' + textStatus + '\n' + errorThrown);
            },
            data: data,
        });
    });
});
