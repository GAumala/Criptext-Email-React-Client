import React from 'react';
import PropTypes from 'prop-types';
import data from './../data/welcome';
import Lottie from './Lottie';
import './welcome.css';
const ARTICLE_AMOUNT = Object.keys(data).length;

const Welcome = props => (
  <div className="welcome-container">
    <div className="welcome-content">
      <section>{renderArticle(props.articleSelected)}</section>
      {renderDots(props.articleSelected)}
      {props.articleSelected === ARTICLE_AMOUNT ? (
        <button
          className="button-x"
          onClick={() => props.onClickCloseWelcome()}
        >
          <i className="icon-exit" />
        </button>
      ) : null}
      {props.articleSelected !== 1 ? (
        <button
          className="button-a-circle back"
          onClick={() => props.onClickBackArticle()}
        >
          <i className="icon-back" />
        </button>
      ) : null}
      {props.articleSelected !== ARTICLE_AMOUNT ? (
        <button
          className="button-a-circle next"
          onClick={() => props.onClickNextArticle()}
        >
          <i className="icon-next" />
        </button>
      ) : null}
    </div>
    <div className="welcome-overlay" />
  </div>
);

const renderArticle = articleId => (
  <Article key={articleId} article={data[articleId]} />
);

const Article = props => {
  return (
    <article>
      <Lottie
        options={props.article.defaultOptions}
        height={'100px'}
        width={'100%'}
        speed={props.article.speed}
      />
      <span>{props.article.title}</span>
      <p>{props.article.description}</p>
    </article>
  );
};

const renderDots = itemSelected => (
  <div className="dots-container">
    {Object.keys(data).map((item, index) => {
      const dotSelected = itemSelected === Number(item);
      return (
        <div key={index} className={'dot' + (dotSelected ? ' selected' : '')} />
      );
    })}
  </div>
);

Article.propTypes = {
  article: PropTypes.object
};

Welcome.propTypes = {
  articleSelected: PropTypes.number,
  onClickBackArticle: PropTypes.func,
  onClickCloseWelcome: PropTypes.func,
  onClickNextArticle: PropTypes.func
};

export default Welcome;
