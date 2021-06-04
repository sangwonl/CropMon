/* eslint-disable react/display-name */
/* eslint-disable import/prefer-default-export */

import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './MarkdownPage.css';

export interface MarkdownPageProps {
  markdown: string;
}

export const MarkdownPage = (props: MarkdownPageProps) => {
  const { markdown } = props;
  return (
    <div className={styles.container}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
