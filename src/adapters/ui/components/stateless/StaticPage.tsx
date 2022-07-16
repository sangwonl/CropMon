/* eslint-disable react/no-danger */
/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './StaticPage.css';

export type StaticPageProps = {
  // eslint-disable-next-line react/require-default-props
  markdown?: string;
  // eslint-disable-next-line react/require-default-props
  html?: string;
};

export const StaticPage = (props: StaticPageProps) => {
  const { markdown, html } = props;
  return (
    <div className={styles.container}>
      {markdown && <ReactMarkdown>{markdown}</ReactMarkdown>}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
};
