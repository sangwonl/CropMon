import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './StaticPage.css';

type Props = {
  markdown?: string;
  html?: string;
};

function StaticPage(props: Props) {
  const { markdown, html } = props;
  return (
    <div className={styles.container}>
      {markdown && <ReactMarkdown>{markdown}</ReactMarkdown>}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
}

export default StaticPage;
