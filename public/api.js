	var schemas = module.exports;
	var endpoint = 'http://localhost:4242/api/';
	var postFieldCount = 0;

	$(document).ready(function() {
		for (var objType in schemas) {
			var objTypeList = $('#object');
			objTypeList.append($('<option>').attr('value', objType).text(objType));
		}

		$('#urlbase').text(endpoint);

		$('#object, #single-collection').on('click', function(e) {
			var objType = $('#object').val();
			var pathType = $('#single-collection').val() == 'single' ? 'path' : 'path_plural';

			$('#endpoint').val(schemas[objType].api[pathType]);
		});

		$('#default-post-fields').on('click', function(e) {
			var objType = $('#object').val();

			$('#objectFields').empty();
			var postFieldCount = 0;

			for (var variable in schemas[objType].schema) {
				console.log(variable);
				var type = schemas[objType].schema[variable].type;


				if (type === Date) {
					type = 'date';
				} else if (typeof type === 'undefined' && typeof schemas[objType].schema[variable] == 'object') {
					type = 'array';
				} else if (type !== 'ObjectId') {
					type = typeof type();
				}


				var fieldContainer = $('<div class="well well-small"></div>')
					.append($('<input type="text">').attr('id', 'name-' + postFieldCount).val(variable))
					.append($('<input type="text">').attr('id', 'value-' + postFieldCount));

				$('#objectFields').append(fieldContainer);
				postFieldCount++;
			}
		});

		$('#add-post-field').on('click', function(e) {
			var fieldContainer = $('<div class="well well-small"></div>')
				.append($('<input type="text">').attr('id', 'name-' + postFieldCount))
				.append($('<input type="text">').attr('id', 'value-' + postFieldCount));

			$('#objectFields').append(fieldContainer);
			postFieldCount++;
		});

		$('#reset-post-fields').on('click', function(e) {
			postFieldCount = 0;
			$('#objectFields').empty();
		});


		$('#http-method-tabs li').on('click', function(e) {
			$('#http-params > div').addClass('hidden');
			$('#http-method-tabs li').removeClass('active');
			$('#' + e.currentTarget.id).addClass('active');
			$('#' + e.currentTarget.id + '-content').removeClass('hidden');
		});

		$('#send').on('click', function(e) {
			console.log('Sending data...');
			var url = endpoint + $('#endpoint').val();
			var httpMethod = $('#http-method-tabs li.active').text().trim();
			console.log(httpMethod);
			var ajaxParams = {
				url: url,
				type: httpMethod,
				success: function(data) {
					$('#result').text(JSON.stringify(data, null, 4));
				},
				error: function(jqXHR, textStatus, errorThrown) {
					$('#result').text('Error: ' + textStatus + '\n' + errorThrown);
				},
			};

			if (httpMethod == 'POST') {
				ajaxParams.data = {'plop': 'ok'};
			} else if (httpMethod == 'PUT') {
				ajaxParams.data = 'randomdata';
			}

			$.ajax(ajaxParams);
		});
	});
