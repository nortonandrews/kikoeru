import { Component } from 'inferno';

import InfiniteScroll from '../components/InfiniteScroll';
import WorkDetails from '../components/WorkDetails';

/**
 * Card component for a single work.
 */
class WorkCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      metadata: null,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    fetch(`/api/work/${id}`)
      .then((res) => res.json())
      .then((res) => {
        this.setState({ metadata: res });
      })
      .catch((err) => {
        throw new Error(`Failed to fetch /api/work/${id}: ${err}`);
      });
  }

  render() {
    const { metadata } = this.state;

    // If metadata is still loading, render spinner.
    let innerElement = (<div className="uk-position-center" uk-spinner="ratio: 2" />);

    // Otherwise, render WorkDetails component with the fetched metadata.
    if (metadata) {
      innerElement = (<WorkDetails metadata={metadata} />);
    }

    return (
      <div
        className="uk-card uk-card-default uk-margin-bottom uk-width-1-2-margin@s uk-width-1-3-margin@m"
        style={{ 'max-width': '550px', margin: '8px' }}
      >
        {innerElement}
      </div>
    );
  }
}

/**
 * Work list component.
 */
class Works extends Component {
  constructor(props) {
    super(props);

    this.state = {
      works: null,
      oldestId: null,
      hasMore: true,
      pageTitle: null,
    };

    this.loadMore = this.loadMore.bind(this);
  }

  // TODO: componentDidMount and loadMore have a lot of common code. refactor?
  componentDidMount() {
    const { match, restrict } = this.props;

    const url = match.params.id
      ? `/api/${restrict || 'works'}/${match.params.id}` : '/api/works/';

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        fetch(`/api/get-name/${restrict}/${match.params.id}`)
          .then((nameRes) => nameRes.text())
          .then((name) => {
            let pageTitle;

            switch (restrict) {
              case 'tag':
                pageTitle = 'Works tagged with ';
                break;
              case 'va':
                pageTitle = 'Works voiced by ';
                break;
              case 'circle':
                pageTitle = 'Works by ';
                break;
              default:
                pageTitle = 'All works';
            } pageTitle += name || '';

            this.setState({
              works: res,
              oldestId: res[res.length - 1].id,
              pageTitle,
            });
          });
      })
      .catch((err) => {
        throw new Error(`Failed to fetch ${url}: ${err}`);
      });
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { match: prevMatch } = prevProps;

    if (match.params.id !== prevMatch.params.id) {
      this.componentDidMount();
    }
  }

  loadMore() {
    const { match, restrict } = this.props;
    const { works, oldestId } = this.state;

    const url = match.params.id
      ? `/api/${restrict || 'works'}/${match.params.id}/${oldestId}` : `/api/works/${oldestId}`;

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (!res.length) {
          this.setState({
            hasMore: false,
          });
        } else {
          this.setState({
            works: works.concat(res),
            oldestId: res[res.length - 1].id,
          });
        }
      })
      .catch((err) => {
        throw new Error(`Failed to fetch ${url}: ${err}`);
      });
  }

  render() {
    const { works, pageTitle, hasMore } = this.state;

    if (!works) {
      return (
        <div className="uk-cover-container" uk-height-viewport>
          <div className="uk-position-center" uk-spinner="ratio: 2" />
        </div>
      );
    }

    return (
      <div className="uk-container uk-margin-top">
        <h2>{pageTitle}</h2>
        <InfiniteScroll
          className="uk-flex uk-flex-center uk-flex-wrap"
          style={{ margin: '-12px -12px' }}
          dataLength={works.length}
          next={this.loadMore}
          hasMore={hasMore}
          loader={<div className="uk-align-center uk-margin-top uk-margin" uk-spinner="ratio: 1" />}
          endMessage={<p className="uk-text-center uk-text-meta" style={{ 'padding-bottom': '24px' }}>No more works.</p>}
        >
          {works.map((work) => <WorkCard id={work.id} key={work.id} />)}
        </InfiniteScroll>
      </div>
    );
  }
}

export default Works;
