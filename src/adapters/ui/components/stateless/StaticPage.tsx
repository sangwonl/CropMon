/* eslint-disable react/no-danger */
/* eslint-disable react/display-name */

import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './StaticPage.css';

type Props = {
  // eslint-disable-next-line react/require-default-props
  markdown?: string;
  // eslint-disable-next-line react/require-default-props
  html?: string;
};

const StaticPage = (props: Props) => {
  const { markdown, html } = props;
  return (
    <div className={styles.container}>
      {markdown && <ReactMarkdown>{markdown}</ReactMarkdown>}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
};

export default StaticPage;
