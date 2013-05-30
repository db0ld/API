var endpoint = 'http://' + location.host + '/api/v1/';
var postFieldCount = 0;

$(document).ready(function() {
    $('#urlbase').text(endpoint);

    $('#http-method-tabs li').on('click', function(e) {
        $('#http-params > div').addClass('hidden');
        $('#http-method-tabs li').removeClass('active');
        $('#' + e.currentTarget.id).addClass('active');
        $('#' + e.currentTarget.id + '-content').removeClass('hidden');
    });

    $('#send').on('click', function(e) {
        e.preventDefault();

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
                $('#result').text('Error: ' + textStatus + '\n' + errorThrown + '\n' + jqXHR.responseText);
            },
            data: data
        });
    });
});
