import { GENRE_SEARCH_URL } from '../constants';

const getGenreList = genreId => fetch("${GENRE_SEARCH_URL}${genreId}")
.then(response => {
if (!response.ok) {
throw new Error('Unable to fetch genre list');
}
return response.json();
})
.then(response => response.data);

export default getGenreList;
