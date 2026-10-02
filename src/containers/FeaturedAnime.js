import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import getFeaturedAnime from '../API/getFeaturedAnime';
import Loading from '../components/Loading';
import addFeaturedAnime from '../store/actions/addFeaturedAnime';

const mapDispatchToProps = dispatch => ({
  featuredAnimeAdder: anime => dispatch(addFeaturedAnime(anime)),
});

const mapStateToProps = state => ({
  featuredAnime: state.featuredAnime,
});

const FeaturedAnime = ({
  featuredAnimeAdder,
  featuredAnime,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      getFeaturedAnime()
        .then(response => {
          const animeList = Array.isArray(response)
            ? response
            : Array.isArray(response && response.data)
              ? response.data
              : Array.isArray(response && response.data && response.data.data)
                ? response.data.data
                : [];

          const validAnime = animeList.filter(
            anime => anime && anime.mal_id
          );

          if (!validAnime.length) {
            throw new Error('No anime found');
          }

          const randomIndex = Math.floor(
            Math.random() * validAnime.length
          );

          if (active) {
            featuredAnimeAdder(validAnime[randomIndex]);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setError('Unable to load featured anime. Please try again.');
            setLoading(false);
          }
        });
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [featuredAnimeAdder]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <section className="featured-anime">
        <div className="anime-info">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!featuredAnime || !featuredAnime.mal_id) {
    return <Loading />;
  }

  const imageUrl =
    featuredAnime.images &&
    featuredAnime.images.webp &&
    featuredAnime.images.webp.large_image_url
      ? featuredAnime.images.webp.large_image_url
      : '';

  const title = featuredAnime.title || 'Unknown Anime';

  const synopsis = featuredAnime.synopsis
    ? featuredAnime.synopsis.slice(0, 300)
    : 'Synopsis not available.';

  return (
    <section className="featured-anime">

      <div
        className="blurred-background"
        style={{
          backgroundImage: imageUrl
            ? `linear-gradient(180deg, rgba(27,27,27,0.6) 20%, rgba(27,27,27,1) 85%), url("${imageUrl}")`
            : 'none',
        }}
      />

      <div className="left">

        <header>
          <span className="active">overview</span>

          <span>
            <Link to={`/anime/${featuredAnime.mal_id}`}>
              details
            </Link>
          </span>
        </header>

        <h1>{title}</h1>

        <div className="stats">

          {featuredAnime.score !== null &&
           featuredAnime.score !== undefined && (
            <div className="anime__score">
              <i className="fas fa-star-half-alt" />
              <span>{featuredAnime.score}</span>
            </div>
          )}

          {featuredAnime.year && (
            <span>{featuredAnime.year}</span>
          )}

          <span>{featuredAnime.type || 'Anime'}</span>

        </div>

        <p>
          {synopsis}
          {featuredAnime.synopsis &&
           featuredAnime.synopsis.length > 300
            ? '...'
            : ''}
        </p>

        <div className="cta-btn">

          <Link to={`/anime/${featuredAnime.mal_id}`}>
            <i className="fas fa-info-circle" />
            &nbsp;
            View Details
          </Link>

          {featuredAnime.url && (
            <a
              href={featuredAnime.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-external-link-alt" />
              &nbsp;
              More Info
            </a>
          )}

        </div>

      </div>

      <div className="right">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="anime-image-placeholder">
            Image not available
          </div>
        )}

      </div>

    </section>
  );
};

FeaturedAnime.propTypes = {
  featuredAnimeAdder: PropTypes.func.isRequired,

  featuredAnime: PropTypes.shape({
    mal_id: PropTypes.number,
    images: PropTypes.object,
    title: PropTypes.string,
    score: PropTypes.number,
    year: PropTypes.number,
    type: PropTypes.string,
    synopsis: PropTypes.string,
    url: PropTypes.string,
  }),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedAnime);
