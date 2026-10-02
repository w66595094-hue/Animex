import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import getAnimeDetails from '../API/getAnimeDetails';
import addAnimeDetails from '../store/actions/addAnimeDetails';
import Loading from '../components/Loading';

const mapDispatchToProps = dispatch => ({
  animeDetailsAdder: anime => dispatch(addAnimeDetails(anime)),
});

const mapStateToProps = state => ({
  animeDetails: state.animeDetails,
});

const AnimeDetails = ({
  animeDetailsAdder,
  animeDetails,
  match,
}) => {
  const { animeId } = match.params;

  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      getAnimeDetails(animeId)
        .then(anime => {
          if (!anime) {
            throw new Error('Anime details not found');
          }

          if (active) {
            animeDetailsAdder(anime);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setError('Unable to load anime details. Please try again.');
            setLoading(false);
          }
        });
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [animeId, animeDetailsAdder]);

  const routeChange = () => {
    history.goBack();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <main className="anime-error">
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
        <button type="button" onClick={routeChange}>
          Go Back
        </button>
      </main>
    );
  }

  const details = animeDetails || {};

  if (
    !details.mal_id ||
    details.mal_id !== parseInt(animeId, 10)
  ) {
    return <Loading />;
  }

  const imageUrl =
    details.images &&
    details.images.webp &&
    details.images.webp.large_image_url
      ? details.images.webp.large_image_url
      : '';

  const genres = details.genres || [];

  return (
    <main>
      <div
        className="blurred-background"
        style={{
          backgroundImage: imageUrl
            ? `linear-gradient(180deg, rgba(27,27,27,0.38) 0%, rgba(27,27,27,0.96) 65%), url("${imageUrl}")`
            : 'none',
          position: 'fixed',
        }}
      />

      <button
        type="button"
        className="go-back"
        onClick={routeChange}
      >
        <i className="fas fa-angle-left" />
        {' '}
        Back
      </button>

      <div className="anime-details">

        <div className="anime__img">

          {imageUrl ? (
            <img src={imageUrl} alt={details.title || 'Anime'} />
          ) : (
            <div className="anime-image-placeholder">
              Image not available
            </div>
          )}

          <div className="anime__watch-links">

            {details.url ? (
              <a
                href={details.url}
                target="_blank"
                rel="noopener noreferrer"
                className="watch"
              >
                <i className="fas fa-play-circle" />
                <span>&nbsp; Watch Now</span>
              </a>
            ) : null}

            {details.trailer_url ? (
              <a
                href={details.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer"
              >
                <i className="fas fa-play-circle" />
                <span>&nbsp; View Trailer</span>
              </a>
            ) : (
              <p>
                <i className="fas fa-exclamation-circle" />
                &nbsp; Trailer not available
              </p>
            )}

          </div>
        </div>

        <div className="anime-info">

          <h1 className="anime__title">
            {details.title || 'Unknown Anime'}
          </h1>

          <div className="anime__genres">
            {genres.map(genre => (
              <Link
                key={genre.mal_id}
                to={`/genre/${genre.mal_id}/${genre.name}`}
              >
                {genre.name}
              </Link>
            ))}
          </div>

          {details.score !== null &&
          details.score !== undefined ? (
            <div className="anime__score">
              <i className="fas fa-star-half-alt" />
              <span>{details.score}</span>
            </div>
          ) : (
            <p>Score not available</p>
          )}

          <p>
            Type: {details.type || 'Unknown'}
          </p>

          <p>
            Released:
            {' '}
            {details.aired && details.aired.string
              ? details.aired.string
              : 'Unknown'}
          </p>

          <p>
            Airing:
            {' '}
            {details.airing === true ? (
              <i className="fas fa-check" />
            ) : (
              <i className="fas fa-times" />
            )}
          </p>

          <p>
            Duration: {details.duration || 'Unknown'}
          </p>

          <p>
            {details.synopsis || 'Synopsis not available'}
          </p>

        </div>
      </div>
    </main>
  );
};

AnimeDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      animeId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,

  animeDetailsAdder: PropTypes.func.isRequired,

  animeDetails: PropTypes.shape({
    mal_id: PropTypes.number,
    images: PropTypes.object,
    url: PropTypes.string,
    trailer_url: PropTypes.string,
    title: PropTypes.string,
    genres: PropTypes.array,
    score: PropTypes.number,
    aired: PropTypes.object,
    type: PropTypes.string,
    airing: PropTypes.bool,
    duration: PropTypes.string,
    synopsis: PropTypes.string,
  }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnimeDetails);
