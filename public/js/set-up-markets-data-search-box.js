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

function setUpSearchBox () {

	const searchBox = document.querySelector('.js-search-box');
	const searchResultsUl = document.querySelector('.js-search-results');

	const onSearchType = debounce(ev => {
		// query markets data
		return fetch('http://markets.ft.com/research/webservices/securities/v1/search?source=7d373767c4bc81a4&query=' + searchBox.value)
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
						'<button class="o-buttons">Buy</button> <input type="text" placeholder="quantity (default 1)" /> ' +
						'<a href="/funds/' + thing.symbol + '?companyName=' + thing.name + '">See details</a>' +
						'</div>' +
						'</li>';
				})

			})
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
