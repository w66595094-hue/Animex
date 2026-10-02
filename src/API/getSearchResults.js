import { SEARCH_QUERY_URL } from '../constants';

const getSearchResults = searchQuery => fetch(
"${SEARCH_QUERY_URL}${encodeURIComponent(searchQuery)}",
)
.then(response => {
if (!response.ok) {
throw new Error('Unable to fetch search results');
}
return response.json();
})
.then(response => response.data);

export default getSearchResults;
