import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import * as api from '../../../api';

import groupBy from 'lodash/groupBy';
import pluralize from 'pluralize';

import { updateFavoriteStatus } from '../../../actions/persons-actions';
import { schema } from '../../../reducers/persons-reducer';

import Spinner from '../inline-spinner/inline-spinner';
import { Link } from 'react-router';

import orderBy from 'lodash/orderBy';
import ListItem from '../list-item-show/list-item-show';

const mapStateToProps = ({ persons }) => ({ persons });
const mapDispatchToProps = { updateFavoriteStatus };

const Media = React.createClass({
  propTypes: propTypes({
    persons: schema,
    posterUrl: t.String,
    title: t.String,
    tagline: t.String,
    externalIds: t.maybe(
      t.list(
        t.struct({
          resource: t.String,
          url: t.String
        })
      )
    ),
    fields: t.list(
      t.struct({
        field: t.String,
        value: t.union([t.String, t.Number])
      })
    ),
    content: t.maybe(t.ReactNode),
    credits: t.maybe(t.Object),
    movies: t.maybe(t.Object),
    tv: t.maybe(t.Object),
    updateFavoriteStatus: t.Function
  }),
  renderPersons(title, cast) {
    const { persons: { changingStatusKey, persons }, updateFavoriteStatus } = this.props;

    return (
      <div key={title}>
        <div className={styles.castTitle}>
          {title}:
        </div>
        {
          cast.map(person => {
            const isFavorite = persons[person.id].isFavorite;

            const body = (
              <div className={`${styles.castActionWrapper} ${!isFavorite ? styles.castOnHover : ''}`}>
                <div onClick={() => updateFavoriteStatus(person.id)} className={styles.castAction}>
                  {
                    person.id === changingStatusKey ? <Spinner /> :
                      (isFavorite ? '[Added]' : '[Add]')
                  }
                </div>
              </div>
            );

            return (
              <div className={styles.castPersonContainer}>
                <ListItem
                  key={person.cast_id || person.credit_id}
                  posterUrl={api.getTmdbPosterUrl(person.profile_path)}
                  title={<Link to={`/persons/tmdb/${person.id}`}>{person.name}</Link>}
                  body={body} />
              </div>
            );
          })
        }
      </div>
    );
  },
  renderCrew(crew) {
    const xs = ['Director', 'Writer', 'Producer', 'Music'];
    const groups = groupBy(crew, person => person.job);

    return Object.keys(groups).filter(job => xs.indexOf(job) > -1).map(job => (
      this.renderPersons(pluralize(job, groups[job].length), groups[job])
    ));
  },
  renderMovieList(media) {
    return orderBy(media.cast, 'release_date', 'desc').map((media, index) => (
      <ListItem
        key={index}
        posterUrl={api.getTmdbPosterUrl(media.poster_path)}
        title={<Link to={`/movies/tmdb/${media.id}`}>{media.title}</Link>}
        body={media.release_date} />
    ));
  },
  renderTvList(media) {
    return orderBy(media.cast, 'first_air_date', 'desc').map((media, index) => (
      <ListItem
        key={index}
        posterUrl={api.getTmdbPosterUrl(media.poster_path)}
        title={<Link to={`/shows/tmdb/${media.id}`}>{media.name}</Link>}
        body={media.first_air_date} />
    ));
  },
  render() {
    const {
      posterUrl,
      title,
      tagline,
      fields,
      externalIds,
      content,
      credits,
      movies,
      tv
    } = this.props;

    return (
      <div>
        <div className={styles.container}>
          <img src={posterUrl} className={`${styles.poster} grow`} />
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.tagline}>{tagline}</div>

            {
              externalIds && (
                <div className={styles.externalIds}>
                  {
                    externalIds.map(({ resource, url }) => (
                      <a href={url} target="_blank" key={resource}>{resource}{' '}</a>
                    ))
                  }
                </div>
              ) || null
            }

            <div className={styles.movieFields}>
              {
                fields.map(({ field, value }) => (
                  <div className={styles.movieField} key={field}>{field}: {value}</div>
                ))
              }
            </div>
          </div>
        </div>

        {content}

        {
          credits && (
            <div>
              <div className={styles.castContainer}>
                {this.renderPersons('Cast', credits.cast)}
              </div>
              <div className={styles.castContainer}>
                {this.renderCrew(credits.crew)}
              </div>
            </div>
          ) || null
        }

        {
          movies && tv && (
            <div>
              <div className={styles.castContainer}>
                {this.renderMovieList(movies)}
              </div>
              <div className={styles.castContainer}>
                {this.renderTvList(tv)}
              </div>
            </div>
          ) || null
        }
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Media);
