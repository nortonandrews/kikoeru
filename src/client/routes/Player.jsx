import { Component } from 'inferno';
import { connect } from 'inferno-redux';
import { Redirect } from 'inferno-router';

import WorkQueue from '../components/WorkQueue';

import playIcon from '../static/svg/play.svg';
import pauseIcon from '../static/svg/pause.svg';
import previousIcon from '../static/svg/previous.svg';
import nextIcon from '../static/svg/next.svg';

const mapStateToProps = (state) => ({
  playing: state.playing,
  progress: state.progress,
  queue: state.queue,
  queueIndex: state.queueIndex,
});

/**
 * Player page. Contains player controls and the queue.
 */
class Player extends Component {
  constructor(props) {
    super(props);

    this.handleSeek = this.handleSeek.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.fileOptions = [
      { text: 'Remove from queue', type: 'REMOVE_FROM_QUEUE' },
      { text: 'Move up', type: 'MOVE_UP_IN_QUEUE' },
      { text: 'Move down', type: 'MOVE_DOWN_IN_QUEUE' },
    ];
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  handleSeek(evt) {
    const { dispatch } = this.props;

    dispatch({
      type: 'SEEK',
      payload: evt.currentTarget.valueAsNumber,
    });
  }

  handleClick(evt, which) {
    const { dispatch } = this.props;

    switch (which) {
      case 'previous-button':
        dispatch({ type: 'PREVIOUS_TRACK' });
        break;
      case 'middle-button':
        dispatch({ type: 'TOGGLE_PLAYING' });
        break;
      case 'next-button':
        dispatch({ type: 'NEXT_TRACK' });
        break;
      default:
        throw new Error(`Clicked on unknown element: ${which}`);
    }
  }

  // TODO: refactor into smaller components (controls, seekbar)?
  render() {
    const {
      playing, progress, queue, queueIndex,
    } = this.props;
    const currentlyPlaying = queue[queueIndex];

    if (!currentlyPlaying) {
      return (<Redirect to="/" />);
    }

    return (
      <>
        <div className="uk-background-cover uk-height-medium uk-panel uk-flex uk-flex-center uk-flex-middle" style={{ 'background-image': `linear-gradient(#0008, #0008), url("/api/cover/${currentlyPlaying.id}")` }}>
          <button className="k-player-button k-invert" type="button" id="previous-button" onClick={(evt) => this.handleClick(evt, 'previous-button')}>
            <img src={previousIcon} alt="Previous Track" />
          </button>

          <button className="k-player-button k-invert" type="button" id="middle-button" onClick={(evt) => this.handleClick(evt, 'middle-button')}>
            <img src={playing ? pauseIcon : playIcon} alt="Play" />
          </button>

          <button className="k-player-button k-invert" type="button" id="next-button" onClick={(evt) => this.handleClick(evt, 'next-button')}>
            <img src={nextIcon} alt="Next Track" />
          </button>

          <div className="uk-position-bottom k-player-seekbar">
            <input type="range" step="any" min="0" max="100" defaultValue={progress} onInput={this.handleSeek} />
            <div className="k-player-seekbar-progress">
              <div
                className="k-progress-bar"
                role="progressbar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <WorkQueue queue={queue} fileOptions={this.fileOptions} showTrashButton />
      </>
    );
  }
}

export default connect(mapStateToProps)(Player);
