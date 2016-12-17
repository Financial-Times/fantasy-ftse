function debounce (func, wait) {
	let timeout;
	return () => {
		const args = arguments;
		const later = () => {
			timeout = null;
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

function openMarketsDataResult(e) {
	e.preventDefault();
	if(e.target.parentNode.style.height === "24px") {
		e.target.parentNode.style.height = "auto";
	} else {
		e.target.parentNode.style.height = "24px";
	}
}

function buyThing(e, symbol) {
	const tickerId = symbol.split(':')[0];
	const quantity = parseInt(e.target.previousElementSibling.value || 1);
	fetch('https://fantasy-ftse.ft.com/portfolio/buy', {
		headers:{
			'Content-Type': 'application/json',
			'userId': 'f1a0bc4b-8ddf-4954-956f-9e7429e58e41'
		},
		method:'put',
		body: JSON.stringify({
			tickerId,
			quantity
		})
	})
		.then(res => {
			return res.json();
		})
		.then(woop => {

			if(woop.err) {
				e.target.nextElementSibling.innerHTML = '<span style="color: red">' + woop.err + ': ' + woop.message + '</span>';
			} else {
				e.target.nextElementSibling.innerHTML = '<span style="color: green">Transaction successful</span>';
				refreshValues();
				console.log('winnnar', woop);
			}
		});
}

function setUpSearchBox () {

	const searchBox = document.querySelector('.js-search-box');
	const searchResultsUl = document.querySelector('.js-search-results');

	const onSearchType = debounce(ev => {
		// query markets data
		return fetch('https://markets.ft.com/research/webservices/securities/v1/search?source=59da6cdd1d8fd97c&query=' + searchBox.value)
			.then(res => {
				if(res.ok) {
					return res.json();
				} else {
					throw new Error('Oh no! ' + res.status);
				}
			})
			.then(stuff => {

				console.log('stuff', stuff);

				// show results
				searchResultsUl.innerHTML = '';
				stuff.data.searchResults.forEach(thing => {
					searchResultsUl.innerHTML = searchResultsUl.innerHTML + '' +
						'<li class="o-teaser__related-item" style="height:24px; overflow:hidden">' +
						'<a href="#" onclick="openMarketsDataResult(event)">' +
						thing.symbol + ' - '  + thing.name + ' <span style="font-size:10px;">\u25BC</span>' +
						'</a>' +
						'<div>' +
						'<input type="text" placeholder="quantity (default 1)" /> <button class="o-buttons" onclick="buyThing(event, \'' + thing.symbol + '\')">Buy</button> ' +
						'<a href="/funds/' + thing.symbol + '?companyName=' + thing.name + '">See details</a>' +
						'<div class="message"></div>' +
						'</div>' +
						'</li>';
				});
			});
	}, 150);

	searchBox.addEventListener('keyup', ev => {
		switch (ev.which) {
			case 9 : // tab
			case 13 : // enter
				return ev.preventDefault();
			default :
				onSearchType(ev);
				break;
		}
	})
}

setUpSearchBox();
