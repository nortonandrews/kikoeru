import { Component, createRef } from 'inferno';
import { connect } from 'inferno-redux';

const mapStateToProps = state => ({
  playing: state.playing,
  progress: state.progress,
  seek: state.seek,
  source: state.queue[state.queueIndex]
    ? `/api/stream/${state.queue[state.queueIndex].hash}` : null,
});

class AudioElement extends Component {
  eventHandlers = {
    play: () => {
      const { dispatch } = this.props;
      dispatch({ type: 'PLAY' });
    },
    pause: () => {
      const { dispatch } = this.props;
      dispatch({ type: 'PAUSE' });
    },
    ended: () => {
      const { dispatch } = this.props;
      dispatch({ type: 'NEXT_TRACK' });
    },
    timeUpdate: (evt) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'TIME_UPDATE',
        payload: evt.target.currentTime / evt.target.duration * 100,
      });
    },
  };

  constructor(props) {
    super(props);
    this.audioRef = createRef();
  }

  componentDidMount() {
    // Add event listeners.
    this.audioRef.current.addEventListener('play', this.eventHandlers.play);
    this.audioRef.current.addEventListener('pause', this.eventHandlers.pause);
    this.audioRef.current.addEventListener('ended', this.eventHandlers.ended);
    this.audioRef.current.addEventListener('timeupdate', this.eventHandlers.timeUpdate);
  }

  shouldComponentUpdate(nextProps) {
    const {
      playing, seek, source,
    } = this.props;

    // Started playing, don't update.
    if (!playing && nextProps.playing) {
      this.audioRef.current.play();
    }

    // Paused, don't update.
    if (playing && !nextProps.playing) {
      this.audioRef.current.pause();
    }

    // Seeked, don't update.
    if (seek !== nextProps.seek) {
      this.audioRef.current.currentTime = nextProps.seek * 0.01 * this.audioRef.current.duration;
    }

    // Changed source, update component.
    if (source !== nextProps.source) {
      return true; // TODO: maybe just update source property and not re-render?
    }

    return false;
  }

  componentWillUnmount() {
    // Remove event listeners.
    this.audioRef.current.removeEventListener('play', this.eventHandlers.play);
    this.audioRef.current.removeEventListener('pause', this.eventHandlers.pause);
    this.audioRef.current.removeEventListener('ended', this.eventHandlers.ended);
    this.audioRef.current.removeEventListener('timeupdate', this.eventHandlers.timeUpdate);
  }

  render() {
    const { playing, source } = this.props;

    if (this.audioRef.current) {
      if (source) {
        this.audioRef.current.src = source;
        this.audioRef.current.load();

        if (playing) {
          this.audioRef.current.play();
        }
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio id="audio-element" ref={this.audioRef}>
        {source ? <source src={source} /> : null}
      </audio>
    );
  }
}

export default connect(mapStateToProps)(AudioElement);
