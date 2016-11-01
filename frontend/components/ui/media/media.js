import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { getTmdbPosterUrl } from '../../../api';

import groupBy from 'lodash/groupBy';
import pluralize from 'pluralize';

const Media = React.createClass({
  propTypes: propTypes({
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
    credits: t.maybe(t.Object)
  }),
  renderPersons(title, cast) {
    return (
      <div key={title}>
        <div>{title}:</div>
        {
          cast.map(person => (
            <div className={styles.castPersonContainer} key={person.cast_id || person.credit_id}>
              <div className={styles.castPersonImgContainer}>
                <img src={getTmdbPosterUrl(person.profile_path)} />
              </div>

              <div className={styles.castPersonName}>
                {person.name}
              </div>
            </div>
          ))
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
  render() {
    const {
      posterUrl,
      title,
      tagline,
      fields,
      externalIds,
      content,
      credits
    } = this.props;

    return (
      <div>
        <div className={styles.container}>
          <img src={posterUrl} className={styles.poster} />
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
      </div>
    );
  }
});

export default Media;
