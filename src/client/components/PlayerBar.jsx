import { connect } from 'inferno-redux';
import { Link } from 'inferno-router';

import playIcon from '../static/svg/play.svg';
import pauseIcon from '../static/svg/pause.svg';

const mapStateToProps = (state) => ({
  playing: state.playing,
  queue: state.queue,
  currentlyPlaying: state.queue[state.queueIndex],
});

function PlayerBar(props) {
  const {
    dispatch, playing, queue, currentlyPlaying,
  } = props;

  // Queue is empty, don't render the player bar.
  if (queue.length === 0) {
    return null;
  }

  return (
    <>
      <div style={{ height: '32px' }} />
      <div className="k-player-bar uk-grid-small uk-flex-middle" uk-grid>

        <div className="uk-width-auto">
          <img className="uk-border-circle" src={`/api/cover/${currentlyPlaying.id}`} alt="Cover" style={{ 'object-fit': 'cover', width: '40px', height: '40px' }} />
        </div>

        <div className="uk-width-expand">
          <Link to="/player/" className="uk-link-text uk-link-reset">
            <p className="uk-margin-remove-bottom uk-text-truncate">{currentlyPlaying.title}</p>
            <p className="uk-text-meta uk-text-truncate uk-margin-remove-top uk-margin-remove-bottom">{currentlyPlaying.subtitle}</p>
          </Link>
        </div>
        <div className="uk-width-auto">
          <button className="k-player-button k-button-icon" type="button" id="middle-button" onClick={() => dispatch({ type: 'TOGGLE_PLAYING' })}>
            <img src={playing ? pauseIcon : playIcon} width="16px" height="16px" alt="Play/pause" />
          </button>
        </div>
      </div>
    </>
  );
}

export default connect(mapStateToProps)(PlayerBar);
