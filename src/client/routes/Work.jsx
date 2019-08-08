import { Component } from 'inferno';

import WorkDetails from '../components/WorkDetails';
import WorkQueue from '../components/WorkQueue';

/**
 * Work page. Shows metadata and files for a specific work.
 */
class Work extends Component {
  constructor(props) {
    super(props);

    this.state = {
      metadata: null,
      tracks: null,
    };

    this.fileOptions = [
      { text: 'Add to queue', type: 'ADD_TO_QUEUE' },
      { text: 'Play next', type: 'PLAY_NEXT' },
    ];
  }

  componentDidMount() {
    const { match } = this.props;

    // TODO: test if status code is 200, show error UI otherwise
    const metadataPromise = fetch(`/api/work/${match.params.rjcode}`).then(res => res.json());
    const tracksPromise = fetch(`/api/tracks/${match.params.rjcode}`).then(res => res.json());

    Promise.all([metadataPromise, tracksPromise])
      .then(res => this.setState({
        metadata: res[0],
        tracks: res[1].map((track) => {
          // TODO: mixing id with rjcode smells fishy . test if breaks anything on < 6 digit ids
          // eslint-disable-next-line no-param-reassign
          track.id = match.params.rjcode;
          return track;
        }),
      }))
      .catch((err) => {
        throw new Error(`Failed to fetch work from backend: ${err}`);
      });
  }

  render() {
    const { metadata, tracks } = this.state;

    // Metadata still loading, render spinner.
    // TODO: fix positioning and overflow on this spinner
    if (!metadata || !tracks) {
      return (
        <div className="uk-cover-container" uk-height-viewport>
          <div className="uk-position-center" uk-spinner="ratio: 2" />
        </div>
      );
    }

    // Metadata ready, render the work page.
    return (
      <>
        <WorkDetails metadata={metadata} />
        <div
          className="uk-margin-remove-top"
          style={{
            'background-size': 'cover',
            'background-image': `linear-gradient(#fff, #fff5), url("/api/cover/${metadata.id}")`,
          }}
        >
          <WorkQueue queue={tracks} fileOptions={this.fileOptions} />
        </div>
      </>
    );
  }
}

export default Work;
